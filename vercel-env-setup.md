# Vercel Environment Variables Setup

## Required Environment Variables

Set these in your Vercel project dashboard under Settings > Environment Variables:

### Database Configuration
```
DATABASE_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
DIRECT_URL=postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here
```

### Admin Configuration (Optional)
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
```

### Email Configuration (Optional)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings tab
4. Click on "Environment Variables"
5. Add each variable with its value
6. Make sure to set them for all environments (Production, Preview, Development)

## Important Notes:

- Replace `your-app-name` with your actual Vercel app name
- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- The `DATABASE_URL` and `DIRECT_URL` should be the same for Vercel PostgreSQL
- Make sure to include `?sslmode=require` at the end of database URLs