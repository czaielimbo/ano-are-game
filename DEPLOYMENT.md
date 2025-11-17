# Deploy to Railway - Step by Step Guide

This guide will help you deploy your "Ano Are" game to Railway for free hosting.

## Prerequisites

- A GitHub account
- A Railway account (sign up at https://railway.app)
- Git installed on your computer

## Method 1: Deploy from GitHub (Recommended)

### Step 1: Push to GitHub

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name it something like `ano-are-game`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ano-are-game.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username

### Step 2: Deploy on Railway

1. **Go to Railway**
   - Visit https://railway.app
   - Click "Login" and sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `ano-are-game` repository
   - Railway will automatically detect it's a Node.js app

3. **Wait for Deployment**
   - Railway will automatically:
     - Install dependencies (`npm install`)
     - Start your server (`npm start`)
   - This takes 1-3 minutes

4. **Get Your URL**
   - Click on your deployment
   - Go to "Settings" tab
   - Scroll to "Domains"
   - Click "Generate Domain"
   - You'll get a URL like: `your-app.up.railway.app`

5. **Done!**
   - Your game is now live!
   - Share the URL with friends to play

## Method 2: Deploy from Local (Alternative)

### Using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Domain**
   ```bash
   railway domain
   ```

## Configuration

### Environment Variables (Optional)

If you need to set environment variables:

1. Go to your Railway project
2. Click "Variables" tab
3. Add variables like:
   - `PORT` (Railway sets this automatically)
   - Add any custom variables if needed

### Custom Domain (Optional)

To use your own domain:

1. Go to "Settings" > "Domains"
2. Click "Custom Domain"
3. Enter your domain
4. Add the CNAME record to your DNS provider

## Monitoring Your App

### View Logs
- Go to your Railway project
- Click "Deployments"
- Click on the latest deployment
- View real-time logs

### Check Metrics
- Railway shows:
  - CPU usage
  - Memory usage
  - Network traffic
  - Request counts

## Troubleshooting

### Deployment Failed

**Check build logs:**
- Go to Railway dashboard
- Click on your deployment
- Check the logs for errors

**Common issues:**

1. **Missing dependencies**
   ```bash
   # Make sure package.json includes all dependencies
   npm install
   git add package.json package-lock.json
   git commit -m "Update dependencies"
   git push
   ```

2. **Port binding error**
   - Railway automatically sets PORT environment variable
   - Our server.js already uses `process.env.PORT` ✓

3. **Build timeout**
   - Usually means dependencies are taking too long
   - Railway will retry automatically

### App Crashes After Deploy

1. **Check logs in Railway dashboard**
2. **Common fixes:**
   - Make sure `start` script is correct in package.json
   - Verify all dependencies are in `dependencies` (not `devDependencies`)

### WebSocket Issues

If Socket.io isn't working:

1. **Check CORS settings** (already configured in our code)
2. **Verify WebSocket support:**
   - Railway supports WebSockets by default
   - No additional configuration needed

## Updating Your Deployment

### Auto-Deploy (Default)

Railway automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update game features"
git push
```

Railway will automatically:
1. Detect the push
2. Build your app
3. Deploy the new version

### Manual Deploy

Using Railway CLI:
```bash
railway up
```

## Free Tier Limits

Railway free tier includes:
- $5 of usage per month
- Enough for a small game with moderate traffic
- Automatic sleep after inactivity (wakes on request)

**Tips to stay within free tier:**
- App sleeps after 30 min of inactivity
- First request after sleep takes ~10 seconds to wake up
- Consider upgrading if you get lots of traffic

## Monitoring Costs

1. Go to Railway dashboard
2. Check "Usage" section
3. See current month's usage
4. Set up billing alerts

## Production Checklist

Before sharing your game widely:

- [ ] Test the game thoroughly on Railway
- [ ] Check that multiple players can join
- [ ] Verify drawing syncs correctly
- [ ] Test on mobile devices
- [ ] Monitor initial usage
- [ ] Set up error tracking (optional: Sentry, LogRocket)
- [ ] Consider adding rate limiting for heavy traffic

## Backup Plan

If Railway has issues, you can also deploy to:
- Render.com (similar process)
- Heroku (paid)
- Vercel (with modifications for serverless)
- DigitalOcean App Platform

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway status: https://status.railway.app

## Next Steps

After successful deployment:

1. Share your game URL with friends
2. Monitor player feedback
3. Add new features (see README.md for ideas)
4. Consider upgrading if you get lots of players

**Your game is now live and ready to play! 🎉**
