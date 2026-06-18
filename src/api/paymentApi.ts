import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type PaymentDetailRow = {
  id?: string | number;
  firm_name?: string;
  branch_name?: string;
  store_code?: string;
  weight?: string | number;
  oil_rate?: string | number;
  gst_amount?: string | number;
  amount?: string | number;
  pickup_date?: string;
  payment_date?: string;
  invoice_number?: string;
  receipt_no?: string;
  payment_remarks?: string;
  payment_ref_2_url?: string;
};

export type PaymentDetailsResult = {
  payments: PaymentDetailRow[];
  totalPayments: number;
  totalSettledAmount: number;
  firmName?: string;
  storeCode?: string;
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
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const r = raw as Record<string, unknown>;
  return {
    id: r.collection_request_id ?? r.id,
    firm_name: r.firm_name != null ? String(r.firm_name) : undefined,
    branch_name: r.branch_name != null ? String(r.branch_name) : undefined,
    store_code: r.store_code != null ? String(r.store_code) : undefined,
    weight: r.actual_volume ?? r.weight,
    oil_rate: r.oil_rate,
    gst_amount: r.gst_amount,
    amount: r.amount,
    pickup_date:
      r.pickup_time != null && String(r.pickup_time).trim()
        ? String(r.pickup_time)
        : r.pickup_date != null
          ? String(r.pickup_date)
          : undefined,
    payment_date:
      r.payment_time != null && String(r.payment_time).trim()
        ? String(r.payment_time)
        : r.payment_date != null
          ? String(r.payment_date)
          : undefined,
    invoice_number:
      r.invoice_number != null && String(r.invoice_number).trim()
        ? String(r.invoice_number)
        : undefined,
    receipt_no: r.receipt_no != null ? String(r.receipt_no) : undefined,
    payment_remarks:
      r.payment_remarks != null && String(r.payment_remarks).trim()
        ? String(r.payment_remarks)
        : undefined,
    payment_ref_2_url:
      r.payment_ref_2_url != null && String(r.payment_ref_2_url).trim()
        ? String(r.payment_ref_2_url)
        : undefined,
  };
}

function parsePaymentPayload(payload: unknown): PaymentDetailsResult {
  if (Array.isArray(payload)) {
    const payments = payload.map(normalizeRow);
    return {
      payments,
      totalPayments: payments.length,
      totalSettledAmount: 0,
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {payments: [], totalPayments: 0, totalSettledAmount: 0};
  }

  const block = payload as Record<string, unknown>;
  const rawPayments = block.payments;
  const payments = Array.isArray(rawPayments) ? rawPayments.map(normalizeRow) : [];

  return {
    payments,
    totalPayments: Number(block.total_payments ?? payments.length) || payments.length,
    totalSettledAmount: Number(block.total_settled_amount ?? 0) || 0,
    firmName: block.firm_name != null ? String(block.firm_name) : undefined,
    storeCode: block.store_code != null ? String(block.store_code) : undefined,
  };
}

export async function fetchPaymentDetails(input: {
  vendor_id: string | number;
  date_from: string;
  date_upto: string;
}): Promise<PaymentDetailsResult> {
  const vendorId = String(input.vendor_id ?? '').trim();
  if (!vendorId) {
    throw new Error('Vendor ID is missing. Please sign in again.');
  }

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/payments/list`,
    {
      vendor_id: vendorId,
      date_from: input.date_from,
      date_upto: input.date_upto,
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return parsePaymentPayload(unwrapKnparises(data));
}
