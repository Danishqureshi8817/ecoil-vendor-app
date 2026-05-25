import CustomText from '@/components/global/CustomText';
import {CertificateRowCard} from '@/components/external/CertificateRowCard';
import {EmptyState} from '@/components/ui/EmptyState';
import type {CertificateRow} from '@/api/certificatesApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useCertificates from '@/hooks/vendor/use-certificates';
import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {externalUi} from '@/styles/externalUi';
import {screen} from '@/styles/ui';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {clearSession} from '@/utils/sessionStorage';
import {navigateToTab, push, resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

export default function MyCertificatesScreen() {
  const {data, isLoading, refetch, isRefetching, error} = useCertificates();
  const rows = data ?? [];

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  const navItems = [
    {
      key: TabNav.Home,
      label: 'Home',
      icon: 'home-outline' as const,
      onPress: () => resetAndNavigate(StackNav.Main, 0),
    },
    {
      key: TabNav.Services,
      label: 'Our Services',
      icon: 'grid-outline' as const,
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Services);
      },
    },
    {
      key: TabNav.Requests,
      label: 'My Service Requests',
      icon: 'document-text-outline' as const,
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Requests);
      },
    },
    {
      key: TabNav.Collect,
      label: 'Collect Request',
      icon: 'cube-outline' as const,
      onPress: () => {
        resetAndNavigate(StackNav.Main, 0);
        navigateToTab(TabNav.Collect);
      },
    },
    {
      key: StackNav.CollectRequestList,
      label: 'Collect Request List',
      icon: 'list-outline' as const,
      onPress: () => push(StackNav.CollectRequestList),
    },
    {
      key: StackNav.MyCertificates,
      label: 'My Certificates',
      icon: 'ribbon-outline' as const,
      onPress: () => {},
    },
  ];

  const keyExtractor = useCallback(
    (item: CertificateRow) => item.year_month_no || item.month_year,
    [],
  );

  const renderItem: ListRenderItem<CertificateRow> = useCallback(
    ({item}) => <CertificateRowCard row={item} />,
    [],
  );

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" style={[externalUi.muted, styles.emptySub]}>
            Loading certificates…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={externalUi.alertError}>
          <CustomText variant="h7" style={externalUi.alertErrorText}>
            {getApiErrorMessage(error, 'Could not load certificates')}
          </CustomText>
        </View>
      );
    }
    return (
      <EmptyState
        icon="ribbon-outline"
        title="No certificates"
        subtitle="Certificates will appear here when available."
      />
    );
  }, [isLoading, error]);

  return (
    <ExternalLayout
      title="My Certificates"
      activeKey={StackNav.MyCertificates}
      navItems={navItems}
      onLogout={handleLogout}>
      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <CustomText variant="h5" fontFamily={Fonts.inter.bold}>
              Download Certificates
            </CustomText>
            <CustomText variant="h7" style={externalUi.muted}>
              Each row has the certificate name and a download button
            </CustomText>
          </View>
        }
        ListEmptyComponent={listEmpty}
        contentContainerStyle={[screen.scroll, styles.listContent]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand}
          />
        }
      />
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  list: {flex: 1},
  listContent: {
    paddingBottom: moderateScaleVertical(24),
    flexGrow: 1,
  },
  header: {
    marginBottom: moderateScaleVertical(14),
    gap: moderateScaleVertical(4),
  },
  separator: {height: moderateScaleVertical(10)},
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(40),
  },
  emptySub: {marginTop: moderateScaleVertical(12)},
});
