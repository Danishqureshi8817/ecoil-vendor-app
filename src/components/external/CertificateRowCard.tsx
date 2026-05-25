import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {CertificateRow} from '@/api/certificatesApi';
import {externalUi} from '@/styles/externalUi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';

type DownloadKey = 'co2_monthly_pdf_url' | 'co2_tilldate_pdf_url' | 'ruco_pdf_url';

const DOWNLOADS: {key: DownloadKey; label: string}[] = [
  {key: 'co2_monthly_pdf_url', label: 'CO2 Certificate For Month'},
  {key: 'co2_tilldate_pdf_url', label: 'CO2 Certificate Till Date'},
  {key: 'ruco_pdf_url', label: 'RUCO Certificate'},
];

async function openPdf(url: string) {
  if (!url) {
    return;
  }
  await Linking.openURL(url);
}

function DownloadRow({label, url}: {label: string; url: string}) {
  const enabled = Boolean(url);
  return (
    <View style={styles.certRow}>
      <CustomText
        variant="h7"
        fontFamily={Fonts.inter.medium}
        style={styles.certLabel}
        numberOfLine={2}>
        {label}
      </CustomText>
      <Pressable
        style={({pressed}) => [
          styles.dlBtn,
          !enabled && styles.dlBtnDisabled,
          pressed && enabled && styles.dlBtnPressed,
        ]}
        disabled={!enabled}
        onPress={() => void openPdf(url)}
        accessibilityLabel={`Download ${label}`}>
        <Ionicons
          name="download-outline"
          size={22}
          color={enabled ? Colors.brand : Colors.muted}
        />
      </Pressable>
    </View>
  );
}

export function CertificateRowCard({row}: {row: CertificateRow}) {
  return (
    <View style={externalUi.listCard}>
      <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.month}>
        {row.month_year}
      </CustomText>
      <View style={styles.rows}>
        {DOWNLOADS.map(d => (
          <DownloadRow key={d.key} label={d.label} url={row[d.key]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  month: {
    color: Colors.black,
    marginBottom: moderateScaleVertical(12),
    letterSpacing: -0.2,
    paddingBottom: moderateScaleVertical(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  rows: {
    gap: moderateScaleVertical(10),
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  certLabel: {
    flex: 1,
    color: Colors.black,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  dlBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandSoft,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.2)',
  },
  dlBtnPressed: {
    opacity: 0.88,
  },
  dlBtnDisabled: {
    backgroundColor: Colors.line,
    borderColor: Colors.line,
  },
});
