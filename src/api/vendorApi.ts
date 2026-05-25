import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {ExternalAuthSession, KnparisesEnvelope} from '@/types/vendor';
import {unwrapKnparises} from '@/utils/knparises';

type ValidateLoginData = {
  token?: string;
  expiry?: string;
  user?: Record<string, unknown>;
};

function normalizeUser(raw: Record<string, unknown>) {
  return {
    name: String(raw.name ?? raw.user_name ?? 'Vendor'),
    email: raw.email != null ? String(raw.email) : undefined,
    mobile: raw.mobile != null ? String(raw.mobile) : undefined,
    firm_name:
      raw.firm_name != null
        ? String(raw.firm_name)
        : raw.firmName != null
          ? String(raw.firmName)
          : undefined,
    ...raw,
  };
}

export async function validateVendorLogin(
  mobile: string,
  password: string,
): Promise<ExternalAuthSession> {
  const trimmedMobile = mobile.trim();
  if (!trimmedMobile || !password) {
    throw new Error('Mobile and password are required');
  }

  const form = new URLSearchParams();
  form.set('mobile', trimmedMobile);
  form.set('password', password);

  const {data: body} = await axios.post<KnparisesEnvelope<ValidateLoginData>>(
    `${VENDOR_API_BASE.replace(/\/$/, '')}/login/validate`,
    form.toString(),
    {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      timeout: 60_000,
    },
  );

  const block = unwrapKnparises(body);
  const token = block.token;
  const userRaw = block.user;

  if (!token || !userRaw || typeof userRaw !== 'object') {
    throw new Error('Invalid login response from server');
  }

  return {
    token,
    expiry: block.expiry ?? null,
    user: normalizeUser(userRaw as Record<string, unknown>),
  };
}
