# CandleSpinner Deployment Guide

This guide walks you through deploying CandleSpinner to Cloudflare Pages.

## Prerequisites

- GitHub account
- Cloudflare account (free tier works)
- Node.js 18+ (for local development)

## Option 1: Automatic Deployment (Recommended)

### Step 1: Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Connect to Git**
4. Select your GitHub repository: `aiandyou50/CandleSpinner`
5. Select branch: `main` or your deployment branch

### Step 2: Configure Build Settings

```
Build command: npm run build
Build output directory: dist
Root directory: /
```

### Step 3: Set Environment Variables (Optional)

In Cloudflare Pages dashboard → Settings → Environment Variables:

```env
# RPC endpoint (optional, uses default if not set)
BACKEND_RPC_URL=https://toncenter.com/api/v2/jsonRPC

# API protection (optional)
FUNCTION_API_KEY=your-secret-key-here

# CORS (optional, allows all if not set)
ALLOWED_ORIGIN=https://yourdomain.com,*.yoursite.com
```

### Step 4: Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repository
2. Run `npm install`
3. Run `npm run build`
4. Deploy to global CDN

Your site will be live at: `https://candlespinner.pages.dev`

## Option 2: Manual Deployment via CLI

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Authenticate

```bash
wrangler login
```

### Step 3: Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=candlespinner
```

## Post-Deployment Steps

### 1. Verify KV Namespace

Ensure the KV namespace is bound correctly:
```bash
wrangler kv:namespace list
```

Should show: `CREDIT_KV` with ID `e573c59cb09b4d58b5f38a56ef65dd6f`

### 2. Update TON Connect Manifest

Update `tonconnect-manifest.json` with your actual domain:

```json
{
  "url": "https://your-domain.pages.dev",
  "name": "CandleSpinner",
  "iconUrl": "https://your-domain.pages.dev/icon.png"
}
```

### 3. Test the Application

1. Open your deployed URL
2. Click **TON Connect** button (top-right)
3. Connect your Telegram Wallet
4. Try a test deposit (use testnet first!)
5. Verify all features work:
   - Deposit
   - Spin
   - Win/Lose
   - Double-up
   - Collect
   - Withdraw

### 4. Monitor Logs

View function logs in Cloudflare Dashboard:
**Workers & Pages** → Your Project → **Logs**

## Custom Domain (Optional)

### Add Custom Domain

1. Go to **Workers & Pages** → Your Project → **Custom Domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `candlespinner.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (usually < 15 minutes)

## Troubleshooting

### Build Fails

**Error**: `npm install` fails
- Solution: Check Node.js version (requires 18+)
- Verify `package-lock.json` is committed

**Error**: TypeScript errors during build
- Solution: Run `npm run typecheck` locally first
- Fix any type errors before deployment

### Function Errors

**Error**: KV namespace not found
- Solution: Check `wrangler.toml` has correct KV binding
- Verify KV namespace exists in Cloudflare dashboard

**Error**: RPC endpoint timeout
- Solution: Check `BACKEND_RPC_URL` environment variable
- Try using a different RPC endpoint

### Wallet Connection Issues

**Error**: TON Connect fails
- Solution: Verify `tonconnect-manifest.json` URL is correct
- Check if domain is accessible via HTTPS

**Error**: Jetton wallet derivation fails
- Solution: Check RPC proxy is working (`/api/rpc`)
- Verify CORS settings allow your domain

## Production Checklist

Before going to production:

- [ ] Test on testnet extensively
- [ ] Update `TON_CONNECT_MANIFEST_URL` to production domain
- [ ] Set strong `FUNCTION_API_KEY` for API protection
- [ ] Configure proper `ALLOWED_ORIGIN` for CORS
- [ ] Enable Cloudflare Analytics
- [ ] Set up monitoring and alerts
- [ ] Test withdrawal processor (implement if not done)
- [ ] Review and test all security aspects
- [ ] Prepare customer support materials
- [ ] Have a rollback plan

## Updating the Application

### Automatic Updates

Push to your connected branch:
```bash
git push origin main
```

Cloudflare will automatically rebuild and deploy.

### Manual Updates

```bash
# Pull latest changes
git pull

# Build
npm run build

# Deploy
npx wrangler pages deploy dist
```

## Rollback

If deployment fails or has issues:

1. Go to **Workers & Pages** → Your Project → **Deployments**
2. Find the last working deployment
3. Click **...** → **Rollback to this deployment**

## Support

- **Documentation**: See `/PoC/docs/PoC/` directory
- **Issues**: https://github.com/aiandyou50/CandleSpinner/issues
- **TON Connect**: https://docs.ton.org/develop/dapps/ton-connect/overview

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit private keys** to the repository
2. **Use testnet** for initial testing
3. **Set API key** in production environment
4. **Monitor logs** for suspicious activity
5. **Implement withdrawal processor** separately from public functions
6. **Rate limit** API endpoints in production
7. **Validate all inputs** server-side

## Next Steps

After successful deployment:

1. Test thoroughly on testnet
2. Gather user feedback
3. Monitor performance and errors
4. Implement withdrawal processor for actual payouts
5. Plan for mainnet launch

---

**Note**: This deployment guide assumes you're deploying to testnet first. Always test extensively before mainnet deployment.
