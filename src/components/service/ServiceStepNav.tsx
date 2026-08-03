import React from 'react';
import {StyleSheet, View} from 'react-native';
import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {RFValue} from 'react-native-responsive-fontsize';

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
      {steps.map((s, index) => {
        const active = step === s.key;
        return (
          <React.Fragment key={s.key}>
            {index > 0 ? <View style={styles.line} /> : null}
            <View style={[styles.pill, active && styles.pillActive]}>
              <View style={[styles.numWrap, active && styles.numWrapActive]}>
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.semiBold}
                  style={active ? styles.numActiveText : styles.numText}>
                  {s.num}
                </CustomText>
              </View>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={active ? styles.pillLabelActive : styles.pillLabel}>
                {s.label}
              </CustomText>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(6),
    marginBottom: moderateScaleVertical(16),
    overflow: 'visible',
    ...theme.shadow,
    shadowOpacity: 0.08,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(7),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
  },
  pillActive: {
    backgroundColor: Colors.brandSoft,
    borderRadius: moderateScale(25),
    overflow: 'hidden',
  },
  pillLabel: {
    color: Colors.muted,
    fontSize: RFValue(10),
  },
  pillLabelActive: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(10),
  },
  numWrap: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numWrapActive: {
    backgroundColor: Colors.drawerGradientEnd,
  },
  numText: {
    color: Colors.muted,
    fontSize: RFValue(10),
  },
  numActiveText: {
    color: Colors.white,
    fontSize: RFValue(10),
  },
  line: {
    width: moderateScale(14),
    height: 1,
    backgroundColor: Colors.line,
  },
});
