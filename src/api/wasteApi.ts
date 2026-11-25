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
  request_status?: string | number;
  request_status_name?: string;
  /** 1 = created by logged-in waste vendor; can edit/delete */
  entry_by_sv?: string | number;
  /** Assigned team user id; `0` / missing = My Self */
  assign_to_user_id?: string | number;
  /** Assigned team user display name from list API */
  assigned_to_name?: string;
  assign_to_user_name?: string;
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

/** UI + API sentinel: assign request to the logged-in scrap vendor. */
export const WASTE_ASSIGN_MYSELF_ID = '0';

export type WasteAssignUser = {
  id: string;
  name: string;
  mobile?: string;
};

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
export function wasteAssignToUserName(row?: WasteRequestRow | null): string {
  if (!row) {
    return '';
  }
  // List API primary key is `assigned_to_name`.
  return firstNonEmptyId(
    row.assigned_to_name,
    row.assign_to_user_name as string | number | undefined,
    row.assigned_to_user_name as string | number | undefined,
    row.assigned_user_name as string | number | undefined,
    row.assign_to_name as string | number | undefined,
  );
}

/** Raw assign id from row (no My Self default). Empty = not assigned. */
export function wasteRawAssignToUserId(row?: WasteRequestRow | null): string {
  if (!row) {
    return '';
  }
  return firstNonEmptyId(
    row.assigned_to as string | number | undefined,
    row.assign_to_user_id,
    row.assigned_to_user_id as string | number | undefined,
    row.assigned_user_id as string | number | undefined,
    row.assign_user_id as string | number | undefined,
    row.scrap_vendor_user_id as string | number | undefined,
    row.sv_user_id as string | number | undefined,
    row.assigned_to_id as string | number | undefined,
  );
}

/** API assignment filter: assigned_to > 0 (My Self / 0 = unassigned). */
export function wasteIsAssignedToUser(row?: WasteRequestRow | null): boolean {
  const id = wasteRawAssignToUserId(row);
  if (id) {
    const n = Number(id);
    if (Number.isFinite(n)) {
      return n > 0;
    }
    return id !== WASTE_ASSIGN_MYSELF_ID;
  }
  const name = wasteAssignToUserName(row);
  return name !== '' && name.toLowerCase() !== 'my self';
}

/** Map UI/API status aliases → KNP numeric codes. */
export function mapWasteRequestStatusFilter(status: string): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if (!s) {
    return '';
  }
  if (s === 'pending' || s === '1') {
    return '1';
  }
  if (s === 'inprocess' || s === 'in_process' || s === '2') {
    return '2';
  }
  if (s === 'completed' || s === '3') {
    return '3';
  }
  if (s === 'cancelled' || s === 'canceled' || s === '5') {
    return '5';
  }
  return String(status).trim();
}

function wasteMatchesAssignmentFilter(
  row: WasteRequestRow,
  assignment: string,
): boolean {
  if (!assignment || assignment === 'all') {
    return true;
  }
  const assigned = wasteIsAssignedToUser(row);
  if (assignment === 'assigned') {
    return assigned;
  }
  if (assignment === 'unassigned') {
    return !assigned;
  }
  return true;
}

function wasteMatchesStatusFilter(
  row: WasteRequestRow,
  status: string,
): boolean {
  if (!status) {
    return true;
  }
  const mapped = mapWasteRequestStatusFilter(status);
  const code = String(row.request_status ?? row.status ?? '').trim();
  const name = String(row.request_status_name ?? '')
    .trim()
    .toLowerCase();
  if (mapped === '1') {
    return code === '1' || name === 'pending' || name.includes('pending');
  }
  if (mapped === '2') {
    return code === '2' || name.includes('process');
  }
  if (mapped === '3') {
    return code === '3' || name.includes('complete');
  }
  if (mapped === '5') {
    return code === '5' || name.includes('cancel');
  }
  return code === mapped || name === status.toLowerCase();
}

function applyWasteListFilters(
  rows: WasteRequestRow[],
  filters: {assignment?: string; request_status?: string},
): WasteRequestRow[] {
  const assignment = String(filters.assignment ?? '').trim();
  const status = String(filters.request_status ?? '').trim();
  if ((!assignment || assignment === 'all') && !status) {
    return rows;
  }
  return rows.filter(
    row =>
      wasteMatchesAssignmentFilter(row, assignment) &&
      wasteMatchesStatusFilter(row, status),
  );
}

