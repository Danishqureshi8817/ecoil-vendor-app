import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {externalUi} from '@/styles/externalUi';
import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet} from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'link';
};

export function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'default',
}: Props) {
  const isLink = variant === 'link';

  return (
    <Pressable
      style={({pressed}) => [
        externalUi.btnSecondary,
        isLink && externalUi.btnSecondaryLink,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.brand} />
      ) : (
        <CustomText
          variant="h7"
          style={isLink ? externalUi.btnSecondaryTextLink : externalUi.btnSecondaryText}>
          {label}
        </CustomText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {opacity: 0.9, transform: [{scale: 0.97}]},
  disabled: {opacity: 0.6},
});
