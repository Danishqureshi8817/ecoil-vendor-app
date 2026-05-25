import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale} from '@/utils/responsiveSize';
import React, {FC} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

export type ButtonProps = {
  onPress?: () => void;
  buttonText: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const PrimaryButton: FC<ButtonProps> = ({
  onPress,
  buttonText,
  disabled = false,
  loading = false,
  style,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      styles.button,
      {backgroundColor: disabled ? '#94a3b8' : Colors.brand},
      style,
    ]}>
    {loading ? (
      <ActivityIndicator color={Colors.white} size="small" />
    ) : (
      <Text style={styles.buttonText}>{buttonText}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: moderateScale(12),
    height: moderateScale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.inter.semiBold,
    fontSize: RFValue(15),
    fontWeight: '600',
  },
});

export default PrimaryButton;
