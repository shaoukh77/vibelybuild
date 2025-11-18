/**
 * Build Orchestrator - Production-Ready Build System
 *
 * Manages the complete build lifecycle:
 * - Job creation and tracking
 * - Real-time log streaming via SSE
 * - File system storage in .cache/
 * - Code generation
 * - Error handling and timeouts
 * - Build cancellation
 *
 * 100% Render.com compatible - no Cloud Functions
 */

import { nanoid } from 'nanoid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateProjectFromBlueprint } from '../codegen';
import { generateAppBlueprint, AppBlueprint } from '../llmProvider';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'vibecode');
const BUILD_TIMEOUT = 300000; // 5 minutes

export interface BuildJob {
  jobId: string;
  userId: string;
  prompt: string;
  target: 'web' | 'ios' | 'android' | 'multi';
  status: 'queued' | 'running' | 'complete' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  error?: string;
  blueprint?: AppBlueprint;
  outputPath?: string;
}

export interface BuildLog {
  step: string;
  timestamp: number;
  status: 'info' | 'warn' | 'error' | 'success';
  detail: string;
  progress?: number; // 0-100
}

// In-memory job registry (for single-instance deployments)
// For multi-instance, use Redis or database
const activeJobs = new Map<string, BuildJob>();
const jobLogs = new Map<string, BuildLog[]>();
const jobTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Create a new build job
 */
export async function createBuildJob(
  userId: string,
  prompt: string,
  target: 'web' | 'ios' | 'android' | 'multi' = 'web'
): Promise<BuildJob> {
  const jobId = nanoid();

  const job: BuildJob = {
    jobId,
    userId,
    prompt,
    target,
    status: 'queued',
    startedAt: Date.now(),
  };

  activeJobs.set(jobId, job);
  jobLogs.set(jobId, []);

  // Initialize job directory
  const jobDir = path.join(CACHE_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });
  await fs.mkdir(path.join(jobDir, 'generated'), { recursive: true });
  await fs.mkdir(path.join(jobDir, 'logs'), { recursive: true });

  return job;
}

/**
 * Get job status
 */
export function getJob(jobId: string): BuildJob | undefined {
  return activeJobs.get(jobId);
}

/**
 * Get job logs
 */
export function getJobLogs(jobId: string): BuildLog[] {
  return jobLogs.get(jobId) || [];
}

/**
 * Add log entry
 */
export function addJobLog(jobId: string, log: Omit<BuildLog, 'timestamp'>): void {
  const logs = jobLogs.get(jobId) || [];
  const fullLog: BuildLog = {
    ...log,
    timestamp: Date.now(),
  };
  logs.push(fullLog);
  jobLogs.set(jobId, logs);

  // Also write to file system for persistence
  const jobDir = path.join(CACHE_DIR, jobId, 'logs');
  const logFile = path.join(jobDir, 'build.log');
  fs.appendFile(logFile, JSON.stringify(fullLog) + '\n').catch(console.error);
}

/**
 * Update job status
 */
export function updateJobStatus(
  jobId: string,
  status: BuildJob['status'],
  error?: string
): void {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = status;
  if (error) job.error = error;
  if (status === 'complete' || status === 'failed' || status === 'cancelled') {
    job.completedAt = Date.now();

    // Clear timeout
    const timeout = jobTimeouts.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      jobTimeouts.delete(jobId);
    }
  }

  activeJobs.set(jobId, job);
}

/**
 * Execute build pipeline
 */
