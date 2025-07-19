# GitHub Workflows

This directory contains GitHub Actions workflows for automated deployment.

## Frontend Deployment to Vercel

The `deploy-frontend.yml` workflow automatically deploys the frontend to Vercel when changes are pushed to the main branch.

### Setup Requirements

1. **Vercel Account**: You need a Vercel account and a project set up for your frontend.

2. **GitHub Secrets**: Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### How to Get Vercel Credentials

1. **Vercel Token**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Settings → Tokens
   - Create a new token with appropriate permissions

2. **Organization ID**:
   - In your Vercel dashboard, the org ID is visible in the URL or in the project settings

3. **Project ID**:
   - Create a new project in Vercel or use an existing one
   - The project ID can be found in the project settings

### Workflow Features

- **Triggered on**: Push to main/master branch or pull requests (only when frontend files change)
- **Node.js**: Uses Node.js 18 with npm caching for faster builds
- **Quality Checks**: Runs linting before deployment
- **Build Process**: Builds the React app using Vite
- **Deployment**: Deploys to Vercel production environment

### Manual Deployment

You can also trigger the workflow manually from the GitHub Actions tab in your repository. 