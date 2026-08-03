import CustomText from '@/components/global/CustomText';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/states/authStore';
import { getGreeting } from '@/utils/homeMetrics';

// Same green gradient as VendorHeader
const HEADER_GRADIENT = {
  colors: [Colors.drawerGradientStart, Colors.drawerGradientEnd] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

type Props = {
  greeting?: string;
  firmName?: string;
  notificationCount?: number;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
};

function HomeHeader({
  greeting,
  firmName,
  notificationCount = 3,
  onMenuPress,
  onNotificationPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);

  const displayGreeting = greeting ?? getGreeting();
  const displayFirmName = firmName ?? (user?.name?.trim() || user?.firm_name?.trim() || 'Store Manager');

  function handleMenuPress() {
    if (onMenuPress) {
      onMenuPress();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }

  return (
    <View
      style={[
        styles.gradient,
        {
          paddingTop: insets.top + moderateScaleVertical(12),
          paddingBottom: moderateScaleVertical(12),
        },
      ]}
    >
      <LinearGradient
        colors={[...HEADER_GRADIENT.colors]}
        start={HEADER_GRADIENT.start}
        end={HEADER_GRADIENT.end}
        style={StyleSheet.absoluteFill}
      />
      {/* Left Menu Button */}
      <TouchableOpacity
        onPress={handleMenuPress}
        style={styles.circleBtn}
        accessibilityLabel="Open drawer menu"
        activeOpacity={0.85}
      >
        <Ionicons name="menu" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Center Greeting & Store Details */}
      <View style={styles.textWrap}>
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.medium}
          style={styles.greeting}
          numberOfLine={1}
        >
          {displayGreeting}
        </CustomText>
        <CustomText
          variant="h6"
          fontFamily={Fonts.montserrat.semiBold}
          style={styles.firmName}
          numberOfLine={1}
        >
          {displayFirmName}
        </CustomText>
      </View>

      {/* Right Notification Bell Button */}
      {/* <TouchableOpacity
        onPress={onNotificationPress}
        style={styles.notificationBtn}
        accessibilityLabel="Notifications"
        activeOpacity={0.85}
      >
        <Ionicons name="notifications-outline" size={22} color={Colors.black} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <CustomText style={styles.badgeText} numberOfLine={1}>
              {notificationCount}
            </CustomText>
          </View>
        )}
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),

  },
  circleBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginHorizontal: moderateScale(12),
    justifyContent: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: RFValue(11),
    // marginBottom: moderateScaleVertical(1),
  },
  firmName: {
    color: Colors.white,
    fontSize: RFValue(15),
  },
  notificationBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -moderateScaleVertical(2),
    right: -moderateScale(2),
    backgroundColor: '#FF3B30',
    borderRadius: moderateScale(10),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(4),
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: RFValue(8),
    fontFamily: Fonts.montserrat.bold,
  },
});

export default memo(HomeHeader);
