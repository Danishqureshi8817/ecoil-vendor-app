import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
};

export function EmptyState({icon, title, subtitle}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color={Colors.brand} />
      </View>
      <CustomText variant="h6" fontFamily={Fonts.inter.semiBold} style={styles.title}>
        {title}
      </CustomText>
      {subtitle ? (
        <CustomText variant="h6" fontFamily={Fonts.inter.medium} style={[styles.sub,{color: Colors.black}]}>
          {subtitle}
        </CustomText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(32),
    paddingHorizontal: moderateScale(24),
  },
  iconCircle: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(14),
  },
  title: {color: Colors.black, textAlign: 'center'},
  sub: {color: Colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20},
});
