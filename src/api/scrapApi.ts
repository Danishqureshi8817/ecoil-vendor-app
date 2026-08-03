import axios from 'axios';
import {API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {unwrapKnparises} from '@/utils/knparises';
import {getStoredToken} from '@/utils/sessionStorage';

const apiBase = () => API_BASE.replace(/\/$/, '');

/** Same auth headers as collectionApi / detail screens. */
function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {Authorization: `Bearer ${token}`, Accept: 'application/json'};
}

export type ScrapPicturePayload = {
  uri: string;
  name: string;
  type: string;
};

export type ScrapCategoryEntry = {
  scrap_category_id: string;
  name: string;
};

export type ScrapRequestRow = {
  id?: string | number;
  request_id?: string | number;
  scrap_collection_id?: string | number;
  scrap_vendor_id?: string | number;
  vendor_id?: string | number;
  firm_name?: string;
  branch_name?: string;
  scrap_categories?: string | string[];
  /** Parallel to scrap_categories — IDs to post as scrap_category_id on submit. */
  scrap_category_ids?: string | number | Array<string | number>;
  scrap_category_list?: ScrapCategoryEntry[] | string[];
  categories?: ScrapCategoryEntry[] | string[];
  request_date_time?: string;
  request_date?: string;
  created_at?: string;
  status?: string;
  /** 1 = created by logged-in scrap vendor; can edit/delete */
  entry_by_sv?: string | number;
  [key: string]: unknown;
};

export type LinkedScrapVendor = {
  id: string;
  firm_name: string;
};

export type LinkedScrapCategory = {
  id: string;
  name: string;
};

export type CreateScrapRequestInput = {
  vendor_id: string | number;
  scrap_category_ids: Array<string | number>;
  vendorUserId?: string | number;
};

export type UpdateScrapRequestInput = CreateScrapRequestInput & {
  scrap_collection_id: string | number;
};

export type DeleteScrapRequestInput = {
  scrap_collection_id: string | number;
  vendor_id: string | number;
  vendorUserId?: string | number;
};

export type ScrapCategorySubmitItem = {
  scrap_category_id: string;
  weight: string;
  scrap_picture1: ScrapPicturePayload | null;
  scrap_picture2: ScrapPicturePayload | null;
  scrap_picture3: ScrapPicturePayload | null;
  scrap_picture4: ScrapPicturePayload | null;
};

export type CompleteScrapRequestInput = {
  scrap_collection_id: string | number;
  scrap_vendor_id?: string | number | null;
  vendor_id?: string | number | null;
  vendorUserId?: string | number;
  categories: ScrapCategorySubmitItem[];
};

function normalizeRow(raw: unknown): ScrapRequestRow {
  if (raw && typeof raw === 'object') {
    return raw as ScrapRequestRow;
  }
  return {value: raw};
}

function normalizeScrapList(payload: unknown): ScrapRequestRow[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeRow);
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const keys = [
      'list',
      'requests',
      'scrap_requests',
      'scrapRequests',
      'assigned',
      'rows',
      'items',
      'data',
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

export function scrapCollectionId(row: ScrapRequestRow): string {
  const id = row.scrap_collection_id ?? row.id ?? row.request_id;
  return id != null && String(id).trim() !== '' ? String(id) : '';
}

/** @deprecated Prefer scrapCollectionId — kept for existing imports. */
export function scrapRequestId(row: ScrapRequestRow): string {
  return scrapCollectionId(row);
}

export function scrapFirmName(row: ScrapRequestRow): string {
  return row.firm_name != null && String(row.firm_name).trim() !== ''
    ? String(row.firm_name)
    : '—';
}

export function scrapBranchName(row: ScrapRequestRow): string {
  return scrapBranchDisplay(row) ?? '—';
}

export function scrapBranchDisplay(row: ScrapRequestRow): string | null {
  const name =
    row.branch_name != null ? String(row.branch_name).trim() : '';
  return name || null;
}

export function scrapCategoriesLabel(row: ScrapRequestRow): string {
  const raw = row.scrap_categories;
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean).join(', ') || '—';
  }
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim();
  }
  const fromList = parseScrapCategories(row)
    .map(c => c.name)
    .filter(Boolean);
  return fromList.length ? fromList.join(', ') : '—';
}

