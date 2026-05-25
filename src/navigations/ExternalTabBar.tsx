import {VendorTabBar} from '@/navigations/VendorTabBar';
import {TabNav} from '@/navigations/NavigationKeys';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {StyleSheet} from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
import ServiceManagementScreen from '@/screens/ServiceManagementScreen';
import MyApplicationsScreen from '@/screens/MyApplicationsScreen';
import CollectRequestScreen from '@/screens/CollectRequestScreen';
import type {MainTabParamList} from '@/navigations/NavigationKeys';

const Tab = createBottomTabNavigator<MainTabParamList>();

type Props = {onTabChange?: (name: string) => void};

export default function ExternalTabBar({onTabChange}: Props) {
  return (
    <Tab.Navigator
      tabBar={props => <VendorTabBar {...props} />}
      screenListeners={{
        state: e => {
          const idx = e.data.state?.index ?? 0;
          const name = e.data.state?.routes[idx]?.name;
          if (name) {
            onTabChange?.(name);
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name={TabNav.Home}
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name={TabNav.Services}
        component={ServiceManagementScreen}
        options={{tabBarLabel: 'Services'}}
      />
      <Tab.Screen
        name={TabNav.Requests}
        component={MyApplicationsScreen}
        options={{tabBarLabel: 'Requests'}}
      />
      <Tab.Screen
        name={TabNav.Collect}
        component={CollectRequestScreen}
        options={{tabBarLabel: 'Collect'}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
    borderTopWidth: 0,
    height: moderateScaleVertical(56),
    backgroundColor: 'transparent',
  },
});
