import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import NetInfo from '@react-native-community/netinfo';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CheckInternet() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{position: 'absolute', bottom: 0, width: '100%'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: moderateScale(20),
          paddingVertical: moderateScaleVertical(14),
          backgroundColor: Colors.brandDark,
        }}>
        <View>
          <CustomText
            variant="h6"
            fontFamily={Fonts.inter.semiBold}
            style={{color: Colors.white}}>
            No internet
          </CustomText>
          <CustomText
            variant="h7"
            fontFamily={Fonts.inter.regular}
            style={{color: Colors.brandSoft, marginTop: 4}}>
            Check your connection and try again
          </CustomText>
        </View>
      </View>
    </SafeAreaView>
  );
}
