# 🚀 Vercel + PostgreSQL Deployment Guide

## Prerequisites
- GitHub account
- Vercel account
- Node.js installed locally

## Step 1: Prepare Your Code

1. **Commit all changes to GitHub:**
   ```bash
   git add .
   git commit -m "Add PostgreSQL support for Vercel"
   git push origin main
   ```

## Step 2: Create PostgreSQL Database on Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in to your account

2. **Create New Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Select your `pc-services-website` repository

3. **Add PostgreSQL Database:**
   - In your project dashboard, go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Name it: `pc-services-db`
   - Choose a region (closest to your users)
   - Click "Create"

## Step 3: Configure Environment Variables

1. **Get Database Connection String:**
   - Go to "Storage" → Your database → "Settings"
   - Copy the "Connection String"

2. **Set Environment Variables:**
   - Go to your project → "Settings" → "Environment Variables"
   - Add the following variables:

   ```
   DATABASE_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
   DIRECT_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-random-secret-key
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure-password
   ```

## Step 4: Deploy and Setup Database

1. **Deploy to Vercel:**
   - Push your code to trigger deployment
   - Or manually deploy from Vercel dashboard

2. **Run Database Setup:**
   ```bash
   # Test connection
   npm run db:test
   
   # Push schema to database
   npm run db:deploy
   
   # Setup initial data
   npm run db:setup-vercel
   ```

## Step 5: Verify Deployment

1. **Check Your App:**
   - Visit your Vercel URL
   - Test user registration
   - Test admin login

2. **Check Database:**
   - Go to Vercel → Storage → Your database
   - Verify tables are created
   - Check data is populated

## Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:test           # Test database connection
npm run db:setup-vercel   # Setup initial data
npm run db:deploy         # Deploy schema and generate client
```

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check environment variables are set
   - Ensure `postinstall` script runs `prisma generate`

2. **Database Connection Fails:**
   - Verify `DATABASE_URL` is correct
   - Check SSL mode is set to `require`
   - Ensure database is created in Vercel

3. **Migration Issues:**
   - Use `prisma db push` instead of `prisma migrate dev`
   - Run `prisma generate` after schema changes

4. **Environment Variables Not Working:**
   - Set variables in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

### Getting Help:

- Check Vercel logs in dashboard
- Run `npm run db:test` to diagnose database issues
- Check Prisma documentation for schema issues

## Security Notes:

- Never commit `.env` files
- Use strong passwords for admin accounts
- Generate secure `NEXTAUTH_SECRET`
- Enable SSL for database connections

## Next Steps:

1. Set up custom domain (optional)
2. Configure email service for notifications
3. Set up monitoring and analytics
4. Configure backup strategy for database

---

🎉 **Congratulations!** Your PC Services website is now live on Vercel with PostgreSQL!