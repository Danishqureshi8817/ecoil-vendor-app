import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Vendor shell header — same green gradient as drawer profile card.
 */
export const HEADER_GRADIENT = {
  colors: [Colors.drawerGradientStart, Colors.drawerGradientEnd] as const,
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
};

type Props = {
  title: string;
  firmName?: string;
  initials: string;
  leading?: 'menu' | 'back';
  onLeadingPress: () => void;
  eyebrowText?: string;
  hideAvatar?: boolean;
  centerTitle?: boolean;
  trailing?: React.ReactNode;
};

export function VendorHeader({
  title,
  firmName,
  initials,
  leading = 'menu',
  onLeadingPress,
  eyebrowText,
  hideAvatar = false,
  centerTitle = false,
  trailing,
}: Props) {
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
        start={HEADER_GRADIENT.start}
        end={HEADER_GRADIENT.end}
        style={[styles.gradient, {paddingTop: insets.top + moderateScaleVertical(8)}]}>
        <TouchableOpacity
          onPress={onLeadingPress}
          style={styles.menuBtn}
          accessibilityLabel={leading === 'back' ? 'Go back' : 'Open menu'}
          activeOpacity={0.85}>
          <Ionicons
            name={leading === 'back' ? 'arrow-back' : 'menu'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        <View style={[styles.headerText, centerTitle && styles.headerTextCentered]}>
          {!centerTitle && eyebrowText ? (
            <CustomText variant="h6" fontFamily={Fonts.montserrat.medium} style={styles.eyebrow}>
              {eyebrowText}
            </CustomText>
          ) : null}
          <CustomText
            variant="h6"
            fontFamily={Fonts.montserrat.semiBold}
            style={[styles.title, centerTitle ? styles.titleCentered : undefined]}
            numberOfLine={1}>
            {title}
          </CustomText>
          {!centerTitle && firmName ? (
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.firm} numberOfLine={1}>
              {firmName}
            </CustomText>
          ) : null}
        </View>

        {trailing ? (
          trailing
        ) : hideAvatar ? (
          <View style={styles.sideSpacer} />
        ) : (
          <View style={styles.avatar}>
            <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.avatarText}>
              {initials}
            </CustomText>
          </View>
        )}
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
    shadowColor: Colors.drawerGradientEnd,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
  },
  menuBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(50),
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginHorizontal: moderateScale(12),
  },
  headerTextCentered: {
    alignItems: 'center',
    marginHorizontal: moderateScale(4),
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.85)',
    // letterSpacing: 1.2,
    fontSize: RFValue(11),
    // marginBottom: 2,
  },
  title: {
    color: Colors.white,
    // letterSpacing: -0.3,
  },
  titleCentered: {
    fontSize: RFValue(16),
    textAlign: 'center',
  },
  firm: {
    color: 'rgba(255,255,255,0.9)',
    // marginTop: 2,
  },
  sideSpacer: {
    width: moderateScale(50),
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
