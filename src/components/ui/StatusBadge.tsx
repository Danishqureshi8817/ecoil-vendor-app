import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {status: string};

export function StatusBadge({status}: Props) {
  const s = status.toLowerCase();
  let bg = Colors.brandSoft;
  let color = Colors.brand;
  if (s.includes('pending') || s.includes('wait')) {
    bg = Colors.accentSoft;
    color = Colors.accent;
  } else if (s.includes('reject') || s.includes('cancel')) {
    bg = Colors.errorSoft;
    color = Colors.error;
  } else if (s.includes('complete') || s.includes('done') || s.includes('approve')) {
    bg = Colors.successSoft;
    color = Colors.success;
  }

  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <CustomText variant="h7" fontFamily={Fonts.inter.semiBold} style={{color}}>
        {status}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
    marginTop: moderateScaleVertical(6),
  },
});
