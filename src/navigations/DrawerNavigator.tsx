import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import MainScreen from './MainScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { width } from '@/utils/responsiveSize';
import { StackNav } from './NavigationKeys';
import PaymentDetailsScreen from '@/screens/PaymentDetailsScreen';
import AgreementScreen from '@/screens/AgreementScreen';
import MyCertificatesScreen from '@/screens/MyCertificatesScreen';
import CollectRequestDetailScreen from '@/screens/CollectRequestDetailScreen';
import CollectRequestListScreen from '@/screens/CollectRequestListScreen';
import MyRewardsScreen from '@/screens/MyRewardsScreen';
import MyApplicationsScreen from '@/screens/MyApplicationsScreen';
import HomeScreen from '@/screens/HomeScreen';
import ExternalTabBar from './ExternalTabBar';
import CollectRequestScreen from '@/screens/CollectRequestScreen';
import CounterCollectionListScreen from '@/screens/CounterCollectionListScreen';
import ContactUsScreen from '@/screens/ContactUsScreen';

const Drawer = createDrawerNavigator();
const DRAWER_WIDTH = Math.min(width * 0.75, 320);

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: DRAWER_WIDTH,
        },
      }}
    >
      <Drawer.Screen name={StackNav.TabNav} component={ExternalTabBar} />
      <Drawer.Screen
        name={StackNav.CollectionRequest}
        component={CollectRequestScreen}
      />
      <Drawer.Screen
        name={StackNav.CollectRequestList}
        component={CollectRequestListScreen}
      />
      <Drawer.Screen
        name={StackNav.CountersCollectionList}
        component={CounterCollectionListScreen}
      />
      <Drawer.Screen
        name={StackNav.MyServiceRequests}
        component={MyApplicationsScreen}
      />
      <Drawer.Screen
        name={StackNav.MyCertificates}
        component={MyCertificatesScreen}
      />
      <Drawer.Screen name={StackNav.MyRewards} component={MyRewardsScreen} />
      <Drawer.Screen
        name={StackNav.PaymentDetails}
        component={PaymentDetailsScreen}
      />
      <Drawer.Screen name={StackNav.Agreement} component={AgreementScreen} />
      <Drawer.Screen name={StackNav.ContactUs} component={ContactUsScreen} />
    </Drawer.Navigator>
  );
}