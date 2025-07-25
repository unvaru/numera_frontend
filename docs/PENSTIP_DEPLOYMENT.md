# Penstip.com Deployment Guide

## Overview

This guide will help you deploy your Numera frontend application to `penstip.com` using Cloudflare Pages with automatic GitHub integration.

## Prerequisites

- ✅ Domain purchased: `penstip.com`
- ✅ GitHub repository with your code
- ✅ Cloudflare account
- ✅ Node.js 18+ installed locally

## Step-by-Step Setup

### 1. Cloudflare Pages Setup

#### 1.1 Access Cloudflare Dashboard
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Log in to your Cloudflare account
3. Navigate to **Pages** in the left sidebar

#### 1.2 Create New Pages Project
1. Click **"Create a project"**
2. Select **"Connect to Git"**
3. Choose **GitHub** as your Git provider
4. Authorize Cloudflare to access your GitHub account

#### 1.3 Configure Repository
1. Select your Numera repository
2. Choose the branch you want to deploy (usually `main` or `master`)
3. Set the following build settings:

```bash
# Build command
npm run build:production

# Build output directory
dist

# Root directory (if your frontend is in a subdirectory)
frontend

# Node.js version
18
```

### 2. Environment Variables Setup

In your Cloudflare Pages project settings, add these environment variables:

#### 2.1 Production Variables
```env
# API Configuration
VITE_API_BASE_URL=https://api.penstip.com
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1

# Application Configuration
VITE_APP_NAME=Penstip
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_OFFLINE_MODE=false

# Security Configuration
VITE_ENABLE_HTTPS_ONLY=true
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true

# CDN Configuration
VITE_CDN_URL=https://cdn.penstip.com
VITE_ASSET_VERSION=1.0.0

# Monitoring Configuration (add your actual values)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# Development/Production Flags
DEV=false
NODE_ENV=production
```

### 3. Custom Domain Configuration

#### 3.1 Add Custom Domain
1. In your Cloudflare Pages project, go to **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter `penstip.com` and `www.penstip.com`

#### 3.2 DNS Configuration
Cloudflare will automatically configure DNS records. Verify these are created:

```dns
# CNAME record for www subdomain
www.penstip.com CNAME your-project.pages.dev

# A record for root domain (if needed)
penstip.com A 192.0.2.1
```

### 4. GitHub Secrets Configuration

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

#### 4.1 Required Secrets
```bash
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_PAGES_PROJECT_NAME=your_project_name

# API Configuration
VITE_API_BASE_URL=https://api.penstip.com

# Monitoring (optional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# Security
SNYK_TOKEN=your-snyk-token

# Performance
LHCI_GITHUB_APP_TOKEN=your-lighthouse-token
```

### 5. Cloudflare API Token Setup

#### 5.1 Create API Token
1. Go to Cloudflare Dashboard > **My Profile** > **API Tokens**
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Set permissions:
   - **Zone**: Include > All zones
   - **Zone Resources**: Include > All zones
   - **Account Resources**: Include > All accounts
5. Set **Zone Permissions**:
   - **Zone**: Read
   - **Zone Settings**: Read
   - **Zone:Zone**: Read
   - **Zone:Zone:Settings**: Read
6. Set **Account Permissions**:
   - **Account**: Read
   - **Account Settings**: Read
   - **Account:Account**: Read
   - **Account:Account:Settings**: Read
   - **Account:Pages**: Edit
   - **Account:Pages:Deployment**: Edit

### 6. First Deployment

#### 6.1 Trigger Initial Deployment
1. Make a small change to your code
2. Commit and push to your main branch
3. Cloudflare Pages will automatically build and deploy

#### 6.2 Verify Deployment
1. Check the deployment status in Cloudflare Pages dashboard
2. Visit `https://penstip.com` to verify the site is live
3. Check that `https://www.penstip.com` redirects to `https://penstip.com`

### 7. SSL Certificate Setup

#### 7.1 Automatic SSL
Cloudflare provides automatic SSL certificates. Verify:
1. Go to **SSL/TLS** in your Cloudflare dashboard
2. Ensure **SSL/TLS encryption mode** is set to **"Full (strict)"**
3. Enable **"Always Use HTTPS"** in **SSL/TLS > Edge Certificates**

### 8. Performance Optimization

#### 8.1 Cloudflare Settings
1. **Speed > Optimization**:
   - Enable **Auto Minify** for JavaScript, CSS, and HTML
   - Enable **Brotli** compression
   - Enable **HTTP/2 Server Push**

2. **Caching > Configuration**:
   - Set **Browser Cache TTL** to **4 hours**
   - Enable **Always Online**

3. **Rules > Page Rules** (optional):
   ```
   URL: penstip.com/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 4 hours
   - Browser Cache TTL: 4 hours
   ```

### 9. Monitoring Setup

#### 9.1 Cloudflare Analytics
1. Enable **Web Analytics** in your Cloudflare dashboard
2. Add the analytics script to your site (optional)

#### 9.2 External Monitoring
1. **Sentry**: For error tracking
2. **Google Analytics**: For user analytics
3. **Lighthouse CI**: For performance monitoring

### 10. Testing Your Deployment

#### 10.1 Basic Tests
```bash
# Test HTTPS redirect
curl -I http://penstip.com
# Should redirect to https://penstip.com

# Test www redirect
curl -I https://www.penstip.com
# Should redirect to https://penstip.com

# Test SPA routing
curl -I https://penstip.com/login
# Should return 200 (not 404)
```

#### 10.2 Performance Tests
```bash
# Run Lighthouse audit
npm run lighthouse

# Check Core Web Vitals
# Use Chrome DevTools Performance tab
```

### 11. Continuous Deployment

#### 11.1 Automatic Updates
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Failed builds are reported in GitHub

#### 11.2 Deployment Status
- Check deployment status in Cloudflare Pages dashboard
- Monitor build logs for any issues
- Set up notifications for deployment status

### 12. Troubleshooting

#### 12.1 Common Issues

**Build Failures:**
```bash
# Check build logs in Cloudflare Pages
# Verify Node.js version is 18+
# Check environment variables are set correctly
```

**Domain Issues:**
```bash
# Verify DNS records are correct
# Check SSL certificate status
# Ensure domain is properly configured in Cloudflare
```

**Performance Issues:**
```bash
# Check Cloudflare cache settings
# Verify compression is enabled
# Monitor Core Web Vitals
```

#### 12.2 Useful Commands
```bash
# Test local build
npm run build:production

# Check bundle size
npm run analyze

# Run security audit
npm run security-audit

# Test performance
npm run lighthouse
```

### 13. Maintenance

#### 13.1 Regular Tasks
- Monitor deployment logs
- Check performance metrics
- Update dependencies regularly
- Review security audits
- Monitor error rates

#### 13.2 Backup Strategy
- Keep local backups of your code
- Use Git for version control
- Consider database backups (if applicable)
- Document configuration changes

## Success Checklist

- [ ] Cloudflare Pages project created
- [ ] GitHub repository connected
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] HTTPS redirects working
- [ ] SPA routing functional
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] CI/CD pipeline working

## Support

If you encounter issues:

1. Check Cloudflare Pages documentation
2. Review build logs in Cloudflare dashboard
3. Verify GitHub Actions workflow
4. Check DNS and SSL configuration
5. Contact Cloudflare support if needed

---

**🎉 Congratulations! Your Penstip.com site is now live with automatic deployments!**

Every time you push changes to your main branch, your site will automatically update within minutes. 