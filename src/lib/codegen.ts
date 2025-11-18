/**
 * Code Generation Module - VibelyBuild.AI
 *
 * Generates real Next.js application code from blueprints.
 * Creates a production-ready app structure that can run with `npm run dev`.
 *
 * DEBUGGING: To run manually for a build:
 * ```typescript
 * import { doc, getDoc } from 'firebase/firestore';
 * import { db } from './firebase';
 * import { generateProjectFromBlueprint } from './codegen';
 *
 * const buildRef = doc(db, 'builds', 'your-build-id');
 * const snap = await getDoc(buildRef);
 * const data = snap.data();
 * const project = generateProjectFromBlueprint(data.id, data.blueprint);
 * console.log('Generated files:', Object.keys(project.files));
 * ```
 */

import type { AppBlueprint, BlueprintPage } from "./llmProvider";

export interface GeneratedProject {
  files: {
    [path: string]: string; // file path -> file content
  };
}

/**
 * Generate a complete Next.js project from a blueprint
 *
 * @param buildId - Unique build identifier
 * @param blueprint - App blueprint with pages, data model, etc.
 * @returns GeneratedProject with all file paths and contents
 */
export function generateProjectFromBlueprint(
  buildId: string,
  blueprint: AppBlueprint
): GeneratedProject {
  const files: { [path: string]: string } = {};

  // Core configuration files
  files["package.json"] = generatePackageJson(blueprint);
  files["next.config.js"] = generateNextConfig();
  files["tsconfig.json"] = generateTsConfig();
  files["tailwind.config.js"] = generateTailwindConfig();
  files["postcss.config.js"] = generatePostcssConfig();
  files[".gitignore"] = generateGitignore();
  files["README.md"] = generateReadme(blueprint);

  // Global styles with glassmorphism
  files["src/app/globals.css"] = generateGlobalStyles();

  // Root layout
  files["src/app/layout.tsx"] = generateRootLayout(blueprint);

  // Home page (first page in blueprint or default)
  const homePage = blueprint.pages[0] || createDefaultPage();
  files["src/app/page.tsx"] = generatePageComponent(homePage, blueprint, true);

  // Generate additional pages
  blueprint.pages.slice(1).forEach((page) => {
    const slug = page.route === "/" ? "home" : page.route.replace(/^\//, "");
    const pagePath = `src/app/${slug}/page.tsx`;
    files[pagePath] = generatePageComponent(page, blueprint, false);
  });

  // Shared components
  files["src/components/Navbar.tsx"] = generateNavbar(blueprint);
  files["src/components/Footer.tsx"] = generateFooter(blueprint);
  files["src/components/GlassCard.tsx"] = generateGlassCard();

  return { files };
}

/**
 * Generate package.json
 */
function generatePackageJson(blueprint: AppBlueprint): string {
  return `{
  "name": "${blueprint.appName.toLowerCase().replace(/\s+/g, "-")}",
  "version": "0.1.0",
  "private": true,
  "description": "${blueprint.notes || `${blueprint.appName} - Built with VibelyBuild.AI`}",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
`;
}

/**
 * Generate next.config.js
 */
function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
}

/**
 * Generate tsconfig.json
 */
function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

/**
 * Generate tailwind.config.js
 */
function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

/**
 * Generate postcss.config.js
 */
function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;
}

/**
 * Generate README.md
 */
