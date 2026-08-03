import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {CertificateRow} from '@/api/certificatesApi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type DownloadKey = 'co2_monthly_pdf_url' | 'co2_tilldate_pdf_url' | 'ruco_pdf_url';

export const CERT_TABLE_COLUMNS: {key: DownloadKey; label: string}[] = [
  {key: 'co2_monthly_pdf_url', label: 'CO2 Certificate Month'},
  {key: 'co2_tilldate_pdf_url', label: 'CO2 Certificate Till Date'},
  {key: 'ruco_pdf_url', label: 'RUCO Certificate'},
];

async function openPdf(url: string) {
  if (!url) {
    return;
  }
  await Linking.openURL(url);
}

function CertActionButtons({url}: {url: string}) {
  const enabled = Boolean(url);

  return (
    <View style={styles.actions}>
      <Pressable
        style={({pressed}) => [
          styles.downloadBtn,
          !enabled && styles.btnDisabled,
          pressed && enabled && styles.btnPressed,
        ]}
        disabled={!enabled}
        onPress={() => void openPdf(url)}
        accessibilityLabel="Download certificate">
        <Ionicons name="download-outline" size={moderateScale(16)} color={Colors.white} />
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.semiBold}
          style={styles.downloadText}>
          Download
        </CustomText>
      </Pressable>
      <Pressable
        style={({pressed}) => [
          styles.viewBtn,
          !enabled && styles.viewBtnDisabled,
          pressed && enabled && styles.btnPressed,
        ]}
        disabled={!enabled}
        onPress={() => void openPdf(url)}
        accessibilityLabel="View certificate">
        <Ionicons name="eye-outline" size={moderateScale(16)} color={Colors.brand} />
        <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.viewText}>
          View
        </CustomText>
      </Pressable>
    </View>
  );
}

export function CertificateRowCard({row}: {row: CertificateRow}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="calendar-outline" size={moderateScale(18)} color={Colors.brand} />
        <CustomText
          variant="h5"
          fontFamily={Fonts.montserrat.bold}
          style={styles.monthText}>
          {row.month_year}
        </CustomText>
      </View>

      {CERT_TABLE_COLUMNS.map((col, index) => (
        <View
          key={col.key}
          style={[
            styles.certSection,
            index < CERT_TABLE_COLUMNS.length - 1 && styles.sectionDivider,
          ]}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={styles.certLabel}
            numberOfLine={2}>
            {col.label}
          </CustomText>
          <CertActionButtons url={row[col.key]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: moderateScaleVertical(12),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    backgroundColor: Colors.bg,
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  monthText: {
    color: Colors.black,
    fontSize: RFValue(15),
  },
  certSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(10),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  certLabel: {
    flex: 1,
    color: Colors.black,
    fontSize: RFValue(12),
    lineHeight: RFValue(17),
  },
  actions: {
    flexDirection: 'row',
    gap: moderateScale(8),
    alignItems: 'center',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(999),
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(12),
  },
  downloadText: {
    color: Colors.white,
    fontSize: RFValue(11),
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.drawerIconBgColor,
    borderRadius: moderateScale(999),
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(12),
  },
  viewBtnDisabled: {
    backgroundColor: Colors.line,
    opacity: 0.55,
  },
  viewText: {
    color: Colors.brand,
    fontSize: RFValue(11),
  },
  btnDisabled: {
    backgroundColor: Colors.muted,
    opacity: 0.45,
  },
  btnPressed: {
    opacity: 0.88,
  },
});
