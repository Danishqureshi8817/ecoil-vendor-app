import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type CollectionRequestRow = Record<string, unknown> & {
  id?: string | number;
  request_id?: string | number;
  collection_request_id?: string | number;
  coll_req_id?: string | number;
  request_type_name?: string;
  request_type?: string;
  request_date?: string;
  date?: string;
  status?: string;
  request_status?: string | number;
  request_status_name?: string;
  state?: string;
  actual_drums_qty_temp?: string | number;
  actual_drums_qty?: string | number;
  actual_volume_temp?: string | number;
  actual_volume?: string | number;
  oil_quantity?: string | number;
  entered_drums_qty?: string | number;
  entered_volume?: string | number;
  empty_drums_qty?: string | number;
  empty_drums?: string | number;
  notes_for_team?: string;
  notes?: string;
  created_at?: string;
  submitted_at?: string;
  max_completion_datetime?: string;
  logistic_manager?: string;
  assigned_to_name?: string;
  vehicle_no?: string;
  security_code?: string;
  gate_pass?: string;
};

export type SubmitCollectionRequestInput = {
  entered_drums_qty: number;
  entered_volume: number;
  empty_drums_qty: number;
  notes_for_team: string;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

function normalizeRow(raw: unknown): CollectionRequestRow {
  if (raw && typeof raw === 'object') {
    return raw as CollectionRequestRow;
  }
  return {value: raw};
}

function normalizeCollectionList(payload: unknown): CollectionRequestRow[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeRow);
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const keys = [
      'list',
      'requests',
      'coll_req',
      'collReq',
      'collection_requests',
      'collectionRequests',
      'collectionrequests',
      'rows',
      'items',
    ];
    for (const key of keys) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as unknown[]).map(normalizeRow);
      }
    }
    if (Object.keys(obj).length > 0) {
      return [normalizeRow(obj)];
    }
  }
  return [];
}

function normalizeCollectionRecord(payload: unknown): CollectionRequestRow | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.collectionrequests)) {
    const first = obj.collectionrequests[0];
    return first && typeof first === 'object' ? normalizeRow(first) : null;
  }
  if (obj.collectionrequests && typeof obj.collectionrequests === 'object') {
    return normalizeRow(obj.collectionrequests);
  }
  return normalizeRow(obj);
}

export async function fetchAllCollectionRequests(): Promise<CollectionRequestRow[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/collections/list`,
    {vendorUserId: 0},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeCollectionList(unwrapKnparises(data));
}

export async function fetchCollectionRequestsByVendor(
  vendorUserId: string | number,
): Promise<CollectionRequestRow[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/collections/list`,
    {vendorUserId},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeCollectionList(unwrapKnparises(data));
}

export async function fetchCollectionRequestById(
  id: string | number,
  vendorUserId: string | number = 0,
): Promise<CollectionRequestRow> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/collections/detail`,
    {id, vendorUserId},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  const record = normalizeCollectionRecord(unwrapKnparises(data));
  if (!record) {
    throw new Error('Collection request not found');
  }
  return record;
}

export async function submitCollectionRequest(
  input: SubmitCollectionRequestInput,
): Promise<unknown> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/collections/submit`,
    {
      entered_drums_qty: input.entered_drums_qty,
      entered_volume: input.entered_volume,
      empty_drums_qty: input.empty_drums_qty,
      notes_for_team: input.notes_for_team.trim(),
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return unwrapKnparises(data);
}

export function collectionRequestLabel(row: CollectionRequestRow): string {
  const typeName = row.request_type_name ?? row.request_type;
  if (typeName != null && String(typeName).trim() !== '') {
    return String(typeName);
  }
  const id =
    row.collection_request_id ?? row.request_id ?? row.id ?? row.coll_req_id;
  if (id != null && id !== '') {
    return `Request #${id}`;
  }
  return 'Collection request';
}

export function collectionRequestStatus(row: CollectionRequestRow): string {
  const s = row.request_status_name ?? row.request_status ?? row.status ?? row.state;
  return s != null ? String(s) : '—';
}

export function collectionRequestId(row: CollectionRequestRow): string | null {
  const id = row.id ?? row.request_id ?? row.collection_request_id ?? row.coll_req_id;
  if (id == null || id === '') {
    return null;
  }
  return String(id);
}
