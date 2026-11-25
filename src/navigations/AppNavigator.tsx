import CheckInternet from '@/components/global/CheckInternet';
import ForceUpdateModal from '@/components/global/ForceUpdateModal';
import { StackNav } from '@/navigations/NavigationKeys';
import Splash from '@/screens/Splash';
import OnboardingScreen from '@/screens/OnboardingScreen';
import Login from '@/screens/Login';
import CollectRequestDetailScreen from '@/screens/CollectRequestDetailScreen';
import CounterCollectionDetailScreen from '@/screens/CounterCollectionDetailScreen';
import ProcessScrapRequestScreen from '@/screens/ProcessScrapRequestScreen';
import ProcessWasteRequestScreen from '@/screens/ProcessWasteRequestScreen';
import {
  getActiveRouteName,
  navigationRef,
} from '@/utils/NavigationUtils';
import useInAppUpdate from '@/utils/useInAppUpdate';
import { setCrashScreen } from '@/services/crashReporting';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useRef } from 'react';
import type { RootStackParamList } from '@/navigations/NavigationKeys';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { updateRequired, liveVersion, onUpdatePress } = useInAppUpdate();
  const routeNameRef = useRef<string | undefined>(undefined);

  const onReady = useCallback(() => {
    const name = getActiveRouteName(navigationRef.getRootState());
    routeNameRef.current = name;
    setCrashScreen(name);
  }, []);

  const onStateChange = useCallback(() => {
    const previous = routeNameRef.current;
    const current = getActiveRouteName(navigationRef.getRootState());
    if (previous !== current) {
      routeNameRef.current = current;
      setCrashScreen(current);
    }
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onStateChange={onStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={StackNav.Splash} component={Splash} />
        <Stack.Screen name={StackNav.Onboarding} component={OnboardingScreen} />
        <Stack.Screen name={StackNav.Login} component={Login} />
        <Stack.Screen name={StackNav.Main} component={DrawerNavigator} />

        <Stack.Screen
          name={StackNav.CollectRequestDetail}
          component={CollectRequestDetailScreen}
        />
        <Stack.Screen
          name={StackNav.CountersCollectionDetail}
          component={CounterCollectionDetailScreen}
        />
        <Stack.Screen
          name={StackNav.ProcessScrapRequest}
          component={ProcessScrapRequestScreen}
        />
        <Stack.Screen
          name={StackNav.ProcessWasteRequest}
          component={ProcessWasteRequestScreen}
        />
      </Stack.Navigator>
      <CheckInternet />
      <ForceUpdateModal
        visible={updateRequired}
        liveVersion={liveVersion}
        onUpdate={onUpdatePress}
      />
    </NavigationContainer>
  );
}
