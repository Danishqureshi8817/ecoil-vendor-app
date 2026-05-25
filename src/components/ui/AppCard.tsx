import {card} from '@/styles/ui';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
};

export function AppCard({children, style, flat}: Props) {
  return (
    <View style={[flat ? card.flat : card.base, style]}>{children}</View>
  );
}
