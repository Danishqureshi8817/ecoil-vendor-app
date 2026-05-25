import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useCheckSession from '@/hooks/vendor/use-check-session';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function Splash() {
  const insets = useSafeAreaInsets();
  const {checkSession} = useCheckSession();

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!cancelled) {
        await checkSession();
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [checkSession]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.brandDark} />
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <View style={[styles.content, {paddingTop: insets.top}]}>
        <View style={styles.logoRing}>
          <Image
            source={require('@/assets/images/ecoilIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <CustomText variant="h3" fontFamily={Fonts.inter.bold} style={styles.title}>
          Ecoil Partner
        </CustomText>
        <CustomText variant="h7" style={styles.sub}>
          Vendor portal
        </CustomText>
        <ActivityIndicator
          color={Colors.white}
          size="large"
          style={{marginTop: moderateScaleVertical(32)}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.brandDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: moderateScale(200),
    height: moderateScale(200),
    top: '15%',
    right: -moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orb2: {
    width: moderateScale(160),
    height: moderateScale(160),
    bottom: '20%',
    left: -moderateScale(40),
    backgroundColor: 'rgba(252,128,25,0.25)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(32),
  },
  logoRing: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(24),
  },
  logo: {
    width: moderateScale(64),
    height: moderateScale(64),
  },
  title: {color: Colors.white, letterSpacing: -0.5},
  sub: {color: 'rgba(255,255,255,0.8)', marginTop: 8},
});