/** True when request already has an assignee (including My Self = `0`). */
export function wasteHasAssignee(row?: WasteRequestRow | null): boolean {
  if (!row) {
    return false;
  }
  if (wasteRawAssignToUserId(row) !== '') {
    return true;
  }
  return wasteAssignToUserName(row) !== '';
}

/** Card label: My Self / user name / — when unassigned. */
export function wasteAssigneeDisplayLabel(row?: WasteRequestRow | null): string {
  if (!row) {
    return '—';
  }
  const name = wasteAssignToUserName(row);
  const id = wasteRawAssignToUserId(row);
  if (id === WASTE_ASSIGN_MYSELF_ID) {
    return name || 'My Self';
  }
  if (name) {
    return name;
  }
  if (!wasteHasAssignee(row)) {
    return '—';
  }
  return id || '—';
}

/**
 * Resolve assigned user id from list/detail row for edit prefill.
 * Upstream may use several key names; missing / empty → My Self (`0`).
 */
export function wasteAssignToUserId(
  row?: WasteRequestRow | null,
  users: WasteAssignUser[] = [],
): string {
  if (!row) {
    return WASTE_ASSIGN_MYSELF_ID;
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

  const name = wasteAssignToUserName(row);
  if (name && users.length > 0) {
    const match = users.find(
      user => user.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (match) {
      return match.id;
    }
  }

  return WASTE_ASSIGN_MYSELF_ID;
}

export type CreateWasteRequestInput = {
  waste_category_ids: Array<string | number>;
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

export type UpdateWasteRequestInput = CreateWasteRequestInput & {
  waste_collection_id: string | number;
};

export type AssignWasteRequestInput = {
  waste_collection_id: string | number;
  assign_to_user_id: string | number;
};

export type DeleteWasteRequestInput = {
  waste_collection_id: string | number;
  vendor_id: string | number;
  vendorUserId?: string | number;
};

export type CancelWasteRequestInput = {
  waste_collection_id: string | number;
  cancel_remark: string;
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
  latitude?: number | string | null;
  longitude?: number | string | null;
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

export function wasteRequestStatusName(
  row: WasteRequestRow,
  options?: {maskCancelAsPending?: boolean},
): string {
  const status = String(row.request_status ?? row.status ?? '').trim();
  const name = String(row.request_status_name ?? '').trim();
  const cancelled =
    status === '5' || name.toLowerCase().includes('cancel');
  // Outlet must not see vendor cancellation — keep showing Pending.
  if (options?.maskCancelAsPending && cancelled) {
    return 'Pending';
  }
  if (name) {
    return name;
  }
  return status || '—';
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

/** True when request was raised by the logged-in scrap vendor (editable for SV). */
export function isWasteRequestOwnedByUser(row: WasteRequestRow): boolean {
  const flag = row.entry_by_sv;
  return flag === 1 || flag === '1' || String(flag ?? '').trim() === '1';
}

/** True when request was raised by the oil outlet (editable for outlet user). */
export function isWasteRequestOwnedByOutlet(row: WasteRequestRow): boolean {
  return !isWasteRequestOwnedByUser(row);
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
  const scrapVendorId =
    input.scrap_vendor_id != null ? String(input.scrap_vendor_id).trim() : '';
  const vendorId =
    input.vendor_id != null ? String(input.vendor_id).trim() : '';

  // Oil-outlet create: body is only scrap_vendor_id + waste_category_ids.
  const isOutletCreate = scrapVendorId !== '' && vendorId === '';
  const body: Record<string, unknown> = isOutletCreate
    ? {
        scrap_vendor_id: scrapVendorId,
        waste_category_ids: categoryIds,
      }
    : {
        waste_category_ids: categoryIds,
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
  const scrapVendorId =
    input.scrap_vendor_id != null ? String(input.scrap_vendor_id).trim() : '';
  const vendorId =
    input.vendor_id != null ? String(input.vendor_id).trim() : '';

  // Oil-outlet edit: waste_collection_id + scrap_vendor_id + categories.
  const isOutletUpdate = scrapVendorId !== '' && vendorId === '';
  const body: Record<string, unknown> = isOutletUpdate
    ? {
        waste_collection_id: String(input.waste_collection_id),
        scrap_vendor_id: scrapVendorId,
        waste_category_ids: categoryIds,
      }
    : {
        waste_collection_id: String(input.waste_collection_id),
        waste_category_ids: categoryIds,
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

/** Reassign waste request — POST /waste-requests/assign */
export async function assignWasteRequest(
  input: AssignWasteRequestInput,
): Promise<unknown> {
  const body = {
    waste_collection_id: String(input.waste_collection_id),
    assign_to_user_id: String(input.assign_to_user_id),
  };
  const url = `${apiBase()}/waste-requests/assign`;
  console.log('[WasteAssign] Request URL:', url);
  console.log('[WasteAssign] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[WasteAssign] Response:', data);
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

/** Cancel waste request — POST /waste-requests/cancel */
export async function cancelWasteRequest(
  input: CancelWasteRequestInput,
): Promise<unknown> {
  const body = {
    waste_collection_id: String(input.waste_collection_id),
    cancel_remark: String(input.cancel_remark).trim(),
  };
  const url = `${apiBase()}/waste-requests/cancel`;
  console.log('[WasteCancel] Request URL:', url);
  console.log('[WasteCancel] Request body:', body);

  const {data} = await axios.post<KnparisesEnvelope<unknown>>(url, body, {
    headers: {...bearerHeaders(), 'Content-Type': 'application/json'},
    timeout: 60_000,
  });
  console.log('[WasteCancel] Response:', data);
  return unwrapKnparises(data);
}

export function isWasteRequestCancelled(row: WasteRequestRow): boolean {
  const status = String(row.request_status ?? '').trim();
  const name = wasteRequestStatusName(row).toLowerCase();
  return status === '5' || name.includes('cancel');
}

/** True when request is completed (status 3 / Completed). */
export function isWasteRequestCompleted(row: WasteRequestRow): boolean {
  const status = String(row.request_status ?? row.status ?? '').trim();
  const name = String(row.request_status_name ?? '').trim().toLowerCase();
  return status === '3' || name.includes('complete');
}

/** List filters for waste myRequests / assigned. */
export type WasteRequestListFilters = {
  /** all | assigned | unassigned */
  assignment?: 'all' | 'assigned' | 'unassigned' | '';
  /** pending | completed | cancelled | '' (all) */
  request_status?: string;
  page?: number;
  limit?: number;
  include_completed?: boolean;
};

/**
 * Waste requests list — POST /waste-requests/myRequests
 * Supports assignment + request_status filters (pagination in data.list).
 */
export async function fetchAssignedWasteRequests(
  vendorUserId: string | number = 0,
  filters: WasteRequestListFilters = {},
): Promise<WasteRequestRow[]> {
  const url = `${apiBase()}/waste-requests/myRequests`;
  const assignment =
    filters.assignment && filters.assignment !== 'all'
      ? filters.assignment
      : '';
  const requestStatusRaw = String(filters.request_status ?? '').trim();
  const requestStatus = mapWasteRequestStatusFilter(requestStatusRaw);
  const hasListFilters = Boolean(assignment || requestStatus);
  // Always include completed when filtering so client-side status filter can
  // see Completed/Canceled rows if KNP ignores request_status.
  const includeCompleted =
    filters.include_completed === true ||
    hasListFilters ||
    requestStatusRaw === ''
      ? 1
      : 0;
  const body: Record<string, string | number> = {
    vendorUserId,
    page: filters.page ?? 1,
    // Higher limit when filtering client-side so matches aren't truncated.
    limit: filters.limit ?? (hasListFilters ? 100 : 50),
    include_completed: includeCompleted,
  };
  if (assignment) {
    body.assignment = assignment;
  }
  if (requestStatus) {
    body.request_status = requestStatus;
  }

  console.log('[wasteRequests] Request URL:', url);
  console.log('[wasteRequests] Request body:', body);

  try {
    const {data} = await axios.post<KnparisesEnvelope<unknown>>(
      url,
      body,
      {headers: bearerHeaders(), timeout: 60_000},
    );

    console.log('[wasteRequests] Response:', data);

    const rows = normalizeWasteList(unwrapKnparises(data));
    // Client-side safety net — KNP sometimes ignores combo filters.
    return applyWasteListFilters(rows, {
      assignment,
      request_status: requestStatusRaw || requestStatus,
    });
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
  if (input.latitude != null && String(input.latitude).trim() !== '') {
    form.append('latitude', String(input.latitude));
  }
  if (input.longitude != null && String(input.longitude).trim() !== '') {
    form.append('longitude', String(input.longitude));
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
    latitude: input.latitude,
    longitude: input.longitude,
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
