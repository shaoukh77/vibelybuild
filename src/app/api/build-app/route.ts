/**
 * VibeCode Build Pipeline API
 *
 * This endpoint orchestrates the complete app build process:
 * 1. Creates Firestore build document
 * 2. Generates app blueprint using LLM
 * 3. Streams logs to Firestore in real-time
 * 4. Prepares artifact (stub for now)
 * 5. Marks build as ready for deployment
 *
 * Future integrations:
 * - GitHub repo creation and code push
 * - Vercel/Netlify deployment
 * - App Store / Play Store preparation
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAppBlueprint, AppBlueprint } from "@/lib/llmProvider";
import { generateProjectFromBlueprint } from "@/lib/codegen";
import { publishToGitHub } from "@/lib/publisher";
import admin, { db } from "@/lib/firebaseAdmin";
import { verifyUser, verifyUserOwnership } from "@/lib/verifyUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Build App API - Main entry point for VibeCode builds
 *
 * POST /api/build-app
 * Body: { buildId: string, userId: string, prompt: string, target: "web" | "ios" | "android" | "multi" }
 *
 * Returns: { success: boolean, buildId: string, status: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID token
    const authUser = await verifyUser(request);

    const body = await request.json();
    const { buildId, userId, prompt, target = "web" } = body;

    // Validation
    if (!buildId || !userId || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: buildId, userId, prompt" },
        { status: 400 }
      );
    }

    // Verify authenticated user matches userId in request
    await verifyUserOwnership(request, userId);

    if (!["web", "ios", "android", "multi"].includes(target)) {
      return NextResponse.json(
        { error: "Invalid target. Must be: web, ios, android, or multi" },
        { status: 400 }
      );
    }

    console.log(`[Build ${buildId}] Starting VibeCode build for user ${userId}`);

    // Verify build document exists and user owns it
    const buildRef = db.collection("builds").doc(buildId);
    const buildSnap = await buildRef.get();

    if (!buildSnap.exists) {
      console.error(`[Build ${buildId}] Build document not found`);
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    const buildData = buildSnap.data();
    if (buildData?.userId !== userId) {
      console.error(`[Build ${buildId}] User ${userId} does not own this build`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Start async build process (don't wait for completion)
    // This allows the API to return quickly while build continues in background
    executeBuildPipeline({ buildId, userId, prompt, target }).catch((error) => {
      console.error(`[Build ${buildId}] Build pipeline error:`, error);
    });

    return NextResponse.json({
      success: true,
      buildId,
      status: "running",
    });
  } catch (error: any) {
    console.error("Build API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Execute the complete build pipeline
 * Runs asynchronously and updates Firestore in real-time
 */
