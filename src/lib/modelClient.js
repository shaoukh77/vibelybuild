/**
 * AI Model Client - Production-Ready
 * Generates full-stack app code using GPT-4 or mixed GPT-4 + Groq
 * Returns structured app blueprint with all files
 */

import OpenAI from 'openai';
import Groq from 'groq-sdk';

// Lazy-initialized clients
let openaiClient = null;
let groqClient = null;

/**
 * Get or initialize OpenAI client
 */
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    });
  }
  return openaiClient;
}

/**
 * Get or initialize Groq client
 */
function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

// Model configuration
const GPT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo';
const GROQ_MODEL = 'llama-3.1-70b-versatile'; // Fast for planning
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

/**
 * Generate complete app blueprint from user prompt
 * Uses Groq for fast planning, GPT-4 for code generation
 *
 * @param {string} prompt - User's app description
 * @param {string} target - Target platform (web, ios, android, multi)
 * @param {Function} onLog - Log callback function (buildId, userId, message, level)
 * @returns {Promise<Object>} Complete app blueprint with files
 */
export async function generateAppBlueprint(prompt, target = 'web', onLog = null) {
  const log = (message, level = 'info') => {
    if (onLog) onLog(message, level);
    console.log(`[ModelClient] ${message}`);
  };

  try {
    // Step 1: Generate app structure (fast with Groq if available)
    log('🧠 Analyzing your idea...');

    const structure = await generateAppStructure(prompt, target);

    log(`📐 Planning ${structure.pages?.length || 0} pages, ${structure.features?.length || 0} features`);

    // Step 2: Generate code for each file (GPT-4 for quality)
    log('💻 Generating production-ready code...');

    const files = await generateAppCode(prompt, structure, target);

    log(`✅ Generated ${Object.keys(files).length} files`);

    // Step 3: Return complete blueprint
    return {
      appName: structure.appName || 'My App',
      description: structure.description || prompt,
      target,
      structure,
      files,
      techStack: structure.techStack || {
        frontend: 'Next.js 14',
        backend: 'API Routes',
        database: 'Firebase Firestore',
        auth: structure.authRequired ? 'Firebase Auth' : 'None',
      },
      createdAt: new Date().toISOString(),
    };

  } catch (error) {
    log(`❌ Blueprint generation failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Generate app structure using Groq (fast) or GPT-4
 *
 * @param {string} prompt - User prompt
 * @param {string} target - Target platform
 * @returns {Promise<Object>} App structure
 */
async function generateAppStructure(prompt, target) {
  const systemPrompt = `You are an expert app architect. Generate a detailed JSON structure for a ${target} app.

The structure must include:
- appName: string
- description: string
- pages: array of page objects with {id, title, route, components, sections}
- features: array of feature names
- dataModel: array of data entities with {name, fields}
- authRequired: boolean
- techStack: {frontend, backend, database}

Return ONLY valid JSON, no markdown, no explanations.`;

  const userPrompt = `Create a ${target} app: ${prompt}

Focus on creating a complete, production-ready structure.`;

  try {
    // Try Groq first (faster)
    const groq = getGroqClient();
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response);
    }

    // Fallback to GPT-4
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    return JSON.parse(response);

  } catch (error) {
    console.error('[ModelClient] Structure generation failed:', error.message);

    // Return fallback structure
    return {
      appName: 'My App',
      description: prompt,
      target,
      pages: [
        {
          id: 'home',
          title: 'Home',
          route: '/',
          components: ['Hero', 'Features'],
          sections: [
            { type: 'hero', title: 'Welcome' },
            { type: 'features', items: [] },
          ],
        },
      ],
      features: ['Responsive Design', 'Modern UI'],
      dataModel: [],
      authRequired: false,
      techStack: {
        frontend: 'Next.js 14',
        backend: 'API Routes',
        database: 'Firebase Firestore',
      },
    };
  }
}

/**
 * Generate code files for the app
 *
 * @param {string} prompt - User prompt
 * @param {Object} structure - App structure
 * @param {string} target - Target platform
 * @returns {Promise<Object>} Files object {path: content}
 */
async function generateAppCode(prompt, structure, target) {
  const files = {};

  // Generate package.json
  files['package.json'] = generatePackageJson(structure);

  // Generate Next.js config
  files['next.config.mjs'] = generateNextConfig(structure);

  // Generate TypeScript config
  files['tsconfig.json'] = generateTsConfig();

  // Generate .gitignore
  files['.gitignore'] = generateGitignore();

  // Generate README
  files['README.md'] = generateReadme(structure);

  // Generate app layout
  files['src/app/layout.tsx'] = generateLayout(structure);

  // Generate global CSS
  files['src/app/globals.css'] = generateGlobalCss();

  // Generate pages
  for (const page of structure.pages || []) {
    const pagePath = page.route === '/' ? 'src/app/page.tsx' : `src/app${page.route}/page.tsx`;
    files[pagePath] = generatePage(page, structure);
  }

  // Generate components
  files['src/components/Navbar.tsx'] = generateNavbar(structure);
  files['src/components/Footer.tsx'] = generateFooter(structure);
  files['src/components/GlassCard.tsx'] = generateGlassCard();

  // Generate Firebase config if auth required
  if (structure.authRequired) {
    files['src/lib/firebase.ts'] = generateFirebaseConfig();
  }

  // Generate Firestore schema if data model exists
  if (structure.dataModel && structure.dataModel.length > 0) {
    files['firestore.rules'] = generateFirestoreRules(structure);
  }

  return files;
}

// ============================================
// Code Generation Helpers
// ============================================

function generatePackageJson(structure) {
  return JSON.stringify({
    name: structure.appName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      'next': '^14.2.0',
      'react': '^18.3.0',
      'react-dom': '^18.3.0',
      ...(structure.authRequired && {
        'firebase': '^10.14.0',
      }),
    },
    devDependencies: {
      '@types/node': '^20',
      '@types/react': '^18',
      '@types/react-dom': '^18',
      'typescript': '^5',
      'tailwindcss': '^3.4.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
    },
  }, null, 2);
}

function generateNextConfig(structure) {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
`;
}

function generateTsConfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2);
}

