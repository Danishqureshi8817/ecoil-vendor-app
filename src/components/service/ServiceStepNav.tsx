import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Step = 'list' | 'form';

type Props = {
  step: Step;
};

export function ServiceStepNav({step}: Props) {
  return (
    <View style={styles.nav}>
      <View style={[styles.pill, step === 'list' && styles.pillActive]}>
        <View style={step === 'list' ? styles.numActiveWrap : styles.numWrap}>
          {step === 'list' ? (
            <LinearGradient
              colors={[Colors.brandDark, Colors.brand]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.numActive}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numActiveText}>
                1
              </CustomText>
            </LinearGradient>
          ) : (
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numText}>
              1
            </CustomText>
          )}
        </View>
        <CustomText
          variant="h7"
          fontFamily={Fonts.inter.bold}
          style={step === 'list' ? styles.pillLabelActive : styles.pillLabel}>
          Service
        </CustomText>
      </View>

      <View style={styles.line} />

      <View style={[styles.pill, step === 'form' && styles.pillActive]}>
        <View style={step === 'form' ? styles.numActiveWrap : styles.numWrap}>
          {step === 'form' ? (
            <LinearGradient
              colors={[Colors.brandDark, Colors.brand]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.numActive}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numActiveText}>
                2
              </CustomText>
            </LinearGradient>
          ) : (
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numText}>
              2
            </CustomText>
          )}
        </View>
        <CustomText
          variant="h7"
          fontFamily={Fonts.inter.bold}
          style={step === 'form' ? styles.pillLabelActive : styles.pillLabel}>
          Form
        </CustomText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(5),
    marginBottom: moderateScaleVertical(16),
    ...theme.shadow,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    paddingVertical: moderateScaleVertical(9),
    paddingHorizontal: moderateScale(16),
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: Colors.brandSoft,
  },
  pillLabel: {
    color: Colors.muted,
  },
  pillLabelActive: {
    color: Colors.brandDark,
  },
  numWrap: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: 12,
    backgroundColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numActiveWrap: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: 12,
    overflow: 'hidden',
  },
  numActive: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: Colors.black,
    fontSize: moderateScale(11),
  },
  numActiveText: {
    color: Colors.white,
    fontSize: moderateScale(11),
  },
  line: {
    width: moderateScale(24),
    height: 2,
    backgroundColor: Colors.line,
    borderRadius: 2,
    marginHorizontal: moderateScale(4),
  },
});
