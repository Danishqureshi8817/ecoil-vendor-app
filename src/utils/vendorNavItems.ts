import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import type {ExternalVendorUser} from '@/types/vendor';
import {navigate, resetAndNavigate} from '@/utils/NavigationUtils';
import {
  isParentCounter,
  isPrimaryVendor,
  isScrapVendor,
} from '@/utils/vendorUser';

export type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  primaryOnly?: boolean;
  parentCounterOnly?: boolean;
  hideForParentCounter?: boolean;
  /** Only show for scrap vendors (type 99). */
  scrapOnly?: boolean;
  /** Hide for scrap vendors (type 99). */
  hideForScrapVendor?: boolean;
  disabled?: boolean;
};

export function buildVendorNavItems(
  activeKey: string,
  user?: ExternalVendorUser | null,
): NavItem[] {
  const resolvedUser = user ?? useAuthStore.getState().user;
  const primary = isPrimaryVendor(resolvedUser);
  const parentCounter = isParentCounter(resolvedUser);
  const scrapVendor = isScrapVendor(resolvedUser);

  const items: NavItem[] = [
    {
      key: TabNav.Home,
      label: 'Dashboard',
      icon: 'grid-outline',
      onPress: () => {
        navigate(StackNav.TabNav, {
          screen: TabNav.Home,
        });
        resetAndNavigate(StackNav.TabNav, 0);
      },
    },
    {
      key: StackNav.MyServiceRequests,
      label: 'My Service Requests',
      icon: 'document-text-outline',
      onPress: () => navigate(StackNav.MyServiceRequests),
      hideForScrapVendor: true,
    },
    {
      key: StackNav.CountersCollectionList,
      label: 'Counters Collection',
      icon: 'stats-chart-outline',
      onPress: () => navigate(StackNav.CountersCollectionList),
      parentCounterOnly: true,
      hideForScrapVendor: true,
    },
    {
      key: StackNav.CollectRequestList,
      label: 'Collection Requests',
      icon: 'list-circle-outline',
      onPress: () => {
        navigate(StackNav.CollectRequestList);
      },
      hideForParentCounter: true,
      hideForScrapVendor: true,
    },
    {
      key: StackNav.ScrapRequests,
      label: 'Scrap Requests',
      icon: 'cube-outline',
      onPress: () => navigate(StackNav.ScrapRequests),
      scrapOnly: true,
    },
    {
      key: StackNav.WasteRequests,
      label: 'Waste Requests',
      icon: 'trash-outline',
      onPress: () => navigate(StackNav.WasteRequests),
      scrapOnly: true,
    },
    {
      key: StackNav.CollectionRequest,
      label: 'New Collection Request',
      icon: 'list-circle-outline',
      onPress: () => {
        navigate(StackNav.CollectionRequest);
      },
      hideForParentCounter: true,
      hideForScrapVendor: true,
    },
    {
      key: StackNav.PaymentDetails,
      label: 'Payment Details',
      icon: 'wallet-outline',
      onPress: () => navigate(StackNav.PaymentDetails),
      primaryOnly: true,
      hideForScrapVendor: true,
    },
    {
      key: StackNav.MyCertificates,
      label: 'Certificates',
      icon: 'ribbon-outline',
      onPress: () => navigate(StackNav.MyCertificates),
      hideForScrapVendor: true,
    },
    {
      key: StackNav.MyRewards,
      label: 'Scratch & Win',
      icon: 'star-outline',
      onPress: () => navigate(StackNav.MyRewards),
      hideForScrapVendor: true,
    },
    {
      key: StackNav.ContactUs,
      label: 'Contact Us',
      icon: 'call-outline',
      onPress: () => navigate(StackNav.ContactUs),
    },
    {
      key: StackNav.PrivacyPolicy,
      label: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      onPress: () => navigate(StackNav.PrivacyPolicy),
    },
  ];

  return items.filter(item => {
    if (item.primaryOnly && !primary) {
      return false;
    }
    if (item.parentCounterOnly && !parentCounter) {
      return false;
    }
    if (item.hideForParentCounter && parentCounter) {
      return false;
    }
    if (item.hideForScrapVendor && scrapVendor) {
      return false;
    }
    if (item.scrapOnly && !scrapVendor) {
      return false;
    }
    return true;
  });
}
