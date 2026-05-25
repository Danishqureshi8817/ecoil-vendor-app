import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {input} from '@/styles/ui';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useState} from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';

type Props = TextInputProps & {
  label: string;
  containerStyle?: object;
};

export function FormField({label, containerStyle, style, ...rest}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <CustomText variant="h7" style={styles.label}>
        {label}
      </CustomText>
      <View style={[input.row, focused && input.rowFocused]}>
        <TextInput
          {...rest}
          style={[input.field, {fontFamily: Fonts.inter.regular}, style]}
          placeholderTextColor={Colors.placeHolderColor}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginBottom: moderateScaleVertical(14)},
  label: {
    color: Colors.muted,
    marginBottom: moderateScaleVertical(8),
    marginLeft: moderateScale(2),
    fontFamily: Fonts.inter.medium,
  },
});
