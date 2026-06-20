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

export const MONTH_COL_WIDTH = moderateScale(118);
export const CERT_COL_WIDTH = moderateScale(148);
export const TABLE_MIN_WIDTH =
  MONTH_COL_WIDTH + CERT_COL_WIDTH * CERT_TABLE_COLUMNS.length;

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

export function CertificateTableHeader() {
  return (
    <View style={styles.headerRow}>
      <View style={[styles.monthCol, styles.headerCell]}>
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.semiBold}
          style={styles.headerText}
          numberOfLine={2}>
          Month-Year
        </CustomText>
      </View>
      {CERT_TABLE_COLUMNS.map((col, index) => (
        <View
          key={col.key}
          style={[
            styles.certCol,
            styles.headerCell,
            index < CERT_TABLE_COLUMNS.length - 1 && styles.colDivider,
          ]}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={styles.headerText}
            numberOfLine={2}>
            {col.label}
          </CustomText>
        </View>
      ))}
    </View>
  );
}

export function CertificateRowCard({row}: {row: CertificateRow}) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.monthCol}>
        <CustomText
          variant="h6"
          fontFamily={Fonts.montserrat.bold}
          style={styles.monthText}
          numberOfLine={2}>
          {row.month_year}
        </CustomText>
      </View>
      {CERT_TABLE_COLUMNS.map((col, index) => (
        <View
          key={col.key}
          style={[styles.certCol, index < CERT_TABLE_COLUMNS.length - 1 && styles.colDivider]}>
          <CertActionButtons url={row[col.key]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: Colors.bg,
    minWidth: TABLE_MIN_WIDTH,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    minWidth: TABLE_MIN_WIDTH,
  },
  headerCell: {
    justifyContent: 'center',
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(10),
  },
  monthCol: {
    width: MONTH_COL_WIDTH,
    justifyContent: 'center',
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(10),
  },
  certCol: {
    width: CERT_COL_WIDTH,
    justifyContent: 'center',
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(8),
  },
  colDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.line,
  },
  headerText: {
    color: Colors.black,
    fontSize: RFValue(11),
    lineHeight: RFValue(15),
  },
  monthText: {
    color: Colors.black,
    fontSize: RFValue(13),
    lineHeight: RFValue(18),
  },
  actions: {
    gap: moderateScaleVertical(8),
    alignItems: 'stretch',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(999),
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(10),
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
    paddingHorizontal: moderateScale(10),
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
