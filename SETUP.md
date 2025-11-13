# Quick Setup Guide

## Environment Variables

Before running the project, create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=hr22noqz
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Access Sanity Studio

Navigate to [http://localhost:3000/studio](http://localhost:3000/studio) to access the CMS.

## Deploy to Netlify

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Netlify
3. Deploy (configuration is automatic via netlify.toml)

That's it! 🎉

