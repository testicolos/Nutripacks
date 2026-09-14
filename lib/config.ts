export const appConfig = {
  paymentProvider: process.env.PAYMENT_PROVIDER ?? 'QIIB',
  paymentEnabled: Boolean(process.env.QIIB_MERCHANT_ID && process.env.QIIB_API_BASE_URL),
  databaseProvider: 'postgresql',
  currentHost: 'vercel',
  targetHost: 'qhost'
} as const;
