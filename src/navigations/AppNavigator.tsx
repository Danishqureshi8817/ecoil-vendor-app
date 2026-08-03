import CheckInternet from '@/components/global/CheckInternet';
import {StackNav} from '@/navigations/NavigationKeys';
import MainScreen from '@/navigations/MainScreen';
import Splash from '@/screens/Splash';
import Login from '@/screens/Login';
import CollectRequestListScreen from '@/screens/CollectRequestListScreen';
import CollectRequestDetailScreen from '@/screens/CollectRequestDetailScreen';
import MyCertificatesScreen from '@/screens/MyCertificatesScreen';
import MyRewardsScreen from '@/screens/MyRewardsScreen';
import PaymentDetailsScreen from '@/screens/PaymentDetailsScreen';
import AgreementScreen from '@/screens/AgreementScreen';
import ScrapRequestsScreen from '@/screens/ScrapRequestsScreen';
import CreateScrapRequestScreen from '@/screens/CreateScrapRequestScreen';
import ProcessScrapRequestScreen from '@/screens/ProcessScrapRequestScreen';
import WasteRequestsScreen from '@/screens/WasteRequestsScreen';
import CreateWasteRequestScreen from '@/screens/CreateWasteRequestScreen';
import ProcessWasteRequestScreen from '@/screens/ProcessWasteRequestScreen';
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
          name={StackNav.CollectRequestDetail}
          component={CollectRequestDetailScreen}
        />
        <Stack.Screen
          name={StackNav.MyCertificates}
          component={MyCertificatesScreen}
        />
        <Stack.Screen name={StackNav.MyRewards} component={MyRewardsScreen} />
        <Stack.Screen
          name={StackNav.PaymentDetails}
          component={PaymentDetailsScreen}
        />
        <Stack.Screen name={StackNav.Agreement} component={AgreementScreen} />
        <Stack.Screen
          name={StackNav.ScrapRequests}
          component={ScrapRequestsScreen}
        />
        <Stack.Screen
          name={StackNav.CreateScrapRequest}
          component={CreateScrapRequestScreen}
        />
        <Stack.Screen
          name={StackNav.ProcessScrapRequest}
          component={ProcessScrapRequestScreen}
        />
        <Stack.Screen
          name={StackNav.WasteRequests}
          component={WasteRequestsScreen}
        />
        <Stack.Screen
          name={StackNav.CreateWasteRequest}
          component={CreateWasteRequestScreen}
        />
        <Stack.Screen
          name={StackNav.ProcessWasteRequest}
          component={ProcessWasteRequestScreen}
        />
      </Stack.Navigator>
      <CheckInternet />
    </NavigationContainer>
  );
}
