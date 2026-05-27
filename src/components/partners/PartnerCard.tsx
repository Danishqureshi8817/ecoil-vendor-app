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

type Props = {
  row: PublicSupplierDirectoryRow;
};

export function PartnerCard({row}: Props) {
  const tel = row.mobile.replace(/\D/g, '');

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
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.contact}>
          <CustomText variant="h7" style={styles.contactLabel}>
            CONTACT
          </CustomText>
          <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
            {formatMobile(row.mobile)}
          </CustomText>
        </View>
        <Pressable
          style={({pressed}) => [pressed && styles.callPressed]}
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
  divider: {
    height: 1,
    marginHorizontal: moderateScale(16),
    backgroundColor: Colors.line,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(14),
    gap: moderateScale(12),
  },
  contact: {flex: 1, minWidth: 0},
  contactLabel: {
    color: Colors.muted,
    fontSize: moderateScale(10),
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(14),
  },
  callText: {color: Colors.white},
  callPressed: {opacity: 0.9, transform: [{scale: 0.97}]},
});
