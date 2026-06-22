import CustomText from '@/components/global/CustomText';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { goBack } from '@/utils/NavigationUtils';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { memo } from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';

// Same gradient tokens as VendorHeader
const HEADER_GRADIENT = {
  colors: [Colors.drawerGradientStart, Colors.drawerGradientEnd] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

type Props = {
  title: string;
  /** 'back' shows ← arrow; 'menu' shows ☰; 'close' shows ✕ close icon. Default: 'back' */
  leading?: 'back' | 'menu' | 'close';
  /** Override the leading button press handler */
  onLeadingPress?: () => void;
  /** Optional element shown on the right side */
  trailing?: React.ReactNode;
  /** Center the title text. Default: true */
  centerTitle?: boolean;
};

function AppBar({
  title,
  leading = 'back',
  onLeadingPress,
  trailing,
  centerTitle = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  function handleLeadingPress() {
    if (onLeadingPress) {
      onLeadingPress();
      return;
    }
    if (leading === 'menu') {
      navigation.dispatch(DrawerActions.openDrawer());
    } else {
      goBack();
    }
  }

  return (
    <>
      {/* <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      /> */}
      <LinearGradient
        colors={[...HEADER_GRADIENT.colors]}
        start={HEADER_GRADIENT.start}
        end={HEADER_GRADIENT.end}
        style={[styles.gradient, { paddingTop: moderateScaleVertical(insets.top) }]}>

        {/* Leading button — back, menu, or close */}
        <TouchableOpacity
          onPress={handleLeadingPress}
          style={styles.leadingBtn}
          accessibilityLabel={leading === 'back' ? 'Go back' : leading === 'menu' ? 'Open menu' : 'Close'}
          activeOpacity={0.85}>
          <Ionicons
            name={leading === 'back' ? 'arrow-back' : leading === 'menu' ? 'menu' : 'close'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        {/* Title */}
        <View style={[styles.titleWrap, centerTitle && styles.titleWrapCentered]}>
          <CustomText
            numberOfLine={1}
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={[styles.title]}>
            {title}
          </CustomText>
        </View>

        {/* Trailing — icon or balanced spacer */}
        {trailing ? (
          <View style={styles.leadingBtn}>{trailing}</View>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </LinearGradient>
    </>
  );
}

export default memo(AppBar);

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: moderateScaleVertical(68),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(16),
  },
  leadingBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    marginHorizontal: moderateScale(12),
  },
  titleWrapCentered: {
    alignItems: 'center',
    marginHorizontal: moderateScale(4),
  },
  title: {
    color: Colors.white,
    fontSize: RFValue(14),
  },
  sideSpacer: {
    width: moderateScale(50),
  },
});
