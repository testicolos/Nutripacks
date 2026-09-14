'use client';

import { useEffect, useState } from 'react';

export type CustomerAuthState = 'loading' | 'in' | 'out';

let cachedState: CustomerAuthState = 'loading';
let inFlight: Promise<CustomerAuthState> | null = null;
const listeners = new Set<(state: CustomerAuthState) => void>();

function publish(state: CustomerAuthState) {
  cachedState = state;
  listeners.forEach(listener => listener(state));
}

export function refreshCustomerAuth(): Promise<CustomerAuthState> {
  if (inFlight) return inFlight;

  inFlight = fetch('/api/customer/me', { cache: 'no-store' })
    .then(response => response.ok ? 'in' as const : 'out' as const)
    .catch(() => 'out' as const)
    .then(state => {
      publish(state);
      return state;
    })
    .finally(() => { inFlight = null; });

  return inFlight;
}

export function useCustomerAuth() {
  const [state, setState] = useState<CustomerAuthState>(cachedState);

  useEffect(() => {
    listeners.add(setState);
    refreshCustomerAuth();
    return () => { listeners.delete(setState); };
  }, []);

  return state;
}

export async function signOutCustomer() {
  try {
    await fetch('/api/customer/logout', { method: 'POST' });
  } finally {
    publish('out');
  }
}