export async function executeBuild(jobId: string): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Set timeout
  const timeout = setTimeout(() => {
    addJobLog(jobId, {
      step: 'timeout',
      status: 'error',
      detail: 'Build timed out after 5 minutes',
    });
    updateJobStatus(jobId, 'failed', 'Build timeout');
  }, BUILD_TIMEOUT);
  jobTimeouts.set(jobId, timeout);

  try {
    updateJobStatus(jobId, 'running');
    addJobLog(jobId, {
      step: 'start',
      status: 'info',
      detail: '🚀 Starting VibeCode build pipeline...',
      progress: 0,
    });

    // Step 1: Generate blueprint
    addJobLog(jobId, {
      step: 'blueprint',
      status: 'info',
      detail: '🧠 Analyzing your idea and generating app blueprint...',
      progress: 10,
    });

    let blueprint: AppBlueprint;
    try {
      blueprint = await generateAppBlueprint({
        prompt: job.prompt,
        target: job.target,
      });

      job.blueprint = blueprint;
      activeJobs.set(jobId, job);

      addJobLog(jobId, {
        step: 'blueprint',
        status: 'success',
        detail: `✨ Generated blueprint for "${blueprint.appName}" (${job.target} app)`,
        progress: 30,
      });
    } catch (error: any) {
      addJobLog(jobId, {
        step: 'blueprint',
        status: 'warn',
        detail: `⚠️  Blueprint generation warning: ${error.message}`,
      });

      // Use fallback blueprint
      blueprint = {
        appName: 'My App',
        target: job.target,
        pages: [
          {
            id: 'home',
            title: 'Home',
            route: '/',
            layout: 'landing',
            sections: [{ type: 'hero', title: 'Welcome' }],
          },
        ],
        dataModel: [],
        authRequired: false,
        notes: `Fallback blueprint due to: ${error.message}`,
      };

      job.blueprint = blueprint;
      activeJobs.set(jobId, job);
    }

    // Step 2: Plan architecture
    addJobLog(jobId, {
      step: 'architecture',
      status: 'info',
      detail: `📐 Planning architecture: ${blueprint.pages.length} pages, ${blueprint.dataModel.length} entities`,
      progress: 40,
    });

    // Step 3: Generate code
    addJobLog(jobId, {
      step: 'codegen',
      status: 'info',
      detail: '💻 Generating project files from blueprint...',
      progress: 50,
    });

    const generatedProject = generateProjectFromBlueprint(jobId, blueprint);
    const fileCount = Object.keys(generatedProject.files).length;

    addJobLog(jobId, {
      step: 'codegen',
      status: 'success',
      detail: `✅ Generated ${fileCount} files (Next.js app structure)`,
      progress: 70,
    });

    // Step 4: Write files to disk
    addJobLog(jobId, {
      step: 'storage',
      status: 'info',
      detail: '💾 Writing files to storage...',
      progress: 80,
    });

    const jobDir = path.join(CACHE_DIR, jobId, 'generated');
    for (const [filePath, content] of Object.entries(generatedProject.files)) {
      const fullPath = path.join(jobDir, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    }

    job.outputPath = jobDir;
    activeJobs.set(jobId, job);

    addJobLog(jobId, {
      step: 'storage',
      status: 'success',
      detail: `✅ Saved ${fileCount} files to storage`,
      progress: 90,
    });

    // Step 5: Complete
    addJobLog(jobId, {
      step: 'complete',
      status: 'success',
      detail: '✅ Build complete! Your app is ready to preview and download.',
      progress: 100,
    });

    updateJobStatus(jobId, 'complete');

  } catch (error: any) {
    console.error(`[BuildOrchestrator] Job ${jobId} failed:`, error);

    addJobLog(jobId, {
      step: 'error',
      status: 'error',
      detail: `❌ Build failed: ${error.message}`,
    });

    updateJobStatus(jobId, 'failed', error.message);
    throw error;
  }
}

/**
 * Cancel a running build
 */
export function cancelBuild(jobId: string): boolean {
  const job = activeJobs.get(jobId);
  if (!job || job.status === 'complete' || job.status === 'failed') {
    return false;
  }

  updateJobStatus(jobId, 'cancelled');
  addJobLog(jobId, {
    step: 'cancel',
    status: 'warn',
    detail: '⚠️  Build cancelled by user',
  });

  return true;
}

/**
 * Get generated files for a job
 */
export async function getGeneratedFiles(jobId: string): Promise<string[]> {
  const job = activeJobs.get(jobId);
  if (!job || !job.outputPath) {
    return [];
  }

  const files: string[] = [];

  async function walkDir(dir: string, baseDir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        await walkDir(fullPath, baseDir);
      } else {
        files.push(relativePath);
      }
    }
  }

  try {
    await walkDir(job.outputPath, job.outputPath);
  } catch (error) {
    console.error('Error walking directory:', error);
  }

  return files;
}

/**
 * Get file content
 */
export async function getFileContent(jobId: string, filePath: string): Promise<string> {
  const job = activeJobs.get(jobId);
  if (!job || !job.outputPath) {
    throw new Error('Job not found or not complete');
  }

  const fullPath = path.join(job.outputPath, filePath);

  // Security: ensure path is within job directory
  const resolvedPath = path.resolve(fullPath);
  const jobDirResolved = path.resolve(job.outputPath);

  if (!resolvedPath.startsWith(jobDirResolved)) {
    throw new Error('Invalid file path');
  }

  const content = await fs.readFile(fullPath, 'utf-8');
  return content;
}

/**
 * Clean up old jobs (run periodically)
 */
export async function cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();

  for (const [jobId, job] of activeJobs.entries()) {
    if (job.completedAt && now - job.completedAt > maxAgeMs) {
      // Remove from memory
      activeJobs.delete(jobId);
      jobLogs.delete(jobId);

      // Remove from disk
      const jobDir = path.join(CACHE_DIR, jobId);
      try {
        await fs.rm(jobDir, { recursive: true, force: true });
      } catch (error) {
        console.error(`Failed to delete job directory ${jobId}:`, error);
      }
    }
  }
}
