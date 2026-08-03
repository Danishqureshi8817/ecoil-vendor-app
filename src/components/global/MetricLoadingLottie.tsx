import {Colors} from '@/constants/colors';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import LottieView from 'lottie-react-native';
import React from 'react';
import {StyleSheet, type StyleProp, type ViewStyle} from 'react-native';

const LOADING_DOTS = require('@/assets/animation/LoadingDots.json');

type MetricLoadingLottieProps = {
  tint?: 'light' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  sm: {width: moderateScale(42), height: moderateScaleVertical(16)},
  md: {width: moderateScale(52), height: moderateScaleVertical(20)},
  lg: {width: moderateScale(72), height: moderateScaleVertical(28)},
} as const;

export function MetricLoadingLottie({
  tint = 'brand',
  size = 'md',
  style,
}: MetricLoadingLottieProps) {
  const color = tint === 'light' ? Colors.white : Colors.brand;
  const dimensions = SIZES[size];

  return (
    <LottieView
      source={LOADING_DOTS}
      autoPlay
      loop
      style={[styles.base, dimensions, style]}
      colorFilters={[
        {keypath: 'Left', color},
        {keypath: 'Mid', color},
        {keypath: 'Right', color},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
  },
});
