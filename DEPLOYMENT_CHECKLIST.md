# VibeBuild Deployment Checklist

## Pre-Deployment Preparation

### 1. Code Preparation
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run lint` and fix any errors
- [ ] Run `npm run build` to test production build locally
- [ ] Test backend build: `npm run build:backend`
- [ ] Remove any console.logs or debug code
- [ ] Update version in `package.json`

### 2. Environment Variables Setup
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all Firebase configuration values
- [ ] Generate API secret key: `openssl rand -base64 32`
- [ ] Download Firebase service account JSON
- [ ] Extract service account values for backend

### 3. Firebase Configuration
- [ ] Create production Firebase project (if not exists)
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore database
- [ ] Deploy Firestore security rules
- [ ] Add production domain to authorized domains
- [ ] Enable Firebase Storage (if using file uploads)

## Backend Deployment (Railway or Render)

### Railway
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize project: `railway init`
- [ ] Set environment variables (see DEPLOYMENT_GUIDE.md)
- [ ] Deploy: `npm run deploy:railway`
- [ ] Copy backend URL for frontend config
- [ ] Test health endpoint: `curl https://your-app.railway.app/health`
- [ ] Configure custom domain: `api.vibelybuildai.com`

### Render (Alternative)
- [ ] Create account on Render.com
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure build/start commands
- [ ] Add environment variables
- [ ] Add persistent disk (10GB for cache)
- [ ] Deploy and wait for "Live" status
- [ ] Copy backend URL for frontend config
- [ ] Test health endpoint
- [ ] Configure custom domain: `api.vibelybuildai.com`

## Frontend Deployment (Vercel)

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Add environment variables in Vercel dashboard
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
- [ ] Deploy to production: `npm run deploy:vercel`
- [ ] Test deployment: open production URL
- [ ] Configure custom domain: `vibelybuildai.com`

## Domain Configuration

### DNS Setup
- [ ] Purchase domain `vibelybuildai.com`
- [ ] Add Vercel nameservers (recommended) OR A records
- [ ] Add CNAME for `api` subdomain pointing to backend
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Test: `nslookup vibelybuildai.com`
- [ ] Test: `nslookup api.vibelybuildai.com`

### SSL Certificates
- [ ] Verify Vercel SSL is active (automatic)
- [ ] Verify Railway/Render SSL is active (automatic)
- [ ] Test HTTPS: `https://vibelybuildai.com`
- [ ] Test backend HTTPS: `https://api.vibelybuildai.com/health`

## Post-Deployment Configuration

### Update Environment Variables
- [ ] Update `NEXT_PUBLIC_FRONTEND_URL` to `https://vibelybuildai.com`
- [ ] Update `NEXT_PUBLIC_API_URL` to `https://api.vibelybuildai.com`
- [ ] Update backend `FRONTEND_URL` to `https://vibelybuildai.com`
- [ ] Redeploy frontend: `vercel --prod`
- [ ] Redeploy backend: `railway up` or Render dashboard

### Firebase Updates
- [ ] Add `vibelybuildai.com` to Firebase authorized domains
- [ ] Add `www.vibelybuildai.com` to Firebase authorized domains
- [ ] Update OAuth redirect URLs (if using OAuth)
- [ ] Test authentication flow

### Security
- [ ] Verify API secret keys match between frontend and backend
- [ ] Test CORS configuration
- [ ] Review Firestore security rules
- [ ] Enable Firebase App Check (optional)
- [ ] Set up Vercel password protection (optional for staging)

## Testing

### Automated Tests
- [ ] Test backend health: `curl https://api.vibelybuildai.com/health`
- [ ] Test frontend loads: `curl https://vibelybuildai.com`
- [ ] Test API authentication (with secret key)

### Manual Tests
- [ ] Sign up new user
- [ ] Login existing user
- [ ] Navigate to pricing page
- [ ] Complete fake checkout flow
- [ ] Create a test build
- [ ] Verify preview loads
- [ ] Test file tree viewer
- [ ] Test code viewer
- [ ] Test refresh button
- [ ] Join early access waitlist
- [ ] Test mobile responsiveness
- [ ] Test different browsers (Chrome, Firefox, Safari)

