import {resolvePostSplashRoute} from '@/utils/postSplashNavigation';
import React, {useEffect} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {Colors} from '@/constants/colors';

export default function Splash() {
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) {
        void resolvePostSplashRoute();
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.onboardingBg} />
      <Image
        source={require('@/assets/images/Splash.png')}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="Ecoil — Good oil, good food, good life"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.onboardingBg,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
