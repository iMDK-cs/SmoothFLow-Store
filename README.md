# 🖥️ PC Services Website

A modern, responsive website for PC services built with Next.js, TypeScript, and PostgreSQL.

## ✨ Features

- 🛠️ **Service Management**: Complete service catalog with categories and pricing
- 👥 **User Management**: User registration, authentication, and profiles
- 🛒 **Shopping Cart**: Add services to cart and checkout
- 📋 **Order Management**: Track orders and payment status
- 💬 **Live Support Chat**: Real-time customer support
- 📧 **Email Notifications**: Automated email notifications
- 🔐 **Admin Dashboard**: Complete admin panel for managing the system
- 📱 **Responsive Design**: Works perfectly on all devices
- 🌙 **Dark Theme**: Modern dark theme with sky blue accents

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Payments**: Stripe integration
- **Email**: Nodemailer

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pc-services-website.git
   cd pc-services-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`

4. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:setup
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Local Development
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Setup initial data
npm run db:setup

# Test database connection
npm run db:test
```

### Production (Vercel)
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📝 Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:test           # Test database connection
npm run db:setup          # Setup initial data (local)
npm run db:setup-vercel   # Setup initial data (Vercel)
npm run db:deploy         # Deploy schema and generate client
```

## 🌐 Deployment

### Vercel Deployment

1. **Create PostgreSQL database on Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy your code**

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🔧 Environment Variables

### Required
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pc_services_db"
DIRECT_URL="postgresql://username:password@localhost:5432/pc_services_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Optional
```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

## 📁 Project Structure

```
pc-services-website/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin pages
│   │   └── ...
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── scripts/               # Database scripts
├── public/                # Static assets
└── ...
```

## 🎨 Design System

- **Primary Color**: Sky Blue (#00BFFF)
- **Secondary Color**: Light Sky Blue (#87CEEB)
- **Background**: Dark theme with gradients
- **Typography**: Cairo font for Arabic support
- **Components**: Modern glassmorphism design

## 🔐 Admin Access

Default admin credentials:
- **Email**: admin@pcservices.com
- **Password**: admin123

**⚠️ Change these credentials in production!**

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@pcservices.com

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Made with ❤️ for PC Services