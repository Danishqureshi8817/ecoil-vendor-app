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
  /** Assigned team user id; `0` / missing = My Self */
  assign_to_user_id?: string | number;
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

export type ScrapAssignUser = {
  id: string;
  name: string;
  mobile?: string;
};

/** UI + API sentinel: assign request to the logged-in scrap vendor. */
export const SCRAP_ASSIGN_MYSELF_ID = '0';

function firstNonEmptyId(
  ...candidates: Array<string | number | null | undefined>
): string {
  for (const candidate of candidates) {
    if (candidate == null) {
      continue;
    }
    const value = String(candidate).trim();
    if (value !== '') {
      return value;
    }
  }
  return '';
}

/** Display name for assigned user from list/detail row (if API sends it). */
export function scrapAssignToUserName(row?: ScrapRequestRow | null): string {
  if (!row) {
    return '';
  }
  return firstNonEmptyId(
    row.assign_to_user_name as string | number | undefined,
    row.assigned_to_user_name as string | number | undefined,
    row.assigned_user_name as string | number | undefined,
    row.assign_to_name as string | number | undefined,
    row.assigned_to_name as string | number | undefined,
    row.assigned_to as string | number | undefined,
  );
}

/**
 * Resolve assigned user id from list/detail row for edit prefill.
 * Upstream may use several key names; missing / empty → My Self (`0`).
 */
export function scrapAssignToUserId(
  row?: ScrapRequestRow | null,
  users: ScrapAssignUser[] = [],
): string {
  if (!row) {
    return SCRAP_ASSIGN_MYSELF_ID;
  }

  const fromId = firstNonEmptyId(
    row.assign_to_user_id,
    row.assigned_to_user_id as string | number | undefined,
    row.assigned_user_id as string | number | undefined,
    row.assign_user_id as string | number | undefined,
    row.scrap_vendor_user_id as string | number | undefined,
    row.sv_user_id as string | number | undefined,
    row.assigned_to_id as string | number | undefined,
  );
  if (fromId) {
    return fromId;
  }

  const name = scrapAssignToUserName(row);
  if (name && users.length > 0) {
    const match = users.find(
      user => user.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (match) {
      return match.id;
    }
  }

  return SCRAP_ASSIGN_MYSELF_ID;
}

export type CreateScrapRequestInput = {
  scrap_category_ids: Array<string | number>;
  /** Scrap-vendor create flow: target oil outlet. */
  vendor_id?: string | number;
  /** Oil-outlet create flow: target scrap vendor. */
  scrap_vendor_id?: string | number;
  /**
   * `0` = My Self; otherwise scrap team user id from getUsers.
   * Omit for scrap-vendor-user (type 98) and oil-outlet create.
   */
  assign_to_user_id?: string | number;
  vendorUserId?: string | number;
};

export type UpdateScrapRequestInput = CreateScrapRequestInput & {
  scrap_collection_id: string | number;
};

export type AssignScrapRequestInput = {
  scrap_collection_id: string | number;
  assign_to_user_id: string | number;
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

/**
 * Oil outlet → linked scrap vendors.
 * GET shape: { outlet_id, is_linked, scrap_vendors: [...] }
 */
function normalizeOutletLinkedScrapVendors(payload: unknown): LinkedScrapVendor[] {
  let list: unknown[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.scrap_vendors)) {
      list = obj.scrap_vendors;
    }
  }
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = String(
        row.scrap_vendor_id ?? row.id ?? row.vendor_id ?? '',
      ).trim();
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

/** Oil-outlet API: POST /scrap-vendors/getLinkedScrapVendors */
export async function fetchOutletLinkedScrapVendors(): Promise<LinkedScrapVendor[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getLinkedScrapVendors`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeOutletLinkedScrapVendors(unwrapKnparises(data));
}

export async function fetchLinkedScrapCategories(): Promise<LinkedScrapCategory[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getScrapCategories`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeLinkedCategories(unwrapKnparises(data));
}

function normalizeScrapAssignUsers(payload: unknown): ScrapAssignUser[] {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row.user_id ?? '').trim();
      if (!id || id === SCRAP_ASSIGN_MYSELF_ID) {
        return null;
      }
      const name = String(row.name ?? row.user_name ?? '').trim();
      const mobile =
        row.mobile != null && String(row.mobile).trim() !== ''
          ? String(row.mobile).trim()
          : undefined;
      return {id, name: name || id, mobile};
    })
    .filter((x): x is ScrapAssignUser => x != null);
}

/** Team users for assign-to dropdown. Caller should prepend My Self (id `0`). */
export async function fetchScrapAssignUsers(): Promise<ScrapAssignUser[]> {
  const {data} = await axios.post<KnparisesEnvelope<unknown>>(
    `${apiBase()}/scrap-vendors/getUsers`,
    {},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return normalizeScrapAssignUsers(unwrapKnparises(data));
}

export async function createScrapRequest(
  input: CreateScrapRequestInput,
): Promise<unknown> {
  const categoryIds = input.scrap_category_ids
    .map(id => String(id).trim())
    .filter(Boolean);
  const scrapVendorId =
    input.scrap_vendor_id != null ? String(input.scrap_vendor_id).trim() : '';
  const vendorId =
    input.vendor_id != null ? String(input.vendor_id).trim() : '';

  // Oil-outlet create: body is only scrap_vendor_id + scrap_category_ids.
  const isOutletCreate = scrapVendorId !== '' && vendorId === '';
  const body: Record<string, unknown> = isOutletCreate
    ? {
        scrap_vendor_id: scrapVendorId,
        scrap_category_ids: categoryIds,
      }
    : {
        scrap_category_ids: categoryIds,
        ...(vendorId ? {vendor_id: vendorId} : {}),
        ...(scrapVendorId ? {scrap_vendor_id: scrapVendorId} : {}),
        ...(input.assign_to_user_id != null &&
        String(input.assign_to_user_id) !== ''
          ? {assign_to_user_id: String(input.assign_to_user_id)}
          : {}),
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
    ...(input.assign_to_user_id != null && String(input.assign_to_user_id) !== ''
      ? {assign_to_user_id: String(input.assign_to_user_id)}
      : {}),
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

/** Reassign scrap request — POST /scrap-requests/assign */
export async function assignScrapRequest(
  input: AssignScrapRequestInput,
): Promise<unknown> {
  const body = {
    scrap_collection_id: String(input.scrap_collection_id),
    assign_to_user_id: String(input.assign_to_user_id),
  };
  const url = `${apiBase()}/scrap-requests/assign`;
  console.log('[ScrapAssign] Request URL:', url);
  console.log('[ScrapAssign] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[ScrapAssign] Response:', data);
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
