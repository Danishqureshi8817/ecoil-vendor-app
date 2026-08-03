import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {CounterCollectionRow} from '@/api/reportsApi';
import {
  counterCollectionBranchLabel,
  counterCollectionId,
  counterCollectionRequestType,
} from '@/api/reportsApi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

function formatCardDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const d = new Date(String(value));
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString(undefined, {month: 'short'});
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return String(value);
}

function formatKg(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
}

type Props = {
  row: CounterCollectionRow;
  onPress?: () => void;
};

export function CounterCollectionCard({row, onPress}: Props) {
  const filledDrums =
    row.actual_drums_qty_temp ?? row.actual_drums_qty ?? row.entered_drums_qty;
  const oilWeightKg =
    row.actual_volume_temp ?? row.actual_volume ?? row.entered_volume;
  const emptyDrums = row.empty_drums_qty ?? row.empty_drums;
  const requestId = counterCollectionId(row);

  const metaRows = [
    {label: 'Store code', value: row.store_code != null ? String(row.store_code) : '—'},
    {label: 'Request type', value: counterCollectionRequestType(row)},
    {label: 'Filled drums (pickup)', value: filledDrums != null ? String(filledDrums) : '—'},
    {label: 'Oil weight (kg)', value: formatKg(oilWeightKg)},
    {label: 'Empty drums (drop)', value: emptyDrums != null ? String(emptyDrums) : '—'},
    {label: 'Request ID', value: requestId ?? '—'},
  ];

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.topRow}>
        <View style={styles.dateBadge}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.dateText}>
            {formatCardDate(row.request_date ?? row.created_at ?? row.date)}
          </CustomText>
        </View>
        <View style={styles.typeBadge}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.typeText}>
            {counterCollectionRequestType(row)}
          </CustomText>
        </View>
      </View>

      <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.title} numberOfLine={2}>
        {counterCollectionBranchLabel(row)}
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
  typeBadge: {
    paddingVertical: moderateScaleVertical(5),
    paddingHorizontal: moderateScale(10),
    borderRadius: 999,
    backgroundColor: Colors.brandSoft,
  },
  typeText: {
    color: Colors.brand,
    fontSize: RFValue(10),
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
    flex: 1,
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
