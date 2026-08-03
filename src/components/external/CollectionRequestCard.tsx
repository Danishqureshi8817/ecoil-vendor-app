import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {CollectionRequestRow} from '@/api/collectionApi';
import {
  collectionRequestId,
  collectionRequestLabel,
  collectionRequestStatus,
} from '@/api/collectionApi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

function formatCardDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const s = String(value);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString(undefined, {month: 'short'});
    const year = d.getFullYear();
    return `${day} - ${month} ${year}`;
  }
  return s;
}

function cardTitle(row: CollectionRequestRow): string {
  const requestType = row.request_type_name ?? row.request_type ?? '';
  if (requestType != null && String(requestType).trim() !== '') {
    const name = String(requestType).trim();
    return /request$/i.test(name) ? name : `${name} request`;
  }
  return collectionRequestLabel(row);
}

function displayRequestId(row: CollectionRequestRow): string {
  const id =
    row.request_id ??
    row.collection_request_id ??
    row.coll_req_id ??
    row.id ??
    collectionRequestId(row);
  return id != null ? String(id) : '—';
}

function isCompletedStatus(status: string): boolean {
  return /complete|done|closed|success/i.test(status);
}

type Props = {
  row: CollectionRequestRow;
  onPress?: () => void;
};

export function CollectionRequestCard({row, onPress}: Props) {
  const pickupDate = row.request_date ?? row.created_at ?? row.date ?? '';
  const filledDrums =
    row.actual_drums_qty_temp ?? row.actual_drums_qty ?? row.entered_drums_qty;
  const oilWeightKg =
    row.actual_volume_temp ??
    row.actual_volume ??
    row.entered_volume ??
    row.oil_quantity;
  const emptyDrums = row.empty_drums_qty ?? row.empty_drums;
  const status = collectionRequestStatus(row);
  const completed = isCompletedStatus(status);

  const metaRows = [
    {
      label: 'Oil weight (Kg)',
      value:
        oilWeightKg != null && oilWeightKg !== ''
          ? Number(oilWeightKg).toFixed(2)
          : '—',
    },
    {
      label: 'Filled Drums',
      value: filledDrums != null ? String(filledDrums) : '—',
    },
    {
      label: 'Empty Drums to Drop',
      value: emptyDrums != null ? String(emptyDrums) : '—',
    },
    {
      label: 'Request ID',
      value: displayRequestId(row),
    },
  ];

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.topRow}>
        <View style={styles.dateBadge}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.dateText}>
            {formatCardDate(pickupDate)}
          </CustomText>
        </View>
        <View style={[styles.statusBadge, completed && styles.statusBadgeDone]}>
          {completed ? (
            <Ionicons name="checkmark-circle" size={moderateScale(14)} color={Colors.brand} />
          ) : null}
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={completed ? [styles.statusText, styles.statusTextDone] : styles.statusText}>
            {status}
          </CustomText>
        </View>
      </View>

      <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.title}>
        {cardTitle(row)}
      </CustomText>

      <View style={styles.divider} />

      {metaRows.map(item => (
        <View key={item.label} style={styles.metaRow}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.metaLabel}>
            {item.label}
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.metaValue}>
            {item.value}
          </CustomText>
        </View>
      ))}

      {onPress ? (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>
            <Ionicons name="eye" size={moderateScale(18)} color={Colors.drawerGradientEnd} />
            <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.footerText}>
              View details
            </CustomText>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {opacity: 0.92, transform: [{scale: 0.99}]},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(12),
  },
  dateBadge: {
    backgroundColor: Colors.bg,
    borderRadius: moderateScale(8),
    paddingVertical: moderateScaleVertical(6),
    paddingHorizontal: moderateScale(10),
  },
  dateText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingVertical: moderateScaleVertical(5),
    paddingHorizontal: moderateScale(10),
    borderRadius: 999,
    backgroundColor: Colors.bg,
  },
  statusBadgeDone: {
    backgroundColor: Colors.brandSoft,
  },
  statusText: {
    color: Colors.muted,
    fontSize: RFValue(10),
  },
  statusTextDone: {
    color: Colors.brand,
  },
  title: {
    color: Colors.black,
    fontSize: RFValue(14),
    marginBottom: moderateScaleVertical(12),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginBottom: moderateScaleVertical(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  metaLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
    flex: 1,
  },
  metaValue: {
    color: Colors.black,
    fontSize: RFValue(11),
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingTop: moderateScaleVertical(4),
  },
  footerText: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(12),
  },
});
