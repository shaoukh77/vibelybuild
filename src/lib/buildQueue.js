/**
 * Build Queue
 * Manages app generation builds with queuing and rate limiting
 */

import { generateAppBlueprint, generateAppCode } from './modelClient';
import {
  writeBuildLog,
  updateBuildStatus,
  markBuildFailed,
  markBuildComplete
} from './logWriter';
import { generateProjectFromBlueprint } from './codegen';
import { publishToGitHub } from './publisher';
import { logError } from '@/utils/cleanError';

// In-memory queue (for now - can be upgraded to Redis/Bull later)
const buildQueue = new Map();
const activeBuild = new Map();

// Rate limiting
const MAX_CONCURRENT_BUILDS = 3;
const BUILD_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Start a build
 * @param {object} buildData - Build configuration
 * @returns {Promise<void>}
 */
export async function startBuild(buildData) {
  const { buildId, userId, prompt, target = 'web' } = buildData;

  // Check if already building
  if (activeBuild.has(buildId)) {
    throw new Error('Build already in progress');
  }

  // Add to queue
  buildQueue.set(buildId, {
    buildId,
    userId,
    prompt,
    target,
    status: 'queued',
    createdAt: Date.now()
  });

  // Process queue
  processQueue();
}

/**
 * Process the build queue
 */
async function processQueue() {
  // Check if we can start a new build
  if (activeBuild.size >= MAX_CONCURRENT_BUILDS) {
    return;
  }

  // Get next build from queue
  const nextBuild = Array.from(buildQueue.values())
    .sort((a, b) => a.createdAt - b.createdAt)[0];

  if (!nextBuild) {
    return;
  }

  // Remove from queue and mark as active
  buildQueue.delete(nextBuild.buildId);
  activeBuild.set(nextBuild.buildId, {
    ...nextBuild,
    startedAt: Date.now()
  });

  // Execute build
  executeBuild(nextBuild)
    .finally(() => {
      // Remove from active builds
      activeBuild.delete(nextBuild.buildId);

      // Process next in queue
      if (buildQueue.size > 0) {
        setTimeout(processQueue, 1000);
      }
    });
}

/**
 * Execute a single build
 * @param {object} buildData - Build configuration
 */
async function executeBuild(buildData) {
  const { buildId, userId, prompt, target } = buildData;

  // Timeout protection
  const timeoutId = setTimeout(async () => {
    await markBuildFailed(buildId, userId, new Error('Build timeout'));
  }, BUILD_TIMEOUT);

  try {
    // Step 1: Update status to running
    await writeBuildLog(buildId, userId, '🚀 Starting VibeCode build pipeline...');
    await updateBuildStatus(buildId, 'running');

    // Step 2: Generate blueprint
    await writeBuildLog(buildId, userId, '🧠 Analyzing your idea and generating app blueprint...');

    let blueprint;
    try {
      blueprint = await generateAppBlueprint(prompt, target);
      await writeBuildLog(buildId, userId, `✨ Generated blueprint for "${blueprint.appName}" (${target} app)`);
    } catch (error) {
      logError('BlueprintGeneration', error);
      await writeBuildLog(buildId, userId, `⚠️ Blueprint generation warning: ${error.message}`);
      await writeBuildLog(buildId, userId, '🔄 Using fallback blueprint structure...');

      blueprint = {
        appName: 'My App',
        target,
        pages: [{ id: 'home', title: 'Home', route: '/' }],
        dataModel: [],
        authRequired: false,
        notes: `Fallback: ${error.message}`
      };
    }

    // Step 3: Store blueprint
    await updateBuildStatus(buildId, 'running', {
      appName: blueprint.appName,
      blueprint,
      target
    });

    // Step 4: Plan architecture
    await writeBuildLog(
      buildId,
      userId,
      `📐 Planning architecture: ${blueprint.pages?.length || 0} pages, ${blueprint.dataModel?.length || 0} entities`
    );

    // Step 5: Generate code
    await writeBuildLog(buildId, userId, '💻 Generating project files from blueprint...');

    let generatedProject;
    let fileCount = 0;

    try {
      generatedProject = generateProjectFromBlueprint(buildId, blueprint);
      fileCount = Object.keys(generatedProject.files).length;

      await writeBuildLog(buildId, userId, `✅ Generated ${fileCount} files (Next.js app structure)`);

      await updateBuildStatus(buildId, 'running', {
        deployStatus: 'codegen-complete'
      });

    } catch (error) {
      logError('CodeGeneration', error);
      await writeBuildLog(buildId, userId, `❌ Code generation failed: ${error.message}`);

      await updateBuildStatus(buildId, 'failed', {
        deployStatus: 'codegen-error',
        deployError: error.message
      });

      throw error;
    }

    // Step 6: Publish to GitHub (if configured)
    const hasGitHubConfig = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER);

    if (hasGitHubConfig) {
      try {
        await writeBuildLog(buildId, userId, '📦 Publishing to GitHub...');

        const generatedFiles = Object.entries(generatedProject.files).map(([path, content]) => ({
          path,
          content: content
        }));

        const publishResult = await publishToGitHub({
          id: buildId,
          appName: blueprint.appName,
          blueprint,
          userId,
          generatedFiles
        });

        if (publishResult.success && publishResult.repoUrl) {
          await writeBuildLog(buildId, userId, `✅ Repository created: ${publishResult.repoUrl}`);
          await writeBuildLog(buildId, userId, '   Run `npm install && npm run dev` to start!');
        } else {
          await writeBuildLog(buildId, userId, `⚠️ GitHub publish failed: ${publishResult.error}`);

          await updateBuildStatus(buildId, 'running', {
            artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
            deployStatus: 'codegen-complete-no-repo',
            deployError: publishResult.error
          });
        }
      } catch (error) {
        logError('GitHubPublish', error);
        await writeBuildLog(buildId, userId, `⚠️ GitHub publish failed: ${error.message}`);

        await updateBuildStatus(buildId, 'running', {
          artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
          deployStatus: 'codegen-complete-no-repo',
          deployError: error.message
        });
      }
    } else {
      await writeBuildLog(buildId, userId, '⚠️ GitHub not configured (set GITHUB_TOKEN and GITHUB_OWNER)');
      await writeBuildLog(buildId, userId, `   ${fileCount} files generated but not published`);

      await updateBuildStatus(buildId, 'running', {
        artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
        deployStatus: 'codegen-complete-no-repo'
      });
    }

    // Step 7: Mark as complete
    await markBuildComplete(buildId, userId, {
      artifactUrl: generatedProject.artifactUrl || `https://placeholder.vibelybuild.ai/app/${buildId}`,
      fileCount
    });

    clearTimeout(timeoutId);

  } catch (error) {
    clearTimeout(timeoutId);
    logError('BuildExecution', error);
    await markBuildFailed(buildId, userId, error);
  }
}

/**
 * Get build status
 * @param {string} buildId - Build ID
 * @returns {object|null} Build status
 */
export function getBuildStatus(buildId) {
  if (activeBuild.has(buildId)) {
    return activeBuild.get(buildId);
  }

  if (buildQueue.has(buildId)) {
    return buildQueue.get(buildId);
  }

  return null;
}

/**
 * Cancel a build
 * @param {string} buildId - Build ID
 */
export function cancelBuild(buildId) {
  buildQueue.delete(buildId);
  activeBuild.delete(buildId);
}
