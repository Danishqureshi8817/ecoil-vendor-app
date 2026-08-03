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

export type WastePicturePayload = {
  uri: string;
  name: string;
  type: string;
};

export type WasteCategoryEntry = {
  waste_category_id: string;
  name: string;
};

export type WasteRequestRow = {
  id?: string | number;
  request_id?: string | number;
  waste_collection_id?: string | number;
  scrap_vendor_id?: string | number;
  vendor_id?: string | number;
  firm_name?: string;
  branch_name?: string;
  waste_categories?: string | string[];
  /** Parallel to waste_categories — IDs to post as waste_category_id on submit. */
  waste_category_ids?: string | number | Array<string | number>;
  waste_category_list?: WasteCategoryEntry[] | string[];
  categories?: WasteCategoryEntry[] | string[];
  request_date_time?: string;
  request_date?: string;
  created_at?: string;
  status?: string;
  /** 1 = created by logged-in waste vendor; can edit/delete */
  entry_by_sv?: string | number;
  [key: string]: unknown;
};

export type LinkedWasteVendor = {
  id: string;
  firm_name: string;
};

export type LinkedWasteCategory = {
  id: string;
  name: string;
};

export type CreateWasteRequestInput = {
  vendor_id: string | number;
  waste_category_ids: Array<string | number>;
  vendorUserId?: string | number;
};

export type UpdateWasteRequestInput = CreateWasteRequestInput & {
  waste_collection_id: string | number;
};

export type DeleteWasteRequestInput = {
  waste_collection_id: string | number;
  vendor_id: string | number;
  vendorUserId?: string | number;
};

export type WasteCategorySubmitItem = {
  waste_category_id: string;
  weight: string;
  waste_picture1: WastePicturePayload | null;
  waste_picture2: WastePicturePayload | null;
  waste_picture3: WastePicturePayload | null;
  waste_picture4: WastePicturePayload | null;
};

export type CompleteWasteRequestInput = {
  waste_collection_id: string | number;
  scrap_vendor_id?: string | number | null;
  vendor_id?: string | number | null;
  vendorUserId?: string | number;
  categories: WasteCategorySubmitItem[];
};

function normalizeRow(raw: unknown): WasteRequestRow {
  if (raw && typeof raw === 'object') {
    return raw as WasteRequestRow;
  }
  return {value: raw};
}

function normalizeWasteList(payload: unknown): WasteRequestRow[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeRow);
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const keys = [
      'list',
      'requests',
      'waste_requests',
      'wasteRequests',
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

export function wasteCollectionId(row: WasteRequestRow): string {
  const id = row.waste_collection_id ?? row.id ?? row.request_id;
  return id != null && String(id).trim() !== '' ? String(id) : '';
}

/** @deprecated Prefer wasteCollectionId — kept for existing imports. */
export function wasteRequestId(row: WasteRequestRow): string {
  return wasteCollectionId(row);
}

export function wasteFirmName(row: WasteRequestRow): string {
  return row.firm_name != null && String(row.firm_name).trim() !== ''
    ? String(row.firm_name)
    : '—';
}

export function wasteBranchName(row: WasteRequestRow): string {
  return wasteBranchDisplay(row) ?? '—';
}

export function wasteBranchDisplay(row: WasteRequestRow): string | null {
  const name =
    row.branch_name != null ? String(row.branch_name).trim() : '';
  return name || null;
}

export function wasteCategoriesLabel(row: WasteRequestRow): string {
  const raw = row.waste_categories;
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean).join(', ') || '—';
  }
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim();
  }
  const fromList = parseWasteCategories(row)
    .map(c => c.name)
    .filter(Boolean);
  return fromList.length ? fromList.join(', ') : '—';
}

export function wasteRequestDateTime(row: WasteRequestRow): string {
  const raw =
    row.request_date_time ?? row.request_date ?? row.created_at ?? '';
  if (raw == null || String(raw).trim() === '') {
    return '—';
  }
  return String(raw);
}

