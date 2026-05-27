import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {HEADER_GRADIENT} from '@/components/layout/VendorHeader';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  title: string;
  onBack: () => void;
};

export function VendorBackHeader({title, onBack}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <LinearGradient
        colors={[...HEADER_GRADIENT.colors]}
        locations={[...HEADER_GRADIENT.locations]}
        start={HEADER_GRADIENT.start}
        end={HEADER_GRADIENT.end}
        useAngle
        angle={HEADER_GRADIENT.angle}
        style={[styles.gradient, {paddingTop: insets.top + moderateScaleVertical(8)}]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.title} numberOfLine={1}>
            {title}
          </CustomText>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(18),
    shadowColor: Colors.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
  },
  backBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginHorizontal: moderateScale(12),
  },
  title: {
    color: Colors.white,
    letterSpacing: -0.3,
  },
});
