import CustomText from '@/components/global/CustomText';
import type {PublicSupplierDirectoryRow} from '@/api/publicApi';
import {serviceAvatarColor} from '@/api/publicApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {supplierAvatarInitials} from '@/utils/vendorUser';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  const ten =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 10
        ? digits
        : '';
  if (ten.length === 10) {
    return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
  }
  return mobile.trim() || '—';
}

function toExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

type Props = {
  row: PublicSupplierDirectoryRow;
};

export function PartnerCard({row}: Props) {
  const tel = row.mobile.replace(/\D/g, '');
  const websiteHref = row.websiteUrl ? toExternalUrl(row.websiteUrl) : '';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View
          style={[
            styles.thumb,
            {backgroundColor: serviceAvatarColor(row.name)},
          ]}>
          <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.thumbText}>
            {supplierAvatarInitials(row.name)}
          </CustomText>
        </View>
        <View style={styles.info}>
          <CustomText variant="h6" fontFamily={Fonts.inter.bold} numberOfLine={2}>
            {row.name}
          </CustomText>
          <CustomText variant="h7" style={styles.role}>
            Certified partner
          </CustomText>
          <View style={styles.chips}>
            {row.verified ? (
              <View style={[styles.chip, styles.chipVerified]}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.brandDark} />
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipVerifiedText}>
                  Ecoil verified
                </CustomText>
              </View>
            ) : null}
            {row.city ? (
              <View style={[styles.chip, styles.chipCity]}>
                <Ionicons name="location-outline" size={12} color={Colors.accent} />
                <CustomText variant="h7" style={styles.chipCityText}>
                  {row.city}
                </CustomText>
              </View>
            ) : null}
          </View>
          <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={styles.mobile}>
            {formatMobile(row.mobile)}
          </CustomText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={[styles.actions, websiteHref ? styles.actionsRow : styles.actionsColumn]}>
          {websiteHref ? (
            <Pressable
              style={({pressed}) => [
                styles.actionItem,
                styles.websiteBtn,
                pressed && styles.actionPressed,
              ]}
              onPress={() => {
                void Linking.openURL(websiteHref);
              }}>
              <Ionicons name="globe-outline" size={16} color={Colors.brandDark} />
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.websiteText}>
                Website
              </CustomText>
            </Pressable>
          ) : null}
          <Pressable
            style={({pressed}) => [styles.actionItem, pressed && styles.actionPressed]}
            onPress={() => {
              if (tel) {
                void Linking.openURL(`tel:${tel}`);
              }
            }}>
            <LinearGradient
              colors={[Colors.brandDark, Colors.brand]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.callBtn}>
              <Ionicons name="call" size={16} color={Colors.white} />
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.callText}>
                Call
              </CustomText>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: Colors.line,
    ...theme.shadow,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    gap: moderateScale(14),
    padding: moderateScale(16),
  },
  thumb: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {color: Colors.white},
  info: {flex: 1, minWidth: 0},
  role: {color: Colors.muted, marginTop: 2, marginBottom: moderateScaleVertical(8)},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(6)},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: 999,
  },
  chipVerified: {
    backgroundColor: Colors.brandSoft,
    borderWidth: 1,
    borderColor: 'rgba(4,120,87,0.2)',
  },
  chipVerifiedText: {color: Colors.brandDark, fontSize: moderateScale(11)},
  chipCity: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  chipCityText: {color: Colors.muted, fontSize: moderateScale(11)},
  mobile: {
    marginTop: moderateScaleVertical(10),
    color: Colors.black,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    marginHorizontal: moderateScale(16),
    backgroundColor: Colors.line,
  },
  footer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(14),
  },
  actions: {
    alignItems: 'stretch',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  actionsColumn: {
    flexDirection: 'column',
    gap: moderateScaleVertical(8),
  },
  actionItem: {
    flex: 1,
    minWidth: 0,
  },
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(4,120,87,0.35)',
  },
  websiteText: {color: Colors.brandDark},
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(14),
  },
  callText: {color: Colors.white},
  actionPressed: {opacity: 0.9, transform: [{scale: 0.97}]},
});