export function scrapRequestDateTime(row: ScrapRequestRow): string {
  const raw =
    row.request_date_time ?? row.request_date ?? row.created_at ?? '';
  if (raw == null || String(raw).trim() === '') {
    return '—';
  }
  return String(raw);
}

/** Resolve one or more scrap categories for process form steps. */
export function parseScrapCategories(row: ScrapRequestRow): ScrapCategoryEntry[] {
  const fromStructured = row.scrap_category_list ?? row.categories;
  if (Array.isArray(fromStructured) && fromStructured.length > 0) {
    return fromStructured
      .map(item => {
        if (typeof item === 'string') {
          const name = item.trim();
          return name ? {scrap_category_id: name, name} : null;
        }
        const name = String(
          item.name ?? item.scrap_category_id ?? '',
        ).trim();
        const id = String(item.scrap_category_id ?? item.name ?? '').trim();
        if (!name && !id) {
          return null;
        }
        return {
          scrap_category_id: id || name,
          name: name || id,
        };
      })
      .filter((x): x is ScrapCategoryEntry => x != null);
  }

  const names = splitCsvOrList(row.scrap_categories);
  const ids = splitCsvOrList(row.scrap_category_ids);

  if (names.length > 0 || ids.length > 0) {
    const count = Math.max(names.length, ids.length);
    const entries: ScrapCategoryEntry[] = [];
    for (let i = 0; i < count; i++) {
      const name = names[i] ?? ids[i] ?? '';
      const id = ids[i] ?? names[i] ?? '';
      if (!name && !id) {
        continue;
      }
      entries.push({
        // Prefer real ID for submit; fall back to name only if IDs missing.
        scrap_category_id: id || name,
        name: name || id,
      });
    }
    return entries;
  }

  return [];
}

function splitCsvOrList(
  value: string | number | Array<string | number> | undefined | null,
): string[] {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(String).map(s => s.trim()).filter(Boolean);
  }
  const raw = String(value).trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

/** True when request was raised by the logged-in scrap vendor (editable). */
export function isScrapRequestOwnedByUser(row: ScrapRequestRow): boolean {
  const flag = row.entry_by_sv;
  return flag === 1 || flag === '1' || String(flag ?? '').trim() === '1';
}

function normalizeLinkedVendors(payload: unknown): LinkedScrapVendor[] {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row.vendor_id ?? '').trim();
      const firm_name = String(
        row.firm_name ?? row.name ?? row.label ?? '',
      ).trim();
      if (!id) {
        return null;
      }
      return {id, firm_name: firm_name || id};
    })
    .filter((x): x is LinkedScrapVendor => x != null);
}

function normalizeLinkedCategories(payload: unknown): LinkedScrapCategory[] {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = String(
        row.id ?? row.scrap_category_id ?? row.category_id ?? '',
      ).trim();
      const name = String(
        row.name ?? row.category_name ?? row.scrap_category ?? '',
      ).trim();
      if (!id) {
        return null;
      }
      return {id, name: name || id};
    })
    .filter((x): x is LinkedScrapCategory => x != null);
}

export async function fetchLinkedScrapVendors(): Promise<LinkedScrapVendor[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getLinkedVendors`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeLinkedVendors(unwrapKnparises(data));
}

export async function fetchLinkedScrapCategories(): Promise<LinkedScrapCategory[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getScrapCategories`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeLinkedCategories(unwrapKnparises(data));
}

