import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {clearSession} from '@/utils/sessionStorage';
import {navigationRef, resetAndNavigate, navigateToTab} from '@/utils/NavigationUtils';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {CommonActions, useNavigationState} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';

function getTitle(routeName: string): string {
  switch (routeName) {
    case TabNav.Home:
      return 'Home';
    case TabNav.Services:
      return 'Our Services';
    case TabNav.Requests:
      return 'My Service Requests';
    case TabNav.Collect:
      return 'Collection Request';
    default:
      return 'Ecoil Vendor';
  }
}

function goToTab(name: string) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.navigate({
      name: StackNav.Main,
      params: {screen: name},
    }),
  );
}

type Props = {
  children: React.ReactNode;
};

export function VendorChrome({children}: Props) {
  const activeTab =
    useNavigationState(state => {
      const mainRoute = state?.routes?.find(r => r.name === StackNav.Main);
      const tabState = mainRoute?.state;
      if (!tabState || !('routes' in tabState)) {
        return TabNav.Home;
      }
      const idx = tabState.index ?? 0;
      return tabState.routes[idx]?.name ?? TabNav.Home;
    }) ?? TabNav.Home;

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  const user = useAuthStore(s => s.user);
  const navItems = useMemo(
    () => buildVendorNavItems(activeTab, user),
    [activeTab, user],
  );

  return (
    <ExternalLayout
      title={getTitle(activeTab)}
      activeKey={activeTab}
      navItems={navItems}
      onLogout={handleLogout}
      showBottomNav={false}>
      <View style={{flex: 1}}>{children}</View>
    </ExternalLayout>
  );
}
