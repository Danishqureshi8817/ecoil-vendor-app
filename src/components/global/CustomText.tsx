import {Colors} from '@/constants/colors';
import {Fonts, FontWeights} from '@/constants/fonts';
import React from 'react';
import {StyleSheet, Text, TextStyle} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

interface Props {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'body';
  fontFamily?: string;
  fontSize?: number;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
  numberOfLine?: number;
}

const getFontWeightFromFamily = (
  fontFamily: string | undefined,
): TextStyle['fontWeight'] => {
  if (!fontFamily) {
    return undefined;
  }
  const f = fontFamily.toLowerCase();
  if (f.includes('light')) {
    return FontWeights.light;
  }
  if (f.includes('medium')) {
    return FontWeights.medium;
  }
  if (f.includes('semibold')) {
    return FontWeights.semiBold;
  }
  if (f.includes('bold')) {
    return FontWeights.bold;
  }
  return FontWeights.regular;
};

const CustomText: React.FC<Props> = ({
  variant = 'body',
  fontFamily = Fonts.inter.regular,
  fontSize,
  style,
  children,
  numberOfLine,
}) => {
  const sizes: Record<string, number> = {
    h1: 24,
    h2: 22,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    h7: 12,
    body: 14,
  };
  const computedFontSize = RFValue(fontSize || sizes[variant] || 14);

  return (
    <Text
      style={[
        styles.text,
        {
          color: Colors.black,
          fontSize: computedFontSize,
          fontFamily,
          fontWeight: getFontWeightFromFamily(fontFamily),
        },
        style,
      ]}
      numberOfLines={numberOfLine}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {textAlign: 'left'},
});

export default CustomText;
