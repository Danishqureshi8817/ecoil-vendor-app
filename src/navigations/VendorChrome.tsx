import { ExternalLayout } from '@/layouts/ExternalLayout';
import { StackNav, TabNav } from '@/navigations/NavigationKeys';
import { useAuthStore } from '@/states/authStore';
import { useServiceFlowHeaderStore } from '@/states/serviceFlowHeaderStore';
import { clearSession } from '@/utils/sessionStorage';
import { navigationRef, resetAndNavigate, navigateToTab } from '@/utils/NavigationUtils';
import { getGreeting } from '@/utils/homeMetrics';
import { buildVendorNavItems } from '@/utils/vendorNavItems';
import { goToNewCollectRequest } from '@/screens/CollectRequestListScreen';
import { Colors } from '@/constants/colors';
import { moderateScale } from '@/utils/responsiveSize';
import { CommonActions, useNavigationState } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

function getTitle(routeName: string): string {
  switch (routeName) {
    case TabNav.Home:
      return 'Dashboard';
    case TabNav.Services:
      return 'Our Services';
    case TabNav.Requests:
      return 'My Service Requests';
    case TabNav.Profile:
      return 'Profile';
    default:
      return 'Ecoil Vendor';
  }
}

function goToTab(name: string) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.navigate(StackNav.Main, {
      screen: StackNav.TabNav,
      params: { screen: name },
    }),
  );
}

type Props = {
  children: React.ReactNode;
};

export function VendorChrome({ children }: Props) {
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

  const addBtn = onRequestsTab ? (
    <TouchableOpacity
      onPress={goToNewCollectRequest}
      style={styles.addBtn}
      accessibilityLabel="New collection request"
      activeOpacity={0.85}>
      <Ionicons name="add" size={moderateScale(26)} color={Colors.drawerGradientEnd} />
    </TouchableOpacity>
  ) : undefined;

  const shellTitle = useServiceBackHeader
    ? serviceFlowHeader.title
    : onHomeTab
      ? user?.name?.trim() || user?.firm_name?.trim() || 'Dashboard'
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
      headerTrailing={addBtn}
      onHeaderLeadingPress={
        useServiceBackHeader && serviceFlowHeader.onBack
          ? serviceFlowHeader.onBack
          : undefined
      }>
      <View style={{ flex: 1 }}>{children}</View>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
