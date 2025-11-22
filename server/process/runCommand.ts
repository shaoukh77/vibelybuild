/**
 * Run Command - Execute shell commands and return output
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run a shell command and get its output
 */
export async function runCommand(
  command: string,
  cwd: string,
  timeoutMs: number = 60000
): Promise<CommandResult> {
  try {
    console.log(`[RunCommand] 🚀 Executing: ${command} in ${cwd}`);

    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log(`[RunCommand] ✅ Command completed successfully`);

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: any) {
    console.error(`[RunCommand] ❌ Command failed:`, error.message);

    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
    };
  }
}

/**
 * Check if a command exists on the system
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    const { exitCode } = await runCommand(`which ${command}`, process.cwd(), 5000);
    return exitCode === 0;
  } catch {
    return false;
  }
}
