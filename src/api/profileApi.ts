import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {ExternalVendorUser, KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export const PROFILE_PASSWORD_UNCHANGED = 'PASSWORDNOTCHANGED';

export type SubmitVendorProfileInput = {
  id: string | number;
  mobile: string;
  name: string;
  designation?: string;
  email?: string;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

export async function submitVendorProfile(
  input: SubmitVendorProfileInput,
): Promise<unknown> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/profile/submit`,
    {
      id: String(input.id),
      mobile: input.mobile.trim(),
      name: input.name.trim(),
      designation: input.designation?.trim() ?? '',
      email: input.email?.trim() ?? '',
      password: PROFILE_PASSWORD_UNCHANGED,
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return unwrapKnparises(data);
}

export function mergeProfileUser(
  user: ExternalVendorUser,
  input: SubmitVendorProfileInput,
): ExternalVendorUser {
  return {
    ...user,
    name: input.name.trim(),
    email: input.email?.trim() || user.email,
    designation: input.designation?.trim() ?? user.designation,
  };
}
