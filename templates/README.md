# VibeCode App Templates

This directory contains pre-built app templates that can be merged with AI-generated code.

## Template Structure

Each template folder should contain:
- `template.json` - Template metadata and configuration
- `components/` - Reusable React components
- `pages/` - Page templates
- `styles/` - CSS/Tailwind configurations
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `assets/` - Images, icons, fonts

## Available Templates

### 1. Landing Page (`/landing`)
Modern landing page with:
- Hero section with CTA
- Features grid
- Testimonials
- Pricing cards
- Footer with links

### 2. E-commerce (`/ecommerce`)
Full e-commerce store with:
- Product catalog
- Shopping cart
- Checkout flow
- User authentication
- Order management

### 3. Dashboard (`/dashboard`)
SaaS dashboard with:
- Sidebar navigation
- Data tables
- Charts and analytics
- Settings pages
- User management

## Usage

Templates are loaded by `src/lib/builder/TemplateLoader.ts` and merged with AI-generated code during the build process.

## Adding New Templates

1. Create a new folder: `templates/your-template-name/`
2. Add `template.json` with metadata
3. Add template files in appropriate subdirectories
4. Register in `TemplateLoader.ts`

## Template Format

Example `template.json`:
```json
{
  "name": "Landing Page",
  "id": "landing",
  "description": "Modern landing page with hero, features, and CTA",
  "category": "marketing",
  "pages": ["home", "about", "contact"],
  "components": ["Navbar", "Hero", "Features", "Footer"],
  "features": ["responsive", "dark-mode", "animations"],
  "techStack": ["Next.js", "Tailwind CSS", "TypeScript"]
}
```
