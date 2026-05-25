import {Dimensions, Platform, StatusBar} from 'react-native';

const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number): number => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number): number =>
  (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;
const moderateScaleVertical = (size: number, factor = 0.5): number =>
  size + (verticalScale(size) - size) * factor;

export {scale, verticalScale, moderateScale, moderateScaleVertical, width, height};
