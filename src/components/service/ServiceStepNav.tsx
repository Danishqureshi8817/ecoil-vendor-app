import React from 'react';
import {StyleSheet, View} from 'react-native';
import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import LinearGradient from 'react-native-linear-gradient';

export type ServiceStep = 'list' | 'suppliers' | 'form';

type Props = {
  step: ServiceStep;
};

export function ServiceStepNav({step}: Props) {
  const steps: {key: ServiceStep; num: number; label: string}[] = [
    {key: 'list', num: 1, label: 'Service'},
    {key: 'suppliers', num: 2, label: 'Partners'},
    {key: 'form', num: 3, label: 'Form'},
  ];

  return (
    <View style={styles.nav}>
      {steps.map((s, index) => (
        <React.Fragment key={s.key}>
          {index > 0 ? <View style={styles.line} /> : null}
          <View style={[styles.pill, step === s.key && styles.pillActive]}>
            {step === s.key ? (
              <LinearGradient
                colors={[Colors.brandDark, Colors.brand]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.numActive}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numActiveText}>
                  {s.num}
                </CustomText>
              </LinearGradient>
            ) : (
              <View style={styles.numWrap}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.numText}>
                  {s.num}
                </CustomText>
              </View>
            )}
            <CustomText
              variant="h7"
              fontFamily={Fonts.inter.bold}
              style={step === s.key ? styles.pillLabelActive : styles.pillLabel}>
              {s.label}
            </CustomText>
          </View>
        </React.Fragment>
      ))}
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
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(10),
    borderRadius: 999,
  },
  pillActive: {backgroundColor: Colors.brandSoft},
  pillLabel: {color: Colors.muted, fontSize: moderateScale(11)},
  pillLabelActive: {color: Colors.brandDark, fontSize: moderateScale(11)},
  numWrap: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: 11,
    backgroundColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numActive: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {color: Colors.black, fontSize: moderateScale(10)},
  numActiveText: {color: Colors.white, fontSize: moderateScale(10)},
  line: {
    width: moderateScale(12),
    height: 2,
    backgroundColor: Colors.line,
    borderRadius: 2,
  },
});
