import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import type {ExternalVendorUser} from '@/types/vendor';
import {navigateToTab, push, resetAndNavigate} from '@/utils/NavigationUtils';
import {isPrimaryVendor} from '@/utils/vendorUser';

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  primaryOnly?: boolean;
};

export function buildVendorNavItems(
  activeKey: string,
  user?: ExternalVendorUser | null,
): NavItem[] {
  const resolvedUser = user ?? useAuthStore.getState().user;
  const primary = isPrimaryVendor(resolvedUser);

  const items: NavItem[] = [
    {
      key: TabNav.Home,
      label: 'Home',
      icon: 'home-outline',
      onPress: () => resetAndNavigate(StackNav.Main, 0),
    },
    {
      key: TabNav.Services,
      label: 'Our Services',
      icon: 'grid-outline',
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Services);
      },
    },
    {
      key: TabNav.Requests,
      label: 'My Service Requests',
      icon: 'document-text-outline',
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Requests);
      },
    },
    {
      key: TabNav.Collect,
      label: 'Collection Request',
      icon: 'cube-outline',
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Collect);
      },
    },
    {
      key: StackNav.CollectRequestList,
      label: 'Collection History',
      icon: 'list-outline',
      onPress: () => push(StackNav.CollectRequestList),
    },
    {
      key: StackNav.MyCertificates,
      label: 'My Certificates',
      icon: 'ribbon-outline',
      onPress: () => push(StackNav.MyCertificates),
    },
    {
      key: StackNav.PaymentDetails,
      label: 'Payment Details',
      icon: 'card-outline',
      onPress: () => push(StackNav.PaymentDetails),
      primaryOnly: true,
    },
    {
      key: StackNav.Agreement,
      label: 'Agreement',
      icon: 'document-outline',
      onPress: () => push(StackNav.Agreement),
      primaryOnly: true,
    },
  ];

  return items.filter(item => !item.primaryOnly || primary);
}