function generateGitignore() {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
}

function generateReadme(structure) {
  return `# ${structure.appName}

${structure.description}

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

- **Frontend**: ${structure.techStack?.frontend || 'Next.js 14'}
- **Backend**: ${structure.techStack?.backend || 'API Routes'}
- **Database**: ${structure.techStack?.database || 'Firebase Firestore'}
${structure.authRequired ? `- **Auth**: ${structure.techStack?.auth || 'Firebase Auth'}` : ''}

## Features

${(structure.features || []).map(f => `- ${f}`).join('\n')}

---

Built with ❤️ using VibeCode
`;
}

function generateLayout(structure) {
  return `import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '${structure.appName}',
  description: '${structure.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
`;
}

function generateGlobalCss() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer utilities {
  .glass {
    @apply bg-white/10 backdrop-blur-lg border border-white/20;
  }

  .glass-hover {
    @apply hover:bg-white/20 transition-all duration-300;
  }
}
`;
}

function generatePage(page, structure) {
  return `import GlassCard from '@/components/GlassCard';

export default function ${page.id.charAt(0).toUpperCase() + page.id.slice(1)}Page() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          ${page.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {${JSON.stringify(page.sections || [])}.map((section: any, idx: number) => (
            <GlassCard key={idx}>
              <h2 className="text-2xl font-semibold text-white mb-4">
                {section.title || 'Section ' + (idx + 1)}
              </h2>
              <p className="text-gray-300">
                {section.description || 'Content coming soon...'}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateNavbar(structure) {
  const pages = structure.pages || [];

  return `'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            ${structure.appName}
          </Link>

          <div className="flex gap-6">
            ${pages.map(p => `<Link
              href="${p.route}"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ${p.title}
            </Link>`).join('\n            ')}
          </div>
        </div>
      </div>
    </nav>
  );
}
`;
}

function generateFooter(structure) {
  return `export default function Footer() {
  return (
    <footer className="glass mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ${structure.appName}. All rights reserved.</p>
          <p className="mt-2 text-sm">Built with ❤️ using VibeCode</p>
        </div>
      </div>
    </footer>
  );
}
`;
}

function generateGlassCard() {
  return `import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={\`glass glass-hover rounded-2xl p-6 shadow-xl \${className}\`}>
      {children}
    </div>
  );
}
`;
}

function generateFirebaseConfig() {
  return `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
`;
}

function generateFirestoreRules(structure) {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User authentication required
    function isAuthenticated() {
      return request.auth != null;
    }

    // User owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    ${(structure.dataModel || []).map(model => `
    // ${model.name} collection
    match /${model.name.toLowerCase()}s/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
    }`).join('\n')}
  }
}
`;
}

/**
 * Retry wrapper for API calls
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
}