function generateReadme(blueprint: AppBlueprint): string {
  return `# ${blueprint.appName}

${blueprint.notes || `A ${blueprint.target} application built with VibelyBuild.AI.`}

## Features

${blueprint.pages.map((page) => `- **${page.title}** - ${page.layout} layout`).join("\n")}

${blueprint.authRequired ? "\n- 🔐 **Authentication Required**" : ""}
${blueprint.dataModel.length > 0 ? `\n## Data Model\n\n${blueprint.dataModel.map((e) => `- ${e.name} (${e.fields.length} fields)`).join("\n")}` : ""}

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Glassmorphism UI** - Modern design

---

**Generated by VibelyBuild.AI** - [https://vibelybuild.ai](https://vibelybuild.ai)
`;
}

/**
 * Generate global styles with glassmorphism
 */
function generateGlobalStyles(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Glassmorphism Theme */
body {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: white;
}

/* Glass Card Components */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow:
    0 0 40px rgba(255, 255, 255, 0.2),
    0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
`;
}

/**
 * Generate root layout
 */
function generateRootLayout(blueprint: AppBlueprint): string {
  return `// This file was auto-generated by VibelyBuild.AI
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "${blueprint.appName}",
  description: "${blueprint.notes || `${blueprint.appName} - Built with VibelyBuild.AI`}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
`;
}

/**
 * Generate page component
 */
function generatePageComponent(
  page: BlueprintPage,
  blueprint: AppBlueprint,
  isHome: boolean
): string {
  const sectionsCode = page.sections.map((section) => {
    return generateSectionComponent(section);
  }).join("\n\n      ");

  return `// This file was auto-generated by VibelyBuild.AI from blueprint page "${page.title}"
import GlassCard from "@/components/GlassCard";

export default function ${page.id.charAt(0).toUpperCase() + page.id.slice(1)}Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ${page.title}
        </h1>

        <div className="space-y-8">
          ${sectionsCode || '          <GlassCard>\n            <p className="text-white/80">Page content goes here.</p>\n          </GlassCard>'}
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate section component based on type
 */
function generateSectionComponent(section: any): string {
  const { type, title, description, fields } = section;

  // Hero section
  if (type === "hero") {
    return `          <div className="glass-card p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">${title || "Welcome"}</h2>
            ${description ? `<p className="text-white/70 text-lg mb-6">${description}</p>` : ""}
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform">
              Get Started
            </button>
          </div>`;
  }

  // Features section
  if (type === "features") {
    return `          <GlassCard>
            <h3 className="text-2xl font-bold mb-6">${title || "Features"}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              ${[1, 2, 3].map((i) => `<div className="p-6 bg-white/5 rounded-xl">
                <div className="text-3xl mb-3">✨</div>
                <h4 className="font-semibold mb-2">Feature ${i}</h4>
                <p className="text-white/60 text-sm">Feature description goes here.</p>
              </div>`).join("\n              ")}
            </div>
          </GlassCard>`;
  }

  // Stats section
  if (type === "stats") {
    return `          <div className="grid md:grid-cols-3 gap-6">
            ${[
    { label: "Total", value: "1,234" },
    { label: "Active", value: "567" },
    { label: "Growth", value: "+23%" },
  ].map((stat) => `<GlassCard>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">${stat.value}</div>
                <div className="text-white/60">${stat.label}</div>
              </div>
            </GlassCard>`).join("\n            ")}
          </div>`;
  }

  // Form section
  if (type === "form" && fields) {
    return `          <GlassCard>
            <h3 className="text-2xl font-bold mb-6">${title || "Form"}</h3>
            <form className="space-y-4">
              ${fields.map((field) => `<div>
                <label className="block text-sm font-medium mb-2">${field.name}</label>
                <input
                  type="${field.type || "text"}"
                  placeholder="${field.placeholder || ""}"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>`).join("\n              ")}
              <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition-transform">
                Submit
              </button>
            </form>
          </GlassCard>`;
  }

  // List section
  if (type === "list") {
    return `          <GlassCard>
            <h3 className="text-2xl font-bold mb-6">${title || "Items"}</h3>
            <div className="space-y-3">
              ${[1, 2, 3].map((i) => `<div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  📌
                </div>
                <div className="flex-1">
                  <div className="font-medium">Item ${i}</div>
                  <div className="text-sm text-white/60">Item description</div>
                </div>
              </div>`).join("\n              ")}
            </div>
          </GlassCard>`;
  }

  // Default card
  return `          <GlassCard>
            <h3 className="text-2xl font-bold mb-4">${title || "Section"}</h3>
            ${description ? `<p className="text-white/70">${description}</p>` : `<p className="text-white/70">Section content goes here.</p>`}
          </GlassCard>`;
}

/**
 * Generate Navbar component
 */
function generateNavbar(blueprint: AppBlueprint): string {
  const links = blueprint.pages.slice(0, 5).map((page) => ({
    title: page.title,
    href: page.route,
  }));

  return `// This file was auto-generated by VibelyBuild.AI
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ${blueprint.appName}
          </Link>

          <div className="flex items-center gap-6">
            ${links.map((link) => `<Link
              href="${link.href}"
              className="text-white/70 hover:text-white transition-colors"
            >
              ${link.title}
            </Link>`).join("\n            ")}
            ${blueprint.authRequired ? `\n            <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform">
              Sign In
            </button>` : ""}
          </div>
        </div>
      </div>
    </nav>
  );
}
`;
}

/**
 * Generate Footer component
 */
function generateFooter(blueprint: AppBlueprint): string {
  return `// This file was auto-generated by VibelyBuild.AI
export default function Footer() {
  return (
    <footer className="glass-card mx-4 my-4 p-8">
      <div className="container mx-auto text-center">
        <p className="text-white/60">
          © {new Date().getFullYear()} ${blueprint.appName}. Built with{" "}
          <a
            href="https://vibelybuild.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            VibelyBuild.AI
          </a>
        </p>
      </div>
    </footer>
  );
}
`;
}

/**
 * Generate reusable GlassCard component
 */
function generateGlassCard(): string {
  return `// This file was auto-generated by VibelyBuild.AI
export default function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      {children}
    </div>
  );
}
`;
}

/**
 * Create a default page if blueprint has no pages
 */
function createDefaultPage(): BlueprintPage {
  return {
    id: "home",
    title: "Welcome",
    route: "/",
    layout: "landing",
    sections: [
      {
        type: "hero",
        title: "Welcome to Your App",
        description: "Built with VibelyBuild.AI",
      },
    ],
  };
}
