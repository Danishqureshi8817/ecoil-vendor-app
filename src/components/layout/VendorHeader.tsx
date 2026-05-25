import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Same as vendor dashboard `.ext-hero-header`:
 * linear-gradient(135deg, brand-dark 0%, brand 55%, accent 100%)
 */
export const HEADER_GRADIENT = {
  colors: [Colors.brandDark, Colors.brand, Colors.accent] as const,
  locations: [0, 0.55, 1] as const,
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
  angle: 135,
};

type Props = {
  title: string;
  firmName?: string;
  initials: string;
  onMenuPress: () => void;
};

export function VendorHeader({title, firmName, initials, onMenuPress}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <LinearGradient
        colors={[...HEADER_GRADIENT.colors]}
        locations={[...HEADER_GRADIENT.locations]}
        start={HEADER_GRADIENT.start}
        end={HEADER_GRADIENT.end}
        useAngle
        angle={HEADER_GRADIENT.angle}
        style={[styles.gradient, {paddingTop: insets.top + moderateScaleVertical(8)}]}>
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.menuBtn}
          accessibilityLabel="Open menu"
          activeOpacity={0.85}>
          <Ionicons name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <CustomText variant="h7" style={styles.eyebrow}>
            ECOIL PARTNER
          </CustomText>
          <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.title} numberOfLine={1}>
            {title}
          </CustomText>
          {firmName ? (
            <CustomText variant="h7" style={styles.firm} numberOfLine={1}>
              {firmName}
            </CustomText>
          ) : null}
        </View>

        <View style={styles.avatar}>
          <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={styles.avatarText}>
            {initials}
          </CustomText>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(22),
    shadowColor: Colors.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
  },
  menuBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginHorizontal: moderateScale(12),
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    color: Colors.white,
    letterSpacing: -0.3,
  },
  firm: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  avatar: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarText: {
    color: Colors.white,
  },
});