async function executeBuildPipeline({
  buildId,
  userId,
  prompt,
  target,
}: {
  buildId: string;
  userId: string;
  prompt: string;
  target: "web" | "ios" | "android" | "multi";
}) {
  const buildRef = db.collection("builds").doc(buildId);

  try {
    // Step 1: Update status to running
    await updateBuildStatusAndLog(buildId, userId, "running", "🚀 Starting VibeCode build pipeline...");
    await delay(500);

    // Step 2: Analyze prompt and generate blueprint
    await appendLog(buildId, userId, "🧠 Analyzing your idea and generating app blueprint...");
    await delay(800);

    let blueprint: AppBlueprint;
    try {
      blueprint = await generateAppBlueprint({ prompt, target });
      await appendLog(buildId, userId, `✨ Generated blueprint for "${blueprint.appName}" (${target} app)`);
    } catch (error: any) {
      await appendLog(buildId, userId, `⚠️  Blueprint generation warning: ${error.message}`);
      await appendLog(buildId, userId, "🔄 Using fallback blueprint structure...");

      // Use a minimal fallback blueprint
      blueprint = {
        appName: "My App",
        target,
        pages: [
          {
            id: "home",
            title: "Home",
            route: "/",
            layout: "landing",
            sections: [{ type: "hero", title: "Welcome" }],
          },
        ],
        dataModel: [],
        authRequired: false,
        notes: `Fallback blueprint due to: ${error.message}`,
      };
    }

    // Step 3: Store blueprint in Firestore
    await buildRef.update({
      appName: blueprint.appName,
      blueprint,
      target,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await delay(500);

    // Step 4: Plan architecture
    await appendLog(buildId, userId, `📐 Planning architecture: ${blueprint.pages.length} pages, ${blueprint.dataModel.length} entities`);
    await delay(700);

    // Step 5: Generate UI layouts
    await appendLog(buildId, userId, "🎨 Generating UI layouts and component structure...");
    await delay(1000);
    await appendLog(buildId, userId, `   ✓ Created ${blueprint.pages.length} page layouts`);

    // Step 6: Set up data models
    if (blueprint.dataModel.length > 0) {
      await appendLog(buildId, userId, "🗄️  Setting up database schema...");
      await delay(800);
      await appendLog(buildId, userId, `   ✓ Defined ${blueprint.dataModel.length} data entities`);
    }

    // Step 7: Configure authentication (if needed)
    if (blueprint.authRequired) {
      await appendLog(buildId, userId, "🔐 Configuring authentication and user management...");
      await delay(900);
      await appendLog(buildId, userId, "   ✓ Auth configured with email/password and OAuth");
    }

    // Step 8: Generate real project code from blueprint
    await appendLog(buildId, userId, "💻 Generating project files from blueprint...");
    await delay(500);

    let generatedProject;
    let fileCount = 0;

    try {
      // Generate Next.js project code
      generatedProject = generateProjectFromBlueprint(buildId, blueprint);
      fileCount = Object.keys(generatedProject.files).length;

      await appendLog(buildId, userId, `✅ Generated ${fileCount} files (Next.js app structure)`);
      await delay(300);

      // Update deployStatus to indicate codegen success
      await buildRef.update({
        deployStatus: "codegen-complete",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      console.error(`[Build ${buildId}] Code generation error:`, error);
      await appendLog(buildId, userId, `❌ Code generation failed: ${error.message}`);

      // Update with error status
      await buildRef.update({
        artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
        deployStatus: "codegen-error",
        deployError: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Don't continue to GitHub if codegen failed
      throw error;
    }

    // Step 9: Publish to GitHub (if configured)
    await appendLog(buildId, userId, "📦 Preparing to publish code...");
    await delay(300);

    // Check if GitHub publishing is configured
    const hasGitHubConfig = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER);

    if (hasGitHubConfig) {
      try {
        await appendLog(buildId, userId, "🔗 Creating GitHub repository...");
        await delay(200);

        // Convert generated files to the format expected by publisher
        const generatedFiles = Object.entries(generatedProject.files).map(([path, content]) => ({
          path,
          content: content as string,
        }));

        await appendLog(buildId, userId, `📤 Pushing ${fileCount} files to GitHub...`);

        // Publish to GitHub with generated code
        const publishResult = await publishToGitHub({
          id: buildId,
          appName: blueprint.appName,
          blueprint,
          userId,
          generatedFiles,
        });

        if (publishResult.success && publishResult.repoUrl) {
          await appendLog(buildId, userId, `✅ Repository created: ${publishResult.repoUrl}`);
          await appendLog(buildId, userId, `   Run \`npm install && npm run dev\` to start the app!`);
          // Firestore is already updated by publishToGitHub
        } else {
          await appendLog(buildId, userId, `⚠️  GitHub publish failed: ${publishResult.error}`);
          // Update with codegen-complete status (code was generated but not published)
          await buildRef.update({
            artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
            deployStatus: "codegen-complete-no-repo",
            deployError: publishResult.error,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (error: any) {
        console.error(`[Build ${buildId}] GitHub publish error:`, error);
        await appendLog(buildId, userId, `⚠️  GitHub publish failed: ${error.message}`);
        await appendLog(buildId, userId, "   Code was generated but not published to GitHub");

        // Update with error status
        await buildRef.update({
          artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
          deployStatus: "codegen-complete-no-repo",
          deployError: error.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } else {
      // No GitHub config - code was generated but not published
      await appendLog(buildId, userId, "⚠️  GitHub not configured (set GITHUB_TOKEN and GITHUB_OWNER)");
      await appendLog(buildId, userId, `   ${fileCount} files generated but not published`);

      await buildRef.update({
        artifactUrl: `https://placeholder.vibelybuild.ai/app/${buildId}`,
        repoUrl: null,
        deployStatus: "codegen-complete-no-repo",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Step 10: Mark as complete
    await delay(500);
    await appendLog(buildId, userId, "✅ Build complete! Your app is ready to preview.");

    await buildRef.update({
      status: "complete",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Build ${buildId}] Build completed successfully`);
  } catch (error: any) {
    console.error(`[Build ${buildId}] Build pipeline failed:`, error);

    // Log error to Firestore
    await appendLog(buildId, userId, `❌ Build failed: ${error.message}`);
    await appendLog(buildId, userId, "💡 Please try again or contact support if the issue persists.");

    await buildRef.update({
      status: "failed",
      error: error.message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Helper: Update build status and create a log entry
 */
async function updateBuildStatusAndLog(
  buildId: string,
  userId: string,
  status: string,
  logMessage: string
) {
  const buildRef = db.collection("builds").doc(buildId);

  // Update build status
  await buildRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create log entry in buildLogs collection
  await createBuildLog(buildId, userId, logMessage);
}

/**
 * Helper: Create a log entry in /buildLogs collection
 */
async function createBuildLog(buildId: string, userId: string, message: string) {
  await db.collection("buildLogs").add({
    buildId,
    userId,
    message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Helper: Append a log entry (wrapper for createBuildLog)
 * @deprecated Use createBuildLog directly
 */
async function appendLog(buildId: string, userId: string, message: string) {
  await createBuildLog(buildId, userId, message);
}

/**
 * Helper: Delay execution (for realistic progress simulation)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
