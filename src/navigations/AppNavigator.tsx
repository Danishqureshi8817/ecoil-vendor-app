import CheckInternet from '@/components/global/CheckInternet';
import {StackNav} from '@/navigations/NavigationKeys';
import MainScreen from '@/navigations/MainScreen';
import Splash from '@/screens/Splash';
import Login from '@/screens/Login';
import CollectRequestListScreen from '@/screens/CollectRequestListScreen';
import MyCertificatesScreen from '@/screens/MyCertificatesScreen';
import {navigationRef} from '@/utils/NavigationUtils';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import type {RootStackParamList} from '@/navigations/NavigationKeys';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={StackNav.Splash} component={Splash} />
        <Stack.Screen name={StackNav.Login} component={Login} />
        <Stack.Screen name={StackNav.Main} component={MainScreen} />
        <Stack.Screen
          name={StackNav.CollectRequestList}
          component={CollectRequestListScreen}
        />
        <Stack.Screen
          name={StackNav.MyCertificates}
          component={MyCertificatesScreen}
        />
      </Stack.Navigator>
      <CheckInternet />
    </NavigationContainer>
  );
}
