/**
 * Template Loader - App Template Registry
 *
 * Manages pre-built app templates that can be merged with AI-generated code.
 * Templates provide starting points for common app types.
 *
 * Future: Implement template selection UI and merge logic
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

export interface AppTemplate {
  name: string;
  id: string;
  description: string;
  category: string;
  pages: string[];
  components: string[];
  features: string[];
  techStack: string[];
}

/**
 * Get list of available templates
 */
export async function listTemplates(): Promise<AppTemplate[]> {
  try {
    const templates: AppTemplate[] = [];
    const templateDirs = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });

    for (const dir of templateDirs) {
      if (dir.isDirectory()) {
        try {
          const templateJsonPath = path.join(TEMPLATES_DIR, dir.name, 'template.json');
          const templateJson = await fs.readFile(templateJsonPath, 'utf-8');
          const template: AppTemplate = JSON.parse(templateJson);
          templates.push(template);
        } catch (error) {
          // Skip directories without template.json
          console.warn(`[TemplateLoader] No template.json found in ${dir.name}`);
        }
      }
    }

    return templates;
  } catch (error) {
    console.error('[TemplateLoader] Error loading templates:', error);
    return [];
  }
}

/**
 * Get a specific template by ID
 */
export async function getTemplate(templateId: string): Promise<AppTemplate | null> {
  const templates = await listTemplates();
  return templates.find((t) => t.id === templateId) || null;
}

/**
 * Load template files (Future implementation)
 */
export async function loadTemplateFiles(
  templateId: string
): Promise<Record<string, string>> {
  // TODO: Implement template file loading
  // This will read all files from the template directory
  // and return them as a key-value map (filepath -> content)

  console.log(`[TemplateLoader] Loading template: ${templateId}`);

  return {};
}

/**
 * Merge template with AI-generated code (Future implementation)
 */
export async function mergeTemplateWithGenerated(
  templateId: string,
  generatedFiles: Record<string, string>
): Promise<Record<string, string>> {
  // TODO: Implement merge logic
  // This will intelligently merge template files with AI-generated code
  // - Keep template components if AI didn't generate them
  // - Merge page layouts
  // - Combine styles
  // - Preserve template utilities

  console.log(`[TemplateLoader] Merging template ${templateId} with generated code`);

  // For now, just return generated files
  return generatedFiles;
}
