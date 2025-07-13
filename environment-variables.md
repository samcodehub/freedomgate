# Environment Variables for Netlify Deployment

## Required Environment Variables

Add these environment variables in your Netlify dashboard under **Site settings > Environment variables**:

### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```
*Note: You'll need to use a hosted PostgreSQL database like Neon, Supabase, or PlanetScale instead of SQLite for production*

### Authentication
```
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here
ADMIN_JWT_EXPIRES_IN=1d
```

### Payment Configuration
```
PAYMENT_WALLET_ADDRESS=your-payment-wallet-address
PAYMENT_EXPIRE_MINUTES=30
```

### Next.js Configuration
```
NEXTAUTH_URL=https://yourdomain.netlify.app
NEXTAUTH_SECRET=your-nextauth-secret
```

### Application Settings
```
APP_NAME=FreedomGate
APP_URL=https://yourdomain.netlify.app
ADMIN_EMAIL=admin@yourdomain.com
```

### Email Configuration (Optional)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Subscription Plans
```
BASIC_PLAN_PRICE=10
PREMIUM_PLAN_PRICE=20
ENTERPRISE_PLAN_PRICE=50
```

### Security
```
ENCRYPTION_KEY=your-encryption-key-here
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Environment
```
NODE_ENV=production
```

## Database Setup Instructions

1. **Create a PostgreSQL database** using one of these services:
   - [Neon](https://neon.tech) (Recommended - Free tier available)
   - [Supabase](https://supabase.com) (Free tier available)
   - [PlanetScale](https://planetscale.com) (MySQL alternative)
   - [Railway](https://railway.app) (PostgreSQL hosting)

2. **Update your DATABASE_URL** with the connection string from your chosen provider

3. **Run database migrations** after deployment:
   ```bash
   npx prisma migrate deploy
   ```

## Security Notes

- Generate strong, unique secrets for JWT_SECRET and ADMIN_JWT_SECRET
- Use a secure random string generator for NEXTAUTH_SECRET
- Keep your database credentials secure and never commit them to version control
- Consider using environment-specific encryption keys 