import type {CollectionRequestRow} from '@/api/collectionApi';
import {collectionRequestStatus} from '@/api/collectionApi';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning!';
  }
  if (hour < 17) {
    return 'Good afternoon!';
  }
  return 'Good evening!';
}

function parseVolume(row: CollectionRequestRow): number {
  const raw =
    row.actual_volume ??
    row.actual_volume_temp ??
    row.entered_volume ??
    row.oil_quantity;
  const n = parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function rowDate(row: CollectionRequestRow): Date | null {
  const raw = row.request_date ?? row.created_at ?? row.date ?? row.submitted_at;
  if (raw == null || raw === '') {
    return null;
  }
  const d = new Date(String(raw));
  return Number.isNaN(d.getTime()) ? null : d;
}

function isThisMonth(d: Date): boolean {
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isOpenRequest(row: CollectionRequestRow): boolean {
  const status = collectionRequestStatus(row).toLowerCase();
  if (!status || status === '—') {
    return true;
  }
  return (
    !status.includes('complete') &&
    !status.includes('cancel') &&
    !status.includes('closed') &&
    !status.includes('reject')
  );
}

export function formatKg(value: number): string {
  return `${value.toFixed(2)} kg`;
}

export function formatPoints(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(2);
}

export type HomeDashboardMetrics = {
  totalOilKg: number;
  monthOilKg: number;
  openRequestCount: number;
  nextPickupLabel: string;
};

export function computeHomeMetrics(
  collections: CollectionRequestRow[] | undefined,
): HomeDashboardMetrics {
  const rows = collections ?? [];
  let totalOilKg = 0;
  let monthOilKg = 0;
  let openRequestCount = 0;
  let nextPickup: Date | null = null;

  for (const row of rows) {
    const vol = parseVolume(row);
    totalOilKg += vol;

    const d = rowDate(row);
    if (d && isThisMonth(d)) {
      monthOilKg += vol;
    }

    if (isOpenRequest(row)) {
      openRequestCount += 1;
    }

    const scheduled = row.max_completion_datetime;
    if (scheduled) {
      const sd = new Date(String(scheduled));
      if (!Number.isNaN(sd.getTime()) && sd.getTime() >= Date.now()) {
        if (!nextPickup || sd.getTime() < nextPickup.getTime()) {
          nextPickup = sd;
        }
      }
    }
  }

  let nextPickupLabel = '-----';
  if (nextPickup) {
    nextPickupLabel = nextPickup.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return {totalOilKg, monthOilKg, openRequestCount, nextPickupLabel};
}

export function sortRecentCollections(
  collections: CollectionRequestRow[] | undefined,
  limit = 5,
): CollectionRequestRow[] {
  const rows = [...(collections ?? [])];
  rows.sort((a, b) => {
    const da = rowDate(a)?.getTime() ?? 0;
    const db = rowDate(b)?.getTime() ?? 0;
    return db - da;
  });
  return rows.slice(0, limit);
}

export function formatActivityTimestamp(row: CollectionRequestRow): string {
  const d = rowDate(row);
  if (!d) {
    return '—';
  }
  const date = d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${date} • ${time}`;
}
