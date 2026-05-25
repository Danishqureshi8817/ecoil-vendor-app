import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type CollectionRequestRow = Record<string, unknown> & {
  id?: string | number;
  request_id?: string | number;
  status?: string;
  entered_drums_qty?: string | number;
  entered_volume?: string | number;
  empty_drums_qty?: string | number;
  notes_for_team?: string;
  created_at?: string;
  request_date?: string;
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

export async function fetchAllCollectionRequests(): Promise<CollectionRequestRow[]> {
  const {data} = await axios.get<KnparisesEnvelope<unknown>>(
    `${base()}/webdata/getAllCollReq`,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeCollectionList(unwrapKnparises(data));
}

export async function submitCollectionRequest(
  input: SubmitCollectionRequestInput,
): Promise<unknown> {
  const form = new FormData();
  form.append('entered_drums_qty', String(input.entered_drums_qty));
  form.append('entered_volume', String(input.entered_volume));
  form.append('empty_drums_qty', String(input.empty_drums_qty));
  form.append('notes_for_team', input.notes_for_team.trim());

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${base()}/collectionrequests/submit`,
    form,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return unwrapKnparises(data);
}

export function collectionRequestLabel(row: CollectionRequestRow): string {
  const id =
    row.collection_request_id ?? row.request_id ?? row.id ?? row.coll_req_id;
  if (id != null && id !== '') {
    return `Request #${id}`;
  }
  return 'Collection request';
}

export function collectionRequestStatus(row: CollectionRequestRow): string {
  const s = row.request_status ?? row.status ?? row.state;
  return s != null ? String(s) : '—';
}
