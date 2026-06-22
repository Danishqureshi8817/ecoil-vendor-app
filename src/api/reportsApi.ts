import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';
import {knparisesDateToApi} from '@/utils/knparisesDate';

export type BranchCounterOption = {
  id: string | number;
  label: string;
  storeCode?: string;
  branchName?: string;
};

export type CounterCollectionRow = Record<string, unknown> & {
  id?: string | number;
  collection_request_id?: string | number;
  request_id?: string | number;
  branch_name?: string;
  store_code?: string;
  request_date?: string;
  request_type?: string;
  request_type_name?: string;
  entered_drums_qty?: string | number;
  actual_drums_qty?: string | number;
  actual_drums_qty_temp?: string | number;
  entered_volume?: string | number;
  actual_volume?: string | number;
  actual_volume_temp?: string | number;
  empty_drums_qty?: string | number;
  empty_drums?: string | number;
  transfer_ticket?: string;
  challan?: string;
  challan_url?: string;
  gate_pass?: string;
  address?: string;
  address_line1?: string;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function normalizeBranchOption(raw: unknown): BranchCounterOption | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const id = row.id ?? row.user_id ?? row.request_by ?? row.counter_id;
  if (id == null || id === '') {
    return null;
  }
  const storeCode =
    row.store_code != null && String(row.store_code).trim()
      ? String(row.store_code).trim()
      : undefined;
  const branchName =
    row.branch_name != null && String(row.branch_name).trim()
      ? String(row.branch_name).trim()
      : undefined;
  const label =
    row.label != null && String(row.label).trim()
      ? String(row.label).trim()
      : branchName ?? (storeCode ? `Store ${storeCode}` : `Counter ${id}`);
  return {
    id: typeof id === 'number' ? id : String(id),
    label,
    storeCode,
    branchName,
  };
}

function normalizeBranchList(payload: unknown): BranchCounterOption[] {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeBranchOption)
      .filter((item): item is BranchCounterOption => item != null);
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.counters)) {
      return obj.counters
        .map(normalizeBranchOption)
        .filter((item): item is BranchCounterOption => item != null);
    }
    for (const key of [
      'list',
      'branches',
      'branch_counters',
      'branchCounters',
      'rows',
      'items',
    ]) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as unknown[])
          .map(normalizeBranchOption)
          .filter((item): item is BranchCounterOption => item != null);
      }
    }
  }
  return [];
}

function normalizeCollectionRow(raw: unknown): CounterCollectionRow {
  if (raw && typeof raw === 'object') {
    return raw as CounterCollectionRow;
  }
  return {};
}

function normalizeCollectionList(payload: unknown): CounterCollectionRow[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeCollectionRow);
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    for (const key of [
      'list',
      'collections',
      'collection',
      'collectionrequests',
      'collection_requests',
      'rows',
      'items',
      'data',
    ]) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as unknown[]).map(normalizeCollectionRow);
      }
    }
  }
  return [];
}

export async function fetchBranchCountersList(payload: {
  user_id: string | number;
  user_type: string | number;
  vendor_id: string | number;
}): Promise<BranchCounterOption[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/reports/getBranchCountersList`,
    {
      user_id: String(payload.user_id),
      user_type: String(payload.user_type),
      vendor_id: String(payload.vendor_id),
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeBranchList(unwrapKnparises(data));
}

export async function fetchCollectionByCounters(input: {
  date_from: string;
  date_upto: string;
  request_by: string | number;
}): Promise<CounterCollectionRow[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/reports/getCollectionByCounters`,
    {
      date_from: knparisesDateToApi(input.date_from),
      date_upto: knparisesDateToApi(input.date_upto),
      request_by: String(input.request_by),
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeCollectionList(unwrapKnparises(data));
}

export function counterCollectionId(row: CounterCollectionRow): string | null {
  const id =
    row.collection_request_id ??
    row.request_id ??
    row.id ??
    row.coll_req_id;
  if (id == null || id === '') {
    return null;
  }
  return String(id);
}

export function counterCollectionBranchLabel(row: CounterCollectionRow): string {
  const store = row.store_code != null ? String(row.store_code).trim() : '';
  const branch = row.branch_name != null ? String(row.branch_name).trim() : '';
  const parts = [store, branch].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(', ');
  }
  return branch || store || '—';
}

export function counterCollectionRequestType(row: CounterCollectionRow): string {
  const type = row.request_type_name ?? row.request_type;
  return type != null && String(type).trim() !== '' ? String(type) : '—';
}

export function counterCollectionAddress(row: CounterCollectionRow): string {
  const parts = [
    row.address_line1,
    row.address_line2,
    row.address_line3,
    row.address,
    row.area,
    row.city,
  ]
    .map(v => (v != null ? String(v).trim() : ''))
    .filter(Boolean);
  return parts.join(', ') || '—';
}

const KNPARISES_FILE_BASE = 'https://app.knparises.com';

export function counterCollectionFileUrl(value: unknown): string {
  if (value == null || value === '') {
    return '';
  }
  const raw = String(value).trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.startsWith('/')) {
    return `${KNPARISES_FILE_BASE}${raw}`;
  }
  return `${KNPARISES_FILE_BASE}/${raw}`;
}
