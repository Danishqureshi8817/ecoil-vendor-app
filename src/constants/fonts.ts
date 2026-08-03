export const Fonts = {
  inter: {
    regular: 'Inter-Regular',
    light: 'Inter-Light',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  inika: {
    regular: 'Inika-Regular',
    bold: 'Inika-Bold',
  },
  /** Scrap/waste screens (stash) use montserrat keys — map to Inter. */
  montserrat: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  default: 'Inter-Regular',
};

export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};
