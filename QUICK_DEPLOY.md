# ⚡ Quick Deploy to Vercel + PostgreSQL

## 🚀 One-Click Deployment Steps

### 1. Create Vercel Project
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel
```

### 2. Add PostgreSQL Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name: `pc-services-db`
6. Click **Create**

### 3. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
DIRECT_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
```

### 4. Deploy Database Schema
```bash
# Test connection
npm run db:test

# Deploy schema
npm run db:deploy

# Setup initial data
npm run db:setup-vercel
```

### 5. Access Your App
- Visit: `https://your-app-name.vercel.app`
- Admin login: Use the credentials you set in environment variables

## 🔧 Troubleshooting

**Build fails?**
- Check all environment variables are set
- Ensure `DATABASE_URL` includes `?sslmode=require`

**Database connection fails?**
- Verify connection string is correct
- Check database is created in Vercel Storage

**Admin login doesn't work?**
- Run `npm run db:setup-vercel` to create admin user
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly

## 📞 Need Help?

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- Run `npm run db:test` to diagnose database issues
- Check Vercel logs in dashboard

---

🎉 **Your PC Services website is now live!**