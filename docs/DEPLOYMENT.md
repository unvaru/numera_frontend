# Production Deployment Guide

## Overview

This document provides comprehensive guidance for deploying the Numera frontend application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Domain**: Configured domain name

### Required Services

- **CDN**: Cloudflare, AWS CloudFront, or similar
- **Hosting**: Vercel, Netlify, AWS S3, or similar
- **Monitoring**: Sentry, Google Analytics, Mixpanel
- **CI/CD**: GitHub Actions, GitLab CI, or similar

## Environment Setup

### 1. Environment Variables

Create `.env.production` file:

```bash
# Copy example file
cp env.production.example .env.production

# Edit with your values
nano .env.production
```

Required variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.numera.com
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Numera
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Security Configuration
VITE_ENABLE_HTTPS_ONLY=true
VITE_ENABLE_CSP=true

# Monitoring Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# CDN Configuration
VITE_CDN_URL=https://cdn.numera.com
```

### 2. GitHub Secrets

Configure these secrets in your GitHub repository:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.numera.com

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# Security
SNYK_TOKEN=your-snyk-token

# Performance
LHCI_GITHUB_APP_TOKEN=your-lighthouse-token
```

## Build Process

### 1. Production Build

```bash
# Install dependencies
npm ci

# Run tests
npm run test:coverage
npm run test:e2e

# Build for production
npm run build:production
```

### 2. Build Optimization

The production build includes:

- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Unused code removal
- **Minification**: Terser minification
- **Compression**: Gzip and Brotli compression
- **PWA Support**: Service worker and manifest
- **Bundle Analysis**: Visual bundle analyzer

### 3. Build Output

```
dist/
├── assets/
│   ├── js/
│   │   ├── vendor-[hash].js
│   │   ├── ui-[hash].js
│   │   └── main-[hash].js
│   ├── css/
│   │   └── main-[hash].css
│   └── images/
├── index.html
├── manifest.json
├── sw.js
└── stats.html
```

## Deployment Options

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configuration (`vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Configuration (`netlify.toml`):

```toml
[build]
  publish = "dist"
  command = "npm run build:production"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### 3. AWS S3 + CloudFront

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 4. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Service worker
        location /sw.js {
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }
    }
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Testing**: Unit tests, E2E tests, linting
2. **Security**: npm audit, Snyk scan
3. **Building**: Production build with optimization
4. **Deployment**: Staging and production deployment
5. **Monitoring**: Performance checks with Lighthouse

### Manual Deployment

```bash
# 1. Run tests
npm run test:coverage
npm run test:e2e

# 2. Security audit
npm run security-audit

# 3. Build for production
npm run build:production

# 4. Analyze bundle
npm run analyze

# 5. Deploy
# (Use your preferred deployment method)
```

## Monitoring & Analytics

### 1. Error Tracking (Sentry)

```typescript
// Initialize in main.ts
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    })
  ],
  tracesSampleRate: 0.1
})
```

### 2. Analytics (Google Analytics)

```typescript
// Track custom events
monitoring.trackEvent('user_login', {
  method: 'email',
  user_id: user.id
})

// Track page views
monitoring.trackPageView('/dashboard')
```

### 3. Performance Monitoring

```typescript
// Monitor Core Web Vitals
monitoring.trackMetric('lcp', 1200)
monitoring.trackMetric('fid', 50)
monitoring.trackMetric('cls', 0.05)
```

### 4. Health Checks

```bash
# Check application health
curl -f https://your-domain.com/health

# Check API connectivity
curl -f https://api.numera.com/health
```

## Security Configuration

### 1. Security Headers

Configure these headers on your web server:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.numera.com https://www.google-analytics.com; frame-src 'none'; object-src 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 2. CORS Configuration

```javascript
// Backend CORS configuration
const corsOptions = {
  origin: [
    'https://numera.com',
    'https://www.numera.com',
    'https://app.numera.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  credentials: true,
  maxAge: 86400
}
```

### 3. Rate Limiting

```javascript
// Backend rate limiting
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
```

## Performance Optimization

### 1. CDN Configuration

```bash
# Cloudflare configuration
# Enable Auto Minify for JS, CSS, HTML
# Enable Brotli compression
# Enable HTTP/2 Server Push
# Configure Page Rules for caching
```

### 2. Caching Strategy

```http
# Static assets (1 year)
Cache-Control: public, max-age=31536000, immutable

# HTML files (no cache)
Cache-Control: no-cache, no-store, must-revalidate

# API responses (5 minutes)
Cache-Control: private, max-age=300
```

### 3. Image Optimization

```bash
# Optimize images
npm install -g imagemin-cli
imagemin images/* --out-dir=dist/assets/images

# Use WebP format
# Implement lazy loading
# Use responsive images
```

### 4. Bundle Optimization

```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npm ls

# Optimize imports
# Use dynamic imports for large libraries
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm ls
```

#### 2. Deployment Issues

```bash
# Check build output
ls -la dist/

# Verify environment variables
echo $VITE_API_BASE_URL

# Check server logs
# Check CDN cache
```

#### 3. Performance Issues

```bash
# Run Lighthouse audit
npm run lighthouse

# Check Core Web Vitals
# Monitor bundle size
# Check API response times
```

#### 4. Security Issues

```bash
# Run security audit
npm run security-audit

# Check for vulnerabilities
npm audit fix

# Verify SSL certificate
openssl s_client -connect your-domain.com:443
```

### Debug Commands

```bash
# Development server
npm run dev

# Production preview
npm run build:production
npm run preview

# Test production build
npm run test:e2e:headed

# Performance testing
npm run lighthouse

# Bundle analysis
npm run analyze
```

### Monitoring Commands

```bash
# Check application status
curl -I https://your-domain.com

# Monitor API health
curl -I https://api.numera.com/health

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Monitor Core Web Vitals
# Use Chrome DevTools Performance tab
# Use Lighthouse CI
```

## Best Practices

### 1. Deployment Checklist

- [ ] All tests passing
- [ ] Security audit clean
- [ ] Environment variables configured
- [ ] SSL certificate valid
- [ ] CDN configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Rollback plan ready

### 2. Performance Checklist

- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] CDN configured
- [ ] Caching strategy implemented
- [ ] Core Web Vitals monitored
- [ ] API response times acceptable

### 3. Security Checklist

- [ ] Security headers configured
- [ ] CORS policy set
- [ ] Rate limiting enabled
- [ ] SSL certificate valid
- [ ] Dependencies updated
- [ ] Security monitoring enabled

### 4. Monitoring Checklist

- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Performance monitoring active
- [ ] Health checks implemented
- [ ] Alerts configured
- [ ] Logs centralized

## Support

For deployment issues:

1. Check the troubleshooting section
2. Review server logs
3. Verify configuration
4. Contact the development team
5. Check monitoring dashboards

---

*Last updated: January 2024* 