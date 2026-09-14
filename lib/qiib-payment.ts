export type QiibGatewayStatus = {
  provider: 'QIIB';
  configured: boolean;
  cardOnly: true;
  mode: 'disabled' | 'sandbox' | 'production';
  merchantIdPresent: boolean;
  apiEndpointPresent: boolean;
  callbackSecretPresent: boolean;
};

export function getQiibGatewayStatus(): QiibGatewayStatus {
  const merchantIdPresent = Boolean(process.env.QIIB_MERCHANT_ID);
  const apiEndpointPresent = Boolean(process.env.QIIB_API_BASE_URL);
  const callbackSecretPresent = Boolean(process.env.QIIB_WEBHOOK_SECRET);
  const configured = merchantIdPresent && apiEndpointPresent && callbackSecretPresent;
  const requested = (process.env.QIIB_MODE || '').toLowerCase();
  const mode: QiibGatewayStatus['mode'] = configured ? (requested === 'production' ? 'production' : 'sandbox') : 'disabled';
  return { provider: 'QIIB', configured, cardOnly: true, mode, merchantIdPresent, apiEndpointPresent, callbackSecretPresent };
}

export function assertQiibConfigured() {
  const status = getQiibGatewayStatus();
  if (!status.configured) throw new Error('QIIB_GATEWAY_NOT_CONFIGURED');
  return status;
}

// Bank-specific request signing and hosted-card-session calls are intentionally
// not guessed. They will be added after QIIB supplies the official merchant API
// specification. Nutripacks must never collect or store raw PAN/CVV values.
