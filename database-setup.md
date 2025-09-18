# Database Setup Guide for Vercel + PostgreSQL

## Step 1: Create PostgreSQL Database on Vercel

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a name for your database (e.g., "pc-services-db")
7. Select a region close to your users
8. Click "Create"

## Step 2: Get Database Connection String

After creating the database:
1. Go to the "Storage" tab in your project
2. Click on your PostgreSQL database
3. Go to "Settings" tab
4. Copy the "Connection String" (it will look like):
   ```
   postgres://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
   ```

## Step 3: Set Environment Variables in Vercel

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

### Required Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `DIRECT_URL`: Same as DATABASE_URL (for Prisma migrations)
- `NEXTAUTH_SECRET`: A random secret string
- `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)

### Optional Variables:
- `ADMIN_EMAIL`: Admin email for the system
- `ADMIN_PASSWORD`: Admin password
- `EMAIL_SERVER_HOST`: SMTP server for emails
- `EMAIL_SERVER_PORT`: SMTP port (usually 587)
- `EMAIL_SERVER_USER`: Your email username
- `EMAIL_SERVER_PASSWORD`: Your email password
- `EMAIL_FROM`: From email address

## Step 4: Deploy and Run Migrations

1. Push your code to GitHub
2. Vercel will automatically deploy
3. Run database migrations:
   ```bash
   npx prisma db push
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Step 5: Seed Database (Optional)

If you have seed data:
```bash
   npm run db:seed
   ```

## Environment Variables Format:

```env
DATABASE_URL="postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
DIRECT_URL="postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-random-secret-key"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-password"
```

## Troubleshooting:

1. **Connection Issues**: Make sure SSL mode is set to "require"
2. **Migration Issues**: Use `prisma db push` instead of `prisma migrate dev` for Vercel
3. **Environment Variables**: Ensure all variables are set in Vercel dashboard
4. **Build Issues**: Check that `postinstall` script runs `prisma generate`