/** Resolve one or more waste categories for process form steps. */
export function parseWasteCategories(row: WasteRequestRow): WasteCategoryEntry[] {
  const fromStructured = row.waste_category_list ?? row.categories;
  if (Array.isArray(fromStructured) && fromStructured.length > 0) {
    return fromStructured
      .map(item => {
        if (typeof item === 'string') {
          const name = item.trim();
          return name ? {waste_category_id: name, name} : null;
        }
        const name = String(
          item.name ?? item.waste_category_id ?? '',
        ).trim();
        const id = String(item.waste_category_id ?? item.name ?? '').trim();
        if (!name && !id) {
          return null;
        }
        return {
          waste_category_id: id || name,
          name: name || id,
        };
      })
      .filter((x): x is WasteCategoryEntry => x != null);
  }

  const names = splitCsvOrList(row.waste_categories);
  const ids = splitCsvOrList(row.waste_category_ids);

  if (names.length > 0 || ids.length > 0) {
    const count = Math.max(names.length, ids.length);
    const entries: WasteCategoryEntry[] = [];
    for (let i = 0; i < count; i++) {
      const name = names[i] ?? ids[i] ?? '';
      const id = ids[i] ?? names[i] ?? '';
      if (!name && !id) {
        continue;
      }
      entries.push({
        // Prefer real ID for submit; fall back to name only if IDs missing.
        waste_category_id: id || name,
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

/** True when request was raised by the logged-in waste vendor (editable). */
export function isWasteRequestOwnedByUser(row: WasteRequestRow): boolean {
  const flag = row.entry_by_sv;
  return flag === 1 || flag === '1' || String(flag ?? '').trim() === '1';
}

function normalizeLinkedVendors(payload: unknown): LinkedWasteVendor[] {
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
    .filter((x): x is LinkedWasteVendor => x != null);
}

function normalizeLinkedCategories(payload: unknown): LinkedWasteCategory[] {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = String(
        row.id ??
          row.waste_category_id ??
          row.scrap_category_id ??
          row.category_id ??
          '',
      ).trim();
      const name = String(
        row.name ?? row.category_name ?? row.waste_category ?? row.scrap_category ?? '',
      ).trim();
      if (!id) {
        return null;
      }
      return {id, name: name || id};
    })
    .filter((x): x is LinkedWasteCategory => x != null);
}

export async function fetchLinkedWasteVendors(): Promise<LinkedWasteVendor[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getLinkedVendors`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeLinkedVendors(unwrapKnparises(data));
}

export async function fetchLinkedWasteCategories(): Promise<LinkedWasteCategory[]> {
  const url = `${apiBase()}/scrap-vendors/getWasteCategories`;
  console.log('[WasteCategories] Request URL:', url);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    url,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  console.log('[WasteCategories] Response:', data);
  return normalizeLinkedCategories(unwrapKnparises(data));
}

export async function createWasteRequest(
  input: CreateWasteRequestInput,
): Promise<unknown> {
  const categoryIds = input.waste_category_ids
    .map(id => String(id).trim())
    .filter(Boolean);
  const body = {
    vendor_id: String(input.vendor_id),
    waste_category_ids: categoryIds,
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/waste-requests/create`;
  console.log('[WasteCreate] Request URL:', url);
  console.log('[WasteCreate] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[WasteCreate] Response:', data);
  return unwrapKnparises(data);
}

export async function updateWasteRequest(
  input: UpdateWasteRequestInput,
): Promise<unknown> {
  const categoryIds = input.waste_category_ids
    .map(id => String(id).trim())
    .filter(Boolean);
  const body = {
    waste_collection_id: String(input.waste_collection_id),
    vendor_id: String(input.vendor_id),
    waste_category_ids: categoryIds,
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/waste-requests/update`;
  console.log('[WasteUpdate] Request URL:', url);
  console.log('[WasteUpdate] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[WasteUpdate] Response:', data);
  return unwrapKnparises(data);
}

export async function deleteWasteRequest(
  input: DeleteWasteRequestInput,
): Promise<unknown> {
  const body = {
    waste_collection_id: String(input.waste_collection_id),
    vendor_id: String(input.vendor_id),
    ...(input.vendorUserId != null
      ? {vendorUserId: String(input.vendorUserId)}
      : {}),
  };
  const url = `${apiBase()}/waste-requests/remove`;
  console.log('[WasteRemove] Request URL:', url);
  console.log('[WasteRemove] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[WasteRemove] Response:', data);
  return unwrapKnparises(data);
}

/**
 * Assigned waste requests — same auth style as collections:
 * POST + { vendorUserId } + Bearer token + unwrapKnparises.
 * URL: {API_ORIGIN}/api/waste-requests/assigned
 */
export async function fetchAssignedWasteRequests(
  vendorUserId: string | number = 0,
): Promise<WasteRequestRow[]> {
  const url = `${apiBase()}/waste-requests/assigned`;
  const body = {vendorUserId};

  console.log('[wasteRequests] Request URL:', url);
  console.log('[wasteRequests] Request body:', body);

  try {
    const {data} = await axios.post<KnparisesEnvelope<unknown>>(
      url,
      body,
      {headers: bearerHeaders(), timeout: 60_000},
    );

    console.log('[wasteRequests] Response:', data);

    return normalizeWasteList(unwrapKnparises(data));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('[wasteRequests] Request failed:', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.log('[wasteRequests] Request failed:', error);
    }
    throw error;
  }
}

function appendPicture(
  form: FormData,
  fieldName: string,
  file: WastePicturePayload | null,
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
 * Submit processed waste request.
 * URL: {API_ORIGIN}/api/waste-requests/submit
 * Content-Type: multipart/form-data
 */
export async function completeWasteRequest(
  input: CompleteWasteRequestInput,
): Promise<unknown> {
  const form = new FormData();

  form.append('waste_collection_id', String(input.waste_collection_id));
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
      `categories[${index}][waste_category_id]`,
      cat.waste_category_id,
    );
    form.append(`categories[${index}][weight]`, cat.weight.trim());
    appendPicture(
      form,
      `categories[${index}][waste_picture1]`,
      cat.waste_picture1,
    );
    appendPicture(
      form,
      `categories[${index}][waste_picture2]`,
      cat.waste_picture2,
    );
    appendPicture(
      form,
      `categories[${index}][waste_picture3]`,
      cat.waste_picture3,
    );
    appendPicture(
      form,
      `categories[${index}][waste_picture4]`,
      cat.waste_picture4,
    );
  });

  const url = `${apiBase()}/waste-requests/submit`;
  console.log('[WasteSubmit] Request URL:', url);
  console.log('[WasteSubmit] Meta:', {
    waste_collection_id: input.waste_collection_id,
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
    console.log('[WasteSubmit] Response:', data);
    return unwrapKnparises(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('[WasteSubmit] Request failed:', {
        url: error.config?.url ?? url,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.log('[WasteSubmit] Request failed:', error);
    }
    throw error;
  }
}
