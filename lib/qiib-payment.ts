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
  const apiEndpointPresent = Boolean(process.env.QIIB_API_ENDPOINT);
  const callbackSecretPresent = Boolean(process.env.QIIB_CALLBACK_SECRET);
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

// The bank-specific request signing and hosted-card-session call will be added
// only after QIIB provides the official merchant integration specification.
// Nutripacks must never collect or store raw PAN/CVV values itself.
