import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {useServiceFlowHeaderStore} from '@/states/serviceFlowHeaderStore';
import {clearSession} from '@/utils/sessionStorage';
import {navigationRef, resetAndNavigate, navigateToTab} from '@/utils/NavigationUtils';
import {getGreeting} from '@/utils/homeMetrics';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {CommonActions, useNavigationState} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';

function getTitle(routeName: string): string {
  switch (routeName) {
    case TabNav.Home:
      return 'Dashboard';
    case TabNav.Services:
      return 'Our Services';
    case TabNav.Requests:
      return 'My Service Requests';
    case TabNav.Collect:
      return 'Collection requests';
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
  const serviceFlowHeader = useServiceFlowHeaderStore();
  const navItems = useMemo(
    () => buildVendorNavItems(activeTab, user),
    [activeTab, user],
  );

  const onHomeTab = activeTab === TabNav.Home;
  const onServicesTab = activeTab === TabNav.Services;
  const onRequestsTab = activeTab === TabNav.Requests;
  const useServiceBackHeader = onServicesTab && serviceFlowHeader.showBack;
  const centeredHeaderTab = onServicesTab || onRequestsTab;

  const shellTitle = useServiceBackHeader
    ? serviceFlowHeader.title
    : onHomeTab
      ? user?.firm_name?.trim() || user?.name?.trim() || 'Dashboard'
      : getTitle(activeTab);

  return (
    <ExternalLayout
      title={shellTitle}
      activeKey={activeTab}
      navItems={navItems}
      onLogout={handleLogout}
      showBottomNav={false}
      headerLeading={useServiceBackHeader ? 'back' : 'menu'}
      headerEyebrow={onHomeTab ? getGreeting() : undefined}
      headerHideAvatar={onHomeTab || centeredHeaderTab}
      headerCenterTitle={centeredHeaderTab}
      onHeaderLeadingPress={
        useServiceBackHeader && serviceFlowHeader.onBack
          ? serviceFlowHeader.onBack
          : undefined
      }>
      <View style={{flex: 1}}>{children}</View>
    </ExternalLayout>
  );
}