### Edge Cases
- [ ] Test without subscription (should show paywall)
- [ ] Test build limits (5 builds for Starter)
- [ ] Test CORS from production domain
- [ ] Test logout and re-login
- [ ] Test password reset flow

## Monitoring Setup

### Error Tracking (Optional)
- [ ] Sign up for Sentry.io
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel
- [ ] Add `SENTRY_AUTH_TOKEN` for source maps
- [ ] Test error tracking

### Analytics (Optional)
- [ ] Set up Vercel Analytics
- [ ] Set up PostHog for product analytics
- [ ] Set up Google Analytics
- [ ] Add conversion tracking for signups

### Uptime Monitoring (Optional)
- [ ] Sign up for UptimeRobot or Pingdom
- [ ] Add monitor for `https://vibelybuildai.com`
- [ ] Add monitor for `https://api.vibelybuildai.com/health`
- [ ] Set up alert emails/SMS

## Performance Optimization

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Check Lighthouse score (aim for >90)
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable compression
- [ ] Verify build size is reasonable

### Backend
- [ ] Monitor memory usage
- [ ] Check disk usage for cache
- [ ] Set up log rotation
- [ ] Configure preview server limits
- [ ] Test preview server performance

## Backup & Recovery

### Firebase
- [ ] Export Firestore data
- [ ] Set up automated daily backups
- [ ] Store backups in Cloud Storage
- [ ] Test restore procedure

### Code
- [ ] Ensure GitHub repository is up to date
- [ ] Tag release: `git tag v1.0.0`
- [ ] Create release notes
- [ ] Document any manual configuration steps

## Documentation

- [ ] Update README.md with production URLs
- [ ] Document any environment-specific behavior
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] Share access credentials with team (use 1Password/LastPass)

## Launch Preparation

### Legal & Compliance
- [ ] Add Privacy Policy page
- [ ] Add Terms of Service page
- [ ] Add Cookie Consent banner (if EU users)
- [ ] Set up GDPR compliance (if applicable)

### Marketing
- [ ] Set up Google Search Console
- [ ] Submit sitemap.xml
- [ ] Add meta tags for SEO
- [ ] Set up social media cards (OpenGraph, Twitter)
- [ ] Prepare launch announcement

### Support
- [ ] Set up support email (support@vibelybuildai.com)
- [ ] Create help documentation
- [ ] Set up status page (status.vibelybuildai.com)
- [ ] Prepare FAQ document

## Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check server costs
- [ ] Review user feedback
- [ ] Fix critical bugs
- [ ] Send welcome email to early users

### Week 2-4
- [ ] Analyze usage metrics
- [ ] Optimize slow endpoints
- [ ] Add user-requested features
- [ ] Scale infrastructure if needed
- [ ] Send product update emails

## Rollback Plan

### If Deployment Fails
1. [ ] Revert to previous Vercel deployment
2. [ ] Rollback Railway/Render to previous version
3. [ ] Restore environment variables
4. [ ] Test rollback works
5. [ ] Investigate and fix issues
6. [ ] Re-deploy when ready

### Emergency Contacts
- **Vercel Support**: support@vercel.com
- **Railway Support**: help@railway.app
- **Render Support**: support@render.com
- **Firebase Support**: firebase.google.com/support

---

## Sign-Off

- [ ] Technical lead approval
- [ ] Product manager approval
- [ ] Security review completed
- [ ] Load testing completed
- [ ] Deployment completed
- [ ] Post-deployment tests passed
- [ ] Monitoring active
- [ ] Team notified of launch

**Deployed by**: _______________
**Date**: _______________
**Version**: _______________
**Backend URL**: _______________
**Frontend URL**: _______________

---

**Next Steps After Deployment:**

1. Monitor for first 24 hours
2. Collect user feedback
3. Plan next sprint features
4. Schedule post-mortem meeting
5. Celebrate! 🎉
