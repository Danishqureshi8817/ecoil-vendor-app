import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type AgreementContent = {
  content: string;
  status: number;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

function parseAgreementPayload(payload: unknown): AgreementContent {
  if (!payload || typeof payload !== 'object') {
    return {content: '', status: 0};
  }
  const obj = payload as Record<string, unknown>;
  return {
    content: obj.content != null ? String(obj.content) : '',
    status: Number(obj.status ?? 0),
  };
}

export async function fetchAgreement(
  userId: string | number,
): Promise<AgreementContent> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/agreement/get`,
    {userId, on_email: 0},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return parseAgreementPayload(unwrapKnparises(data));
}

export async function acceptAgreement(userId: string | number): Promise<void> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/agreement/accept`,
    {userId},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  if (data.status === 'Error') {
    throw new Error(data.message || 'Could not accept agreement');
  }
}

export async function emailAgreement(
  userId: string | number,
): Promise<{status: string; message: string}> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/agreement/get`,
    {userId, on_email: 1},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  if (data.status === 'Error') {
    throw new Error(data.message || 'Could not send agreement email');
  }
  return {
    status: String(data.status ?? 'Success'),
    message: String(data.message ?? 'Agreement sent to your email'),
  };
}
