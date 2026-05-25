import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {cta} from '@/styles/ui';
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function PrimaryCta({
  label,
  onPress,
  loading,
  disabled,
  style,
  icon,
}: Props) {
  const off = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={off}
      style={[cta.primary, off && cta.primaryDisabled, style]}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <>
          <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={{color: Colors.white}}>
            {label}
          </CustomText>
          {icon}
        </>
      )}
    </TouchableOpacity>
  );
}
