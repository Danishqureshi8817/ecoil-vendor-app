import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import type {KnparisesEnvelope} from '@/types/vendor';
import {getStoredToken} from '@/utils/sessionStorage';
import {unwrapKnparises} from '@/utils/knparises';

export type ScrapCategoryWeightStats = {
  PickedToday?: string | number;
  PickedThisMonth?: string | number;
};

export type VendorDashboardCounters = {
  ThisMonthRequests?: string;
  TodayRequests?: string;
  OpenRequests?: string;
  NextPickUpDate?: string;
  TotalPickedQty?: string;
  TodayPickedQty?: string;
  MonthPickedQty?: string;
  YearPickedQty?: string;
  ActiveCounters?: string;
  TotalCounters?: string;
  InActiveCounters?: string;
  FieldStock?: string;
  WarehouseStock?: string;
  CarbonCreditMonth?: string;
  CarbonCreditYear?: string;
  CarbonCreditTotalPicked?: string;
  FollowupCounts?: number | string;
  /** Scrap vendor (type 99) counters */
  TotalPickedWeight?: string | number;
  TotalPickedScrap?: string | number;
  TotalPickedWaste?: string | number;
  CompletedRequests?: string | number;
  PendingRequests?: string | number;
  WeightPickedToday?: string | number;
  WeightPickedThisMonth?: string | number;
  WeightByCategories?: Record<string, ScrapCategoryWeightStats>;
};

export type VendorDashboardNotification = {
  type?: string;
  title?: string;
  notification?: string;
  added_date?: string;
};

export type VendorDashboardData = {
  counters?: VendorDashboardCounters;
  notifications?: VendorDashboardNotification[];
  snoozeHours?: number;
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

export async function fetchVendorDashboard(payload: {
  user_id: string | number;
  user_type: string | number;
  vendor_id: string | number;
}): Promise<VendorDashboardData> {
  const {data} = await axios.post<KnparisesEnvelope<VendorDashboardData>>(
    `${base()}/dashboard`,
    {
      user_id: String(payload.user_id),
      user_type: String(payload.user_type),
      vendor_id: String(payload.vendor_id),
    },
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return unwrapKnparises(data);
}
