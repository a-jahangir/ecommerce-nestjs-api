export default () => ({
  postgres: {
    url: process.env.APP_POSTGRES_URL || "localhost",
    port: parseInt(process.env.APP_POSTGRES_INTERNAL_PORT || "5432", 10),
    username: process.env.APP_POSTGRES_USERNAME || "postgres",
    password: process.env.APP_POSTGRES_PASSWORD || "postgres",
    dbname: process.env.APP_POSTGRES_DBNAME || "ecommerce_db",
  },
  application: {
    url: process.env.APP_BASE_URL || "http://localhost:3000",
    resetPasswordRout: process.env.APP_RESET_PASSWORD_ROUT || "/auth/password-recovery",
  },
  user: {
    userJwtSecret: process.env.APP_USER_JWT_SECRET,
    userJwtExpirationTime: process.env.APP_USER_JWT_EXPIRATION_TIME,

    userJwtRefSecret: process.env.APP_USER_REFRESH_JWT_SECRET,
    userJwtRefExpirationTime: process.env.APP_USER_REFRESH_JWT_EXPIRATION_TIME,
    userResetPasswordSecret: process.env.APP_RESET_PASSWORD_SECRET,
    userResetPasswordExpirationTime: process.env.APP_RESET_PASSWORD_EXPIRATION_TIME,
  },
  admin: {
    superAdminJwtSecret: process.env.APP_ADMIN_JWT_SECRET,
    superAdminJwtExpirationTime: process.env.APP_ADMIN_JWT_EXPIRATION_TIME,
    email: process.env.APP_SUPER_ADMIN_USERNAME,
  },
  swagger: {
    username: process.env.APP_SWAGGER_USERNAME || "admin",
    password: process.env.APP_SWAGGER_PASSWORD || "admin",
  },
  redis: {
    host: process.env.APP_REDIS_HOST || "localhost",
    port: parseInt(process.env.APP_REDIS_INTERNAL_PORT || "6379", 10),
    ttl: process.env.APP_REDIS_TTL || "120",
    db: process.env.APP_REDIS_DB || "0",
  },
  mailProviders: {
    mailgun: {
      key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      email: process.env.MAILGUN_FROM_EMAIL,
      defaultUrl: process.env.MAILGUN_API_DEFAULT_URL || "https://api.mailgun.net",
    },
    hostinger: {
      host: process.env.HOSTINGER_HOST || "smtp.hostinger.com",
      port: parseInt(process.env.HOSTINGER_PORT || "465", 10),
      email: process.env.HOSTINGER_EMAIL || "support@example.com",
      password: process.env.HOSTINGER_PASSWORD || "your_password",
    },
  },
  checkout: {
    stripe: {
      secret: process.env.APP_STRIPE_SECRET_KEY,
      webhookSecret: process.env.APP_STRIPE_WEBHOOK_SECRET,
      successFrontUrl: process.env.APP_STRIPE_SUCCESS_FRONT_URL,
      cancelFrontUrl: process.env.APP_STRIPE_CANCEL_FRONT_URL,
      apiVersion: process.env.APP_STRIPE_API_VERSION,
    },
  },
});
