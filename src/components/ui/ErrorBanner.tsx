import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {message: string};

export function ErrorBanner({message}: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name="alert-circle" size={18} color={Colors.error} />
      <CustomText variant="h7" style={styles.text} numberOfLine={4}>
        {message}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(10),
    backgroundColor: Colors.errorSoft,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(12),
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  text: {color: Colors.error, flex: 1, lineHeight: 18},
});
