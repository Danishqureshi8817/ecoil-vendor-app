import CustomText from '@/components/global/CustomText';
import {Fonts} from '@/constants/fonts';
import type {CollectionRequestRow} from '@/api/collectionApi';
import {
  collectionRequestLabel,
  collectionRequestStatus,
} from '@/api/collectionApi';
import {externalUi} from '@/styles/externalUi';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

function formatDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const s = String(value);
  if (/^\d{2}-[A-Za-z]{3}-\d{4}/.test(s)) {
    return s;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return s;
}

type MetaItem = {label: string; value: string};

/** Same fields/labels as web `CollectRequestListPage` card. */
function buildMeta(row: CollectionRequestRow): MetaItem[] {
  const pickupDate = row.request_date ?? row.created_at ?? row.date ?? '';
  const filledToPickup =
    row.actual_drums_qty_temp ?? row.actual_drums_qty ?? row.entered_drums_qty;
  const oilWeightKg =
    row.actual_volume_temp ??
    row.actual_volume ??
    row.entered_volume ??
    row.oil_quantity;
  const emptyDrumsToDrop = row.empty_drums_qty ?? row.empty_drums ?? null;
  const status = row.request_status_name ?? collectionRequestStatus(row);

  const items: MetaItem[] = [];

  if (pickupDate !== '') {
    items.push({label: 'Pickup request date', value: formatDate(pickupDate)});
  }

  if (filledToPickup != null) {
    items.push({
      label:
        emptyDrumsToDrop != null ? 'Filled Drums To Pickup' : 'Filled Bottle To Pickup',
      value: String(filledToPickup),
    });
  }

  if (oilWeightKg != null && oilWeightKg !== '') {
    items.push({label: 'Oil Weight (Kg)', value: String(oilWeightKg)});
  }

  if (emptyDrumsToDrop != null && emptyDrumsToDrop !== '') {
    items.push({label: 'Empty Drums To Drop', value: String(emptyDrumsToDrop)});
  }

  if (status != null && String(status).trim() !== '') {
    items.push({label: 'Status', value: String(status)});
  }

  return items;
}

function cardTitle(row: CollectionRequestRow): string {
  const requestType = row.request_type_name ?? row.request_type ?? '';
  if (requestType != null && String(requestType).trim() !== '') {
    return String(requestType);
  }
  return collectionRequestLabel(row);
}

type Props = {
  row: CollectionRequestRow;
  onPress?: () => void;
};

export function CollectionRequestCard({row, onPress}: Props) {
  const meta = buildMeta(row);
  const title = cardTitle(row);
  const statusBadge = collectionRequestStatus(row);

  return (
    <Pressable
      style={({pressed}) => [
        externalUi.listCard,
        onPress && styles.clickable,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={externalUi.listCardHead}>
        <CustomText
          variant="h6"
          fontFamily={Fonts.inter.bold}
          style={externalUi.listCardTitle}
          numberOfLine={2}>
          {title}
        </CustomText>
        <View style={externalUi.badge}>
          <CustomText variant="h7" style={externalUi.badgeText}>
            {statusBadge}
          </CustomText>
        </View>
      </View>

      {meta.map(item => (
        <View key={item.label} style={externalUi.metaRow}>
          <CustomText variant="h7" style={externalUi.metaDt}>
            {item.label}
          </CustomText>
          <CustomText variant="h7" style={externalUi.metaDd}>
            {item.value}
          </CustomText>
        </View>
      ))}

      {onPress ? (
        <CustomText variant="h7" style={styles.footerLink}>
          View details →
        </CustomText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clickable: {},
  pressed: {opacity: 0.92, transform: [{scale: 0.99}]},
  footerLink: {
    marginTop: moderateScaleVertical(10),
    paddingTop: moderateScaleVertical(10),
    borderTopWidth: 1,
    borderTopColor: '#e8ecf0',
    color: '#065f46',
    fontFamily: Fonts.inter.bold,
    fontSize: 13,
  },
});
