import CheckInternet from '@/components/global/CheckInternet';
import ForceUpdateModal from '@/components/global/ForceUpdateModal';
import { StackNav } from '@/navigations/NavigationKeys';
import Splash from '@/screens/Splash';
import OnboardingScreen from '@/screens/OnboardingScreen';
import Login from '@/screens/Login';
import CollectRequestDetailScreen from '@/screens/CollectRequestDetailScreen';
import CounterCollectionDetailScreen from '@/screens/CounterCollectionDetailScreen';
import { navigationRef } from '@/utils/NavigationUtils';
import useInAppUpdate from '@/utils/useInAppUpdate';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { RootStackParamList } from '@/navigations/NavigationKeys';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { updateRequired, liveVersion, onUpdatePress } = useInAppUpdate();

  return (
    <NavigationContainer ref={navigationRef}>
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
