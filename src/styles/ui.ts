import {Colors} from '@/constants/colors';
import {theme} from '@/constants/theme';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {StyleSheet} from 'react-native';

export const screen = StyleSheet.create({
  scroll: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
    /** Space for vendor-style bottom tab bar + safe area */
    paddingBottom: moderateScaleVertical(88),
  },
  pageBg: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});

export const card = StyleSheet.create({
  base: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    marginBottom: moderateScaleVertical(14),
    ...theme.shadow,
    borderWidth: 1,
    borderColor: 'rgba(232,236,240,0.8)',
  },
  flat: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(10),
    borderWidth: 1,
    borderColor: Colors.line,
  },
});

export const input = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(14),
    minHeight: moderateScaleVertical(52),
  },
  rowFocused: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandSoft,
  },
  field: {
    flex: 1,
    fontSize: moderateScale(15),
    color: Colors.black,
    paddingVertical: moderateScaleVertical(12),
  },
  textarea: {
    minHeight: moderateScaleVertical(100),
    textAlignVertical: 'top' as const,
    paddingTop: moderateScaleVertical(12),
  },
});

export const cta = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: Colors.brand,
    borderRadius: moderateScale(16),
    minHeight: moderateScaleVertical(54),
    shadowColor: Colors.brandDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.brandSoft,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  ghost: {
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
  },
});