export async function createScrapRequest(
  input: CreateScrapRequestInput,
): Promise<unknown> {
  const categoryIds = input.scrap_category_ids
    .map(id => String(id).trim())
    .filter(Boolean);
  const body = {
    vendor_id: String(input.vendor_id),
    scrap_category_ids: categoryIds,
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/scrap-requests/create`;
  console.log('[ScrapCreate] Request URL:', url);
  console.log('[ScrapCreate] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[ScrapCreate] Response:', data);
  return unwrapKnparises(data);
}

export async function updateScrapRequest(
  input: UpdateScrapRequestInput,
): Promise<unknown> {
  const categoryIds = input.scrap_category_ids
    .map(id => String(id).trim())
    .filter(Boolean);
  const body = {
    scrap_collection_id: String(input.scrap_collection_id),
    vendor_id: String(input.vendor_id),
    scrap_category_ids: categoryIds,
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/scrap-requests/update`;
  console.log('[ScrapUpdate] Request URL:', url);
  console.log('[ScrapUpdate] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[ScrapUpdate] Response:', data);
  return unwrapKnparises(data);
}

export async function deleteScrapRequest(
  input: DeleteScrapRequestInput,
): Promise<unknown> {
  const body = {
    scrap_collection_id: String(input.scrap_collection_id),
    vendor_id: String(input.vendor_id),
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/scrap-requests/remove`;
  console.log('[ScrapRemove] Request URL:', url);
  console.log('[ScrapRemove] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[ScrapRemove] Response:', data);
  return unwrapKnparises(data);
}

/**
 * Assigned scrap requests — same auth style as collections:
 * POST + { vendorUserId } + Bearer token + unwrapKnparises.
 * URL: {API_ORIGIN}/api/scrap-requests/assigned
 */
export async function fetchAssignedScrapRequests(
  vendorUserId: string | number = 0,
): Promise<ScrapRequestRow[]> {
  const url = `${apiBase()}/scrap-requests/assigned`;
  const body = {vendorUserId};

  console.log('[ScrapRequests] Request URL:', url);
  console.log('[ScrapRequests] Request body:', body);

  try {
    const {data} = await axios.post<KnparisesEnvelope<unknown>>(
      url,
      body,
      {headers: bearerHeaders(), timeout: 60_000},
    );

    console.log('[ScrapRequests] Response:', data);

    return normalizeScrapList(unwrapKnparises(data));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('[ScrapRequests] Request failed:', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.log('[ScrapRequests] Request failed:', error);
    }
    throw error;
  }
}

function appendPicture(
  form: FormData,
  fieldName: string,
  file: ScrapPicturePayload | null,
) {
  if (!file) {
    return;
  }
  form.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
}

/**
 * Submit processed scrap request.
 * URL: {API_ORIGIN}/api/scrap-requests/submit
 * Content-Type: multipart/form-data
 */
export async function completeScrapRequest(
  input: CompleteScrapRequestInput,
): Promise<unknown> {
  const form = new FormData();

  form.append('scrap_collection_id', String(input.scrap_collection_id));
  if (input.scrap_vendor_id != null && input.scrap_vendor_id !== '') {
    form.append('scrap_vendor_id', String(input.scrap_vendor_id));
  }
  if (input.vendor_id != null && input.vendor_id !== '') {
    form.append('vendor_id', String(input.vendor_id));
  }
  if (input.vendorUserId != null && input.vendorUserId !== '') {
    form.append('vendorUserId', String(input.vendorUserId));
  }
  form.append('categories_count', String(input.categories.length));

  input.categories.forEach((cat, index) => {
    form.append(
      `categories[${index}][scrap_category_id]`,
      cat.scrap_category_id,
    );
    form.append(`categories[${index}][weight]`, cat.weight.trim());
    appendPicture(
      form,
      `categories[${index}][scrap_picture1]`,
      cat.scrap_picture1,
    );
    appendPicture(
      form,
      `categories[${index}][scrap_picture2]`,
      cat.scrap_picture2,
    );
    appendPicture(
      form,
      `categories[${index}][scrap_picture3]`,
      cat.scrap_picture3,
    );
    appendPicture(
      form,
      `categories[${index}][scrap_picture4]`,
      cat.scrap_picture4,
    );
  });

  const url = `${apiBase()}/scrap-requests/submit`;
  console.log('[ScrapSubmit] Request URL:', url);
  console.log('[ScrapSubmit] Meta:', {
    scrap_collection_id: input.scrap_collection_id,
    scrap_vendor_id: input.scrap_vendor_id,
    vendor_id: input.vendor_id,
    vendorUserId: input.vendorUserId,
    categories_count: input.categories.length,
  });

  try {
    const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, form, {
      headers: {
        ...bearerHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120_000,
    });
    console.log('[ScrapSubmit] Response:', data);
    return unwrapKnparises(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('[ScrapSubmit] Request failed:', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.log('[ScrapSubmit] Request failed:', error);
    }
    throw error;
  }
}
