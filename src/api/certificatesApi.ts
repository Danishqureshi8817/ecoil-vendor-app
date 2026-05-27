import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type CertificateRow = {
  month_year: string;
  year_month_no: string;
  co2_monthly_pdf_url: string;
  co2_tilldate_pdf_url: string;
  ruco_pdf_url: string;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

function normalizeRow(raw: unknown): CertificateRow | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const x = raw as Record<string, unknown>;
  const month_year = x.month_year != null ? String(x.month_year) : '';
  if (!month_year) {
    return null;
  }
  return {
    month_year,
    year_month_no: String(x.year_month_no ?? ''),
    co2_monthly_pdf_url: String(x.co2_monthly_pdf_url ?? ''),
    co2_tilldate_pdf_url: String(x.co2_tilldate_pdf_url ?? ''),
    ruco_pdf_url: String(x.ruco_pdf_url ?? ''),
  };
}

export async function fetchCertificatesList(): Promise<CertificateRow[]> {
  const {data} = await axios.get<KnparisesEnvelope<unknown>>(
    `${base()}/certificates/list`,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  const payload = unwrapKnparises(data);
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map(normalizeRow).filter((r): r is CertificateRow => r != null);
}
