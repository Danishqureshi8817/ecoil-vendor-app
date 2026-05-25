import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={{flex: 1}}>
        <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.title}>
          {title}
        </CustomText>
        {subtitle ? (
          <CustomText variant="h7" style={styles.sub}>
            {subtitle}
          </CustomText>
        ) : null}
      </View>
      {onRefresh ? (
        <Pressable
          onPress={onRefresh}
          disabled={refreshing}
          style={styles.iconBtn}
          hitSlop={8}>
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.brand} />
          ) : (
            <Ionicons name="refresh-outline" size={22} color={Colors.brand} />
          )}
        </Pressable>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.actionPill}>
          <CustomText variant="h7" fontFamily={Fonts.inter.semiBold} style={styles.actionText}>
            {actionLabel}
          </CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScaleVertical(14),
    gap: moderateScale(10),
  },
  title: {color: Colors.black, letterSpacing: -0.3},
  sub: {color: Colors.muted, marginTop: 4},
  iconBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPill: {
    backgroundColor: Colors.brandSoft,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(20),
  },
  actionText: {color: Colors.brand},
});
