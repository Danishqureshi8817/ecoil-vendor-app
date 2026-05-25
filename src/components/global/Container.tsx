import {Colors} from '@/constants/colors';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Platform, StatusBar, StatusBarStyle, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

export interface ContainerProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  statusBarBackgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  fullScreen?: boolean;
}

export function Container(props: ContainerProps) {
  const {
    children,
    backgroundColor = Colors.bg,
    fullScreen,
    statusBarBackgroundColor,
    statusBarStyle = 'dark-content',
  } = props;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(fullScreen ?? false);
        StatusBar.setBackgroundColor(statusBarBackgroundColor ?? Colors.bg);
      }
      StatusBar.setBarStyle(statusBarStyle);
    }, [fullScreen, statusBarBackgroundColor, statusBarStyle]),
  );

  if (Platform.OS === 'ios' && !fullScreen) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: statusBarBackgroundColor ?? backgroundColor,
        }}>
        <StatusBar barStyle={statusBarStyle} />
        <View style={{height: insets.top, backgroundColor: statusBarBackgroundColor ?? backgroundColor}} />
        <SafeAreaView
          edges={['left', 'right', 'bottom']}
          style={{flex: 1, backgroundColor}}>
          {children}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={fullScreen ? [] : ['left', 'right', 'top']}
      style={{flex: 1, backgroundColor}}>
      <StatusBar barStyle={statusBarStyle} />
      {children}
    </SafeAreaView>
  );
}
