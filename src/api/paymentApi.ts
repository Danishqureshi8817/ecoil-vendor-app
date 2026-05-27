import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type PaymentDetailRow = {
  id?: string | number;
  weight?: string | number;
  request_date?: string;
  oil_rate?: string | number;
  pickup_date?: string;
  amount?: string | number;
  payment_date?: string;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

function normalizeRow(raw: unknown): PaymentDetailRow {
  if (raw && typeof raw === 'object') {
    return raw as PaymentDetailRow;
  }
  return {};
}

export async function fetchPaymentDetails(input: {
  date_from: string;
  date_upto: string;
}): Promise<PaymentDetailRow[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/payments/list`,
    input,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  const payload = unwrapKnparises(data);
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map(normalizeRow);
}
