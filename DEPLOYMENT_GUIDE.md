# Netlify Deployment Guide for FreedomGate App

## 📋 Prerequisites

Before deploying to Netlify, ensure you have:
- A Netlify account ([sign up here](https://app.netlify.com/signup))
- A GitHub repository with your code
- A PostgreSQL database (we'll set this up)

## 🗄️ Step 1: Set Up Production Database

### Option A: Using Neon (Recommended - Free Tier)

1. Go to [Neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)
4. Save this connection string - you'll need it for environment variables

### Option B: Using Supabase

1. Go to [Supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string from the "Connection String" section
5. Make sure to replace `[YOUR-PASSWORD]` with your actual password

### Option C: Using Railway

1. Go to [Railway.app](https://railway.app) and create an account
2. Create a new project and add PostgreSQL
3. Copy the connection string from the database service

## 🚀 Step 2: Deploy to Netlify

### Via GitHub (Recommended)

1. **Push your code to GitHub** (if not already done)
2. **Go to Netlify Dashboard** → "New site from Git"
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
netlify deploy --prod
```

## ⚙️ Step 3: Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

### Required Variables

```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-key
APP_URL=https://your-site-name.netlify.app
NODE_ENV=production
```

### Optional Variables

```
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=1d
PAYMENT_WALLET_ADDRESS=your-wallet-address
PAYMENT_EXPIRE_MINUTES=30
APP_NAME=FreedomGate
ADMIN_EMAIL=admin@yourdomain.com
```

## 🔧 Step 4: Database Setup

After deployment, you need to run database migrations:

### Option A: Using Netlify Functions (Recommended)

The migrations should run automatically during the build process.

### Option B: Manual Migration

If you need to run migrations manually:

```bash
# Install dependencies
npm install

# Set your DATABASE_URL environment variable
export DATABASE_URL="your-postgresql-connection-string"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🌐 Step 5: Update Domain Settings

1. In your Netlify dashboard, go to **Site settings > Domain management**
2. Update the `APP_URL` and `NEXTAUTH_URL` environment variables with your actual domain
3. If using a custom domain, configure it in Netlify

## 👤 Step 6: Create Admin User

After deployment, you'll need to create an admin user. You can do this by:

1. **Option A**: Use the seed API endpoint (if implemented)
   ```bash
   curl -X POST https://your-site.netlify.app/api/admin/seed
   ```

2. **Option B**: Connect to your database directly and insert an admin user:
   ```sql
   INSERT INTO admin_users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
   VALUES (
     'admin_001',
     'admin@yourdomain.com',
     'Admin User',
     '$2b$12$hashed_password_here',
     'admin',
     true,
     NOW(),
     NOW()
   );
   ```

## 🔍 Step 7: Verify Deployment

1. **Check your site** at `https://your-site-name.netlify.app`
2. **Test authentication** by trying to log in
3. **Test admin panel** at `/admin`
4. **Check database connection** by viewing users/transactions in admin panel

## 🚨 Common Issues and Solutions

### Build Failures

**Issue**: Build fails with Prisma errors
**Solution**: 
- Ensure `DATABASE_URL` is set in environment variables
- Check that `postinstall` script runs `prisma generate`

**Issue**: Next.js build errors
**Solution**:
- Make sure you're using Node 18+
- Check for any TypeScript errors

### Database Connection Issues

**Issue**: Cannot connect to database
**Solution**:
- Verify your `DATABASE_URL` is correct
- Ensure your database service is running
- Check firewall/security group settings

### Authentication Issues

**Issue**: JWT tokens not working
**Solution**:
- Verify `JWT_SECRET` and `ADMIN_JWT_SECRET` are set
- Ensure secrets are sufficiently long and complex
- Check `NEXTAUTH_SECRET` is configured

## 📊 Monitoring and Maintenance

1. **Check Netlify Functions logs** for API errors
2. **Monitor database usage** in your database provider dashboard
3. **Set up alerts** for failed deployments
4. **Regular backups** of your database

## 🔒 Security Considerations

- Use strong, unique secrets for all JWT tokens
- Enable HTTPS (handled automatically by Netlify)
- Set up proper CORS policies
- Regular security updates of dependencies
- Monitor for suspicious activity in admin logs

## 📈 Performance Optimization

- Enable Netlify's Edge functions for faster API responses
- Use Netlify's CDN for static assets
- Implement database connection pooling
- Monitor and optimize database queries

## 🎯 Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] User registration works
- [ ] Admin panel accessible
- [ ] Payment processing functional
- [ ] Database migrations completed
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables set
- [ ] Admin user created
- [ ] Monitoring/alerts configured

## 📞 Support

If you encounter issues:
1. Check Netlify's function logs
2. Verify all environment variables are set
3. Test database connectivity
4. Review the deployment logs in Netlify dashboard

---

**Happy Deploying! 🚀** 