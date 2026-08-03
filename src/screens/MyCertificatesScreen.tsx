import CustomText from '@/components/global/CustomText';
import {
  CertificateRowCard,
} from '@/components/external/CertificateRowCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CertificateRow } from '@/api/certificatesApi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import useCertificates from '@/hooks/vendor/use-certificates';
import { StackNav } from '@/navigations/NavigationKeys';
import { useAuthStore } from '@/states/authStore';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { clearSession } from '@/utils/sessionStorage';
import { buildVendorNavItems } from '@/utils/vendorNavItems';
import { resetAndNavigate } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';

export default function MyCertificatesScreen() {
  const user = useAuthStore(s => s.user);
  const { data, isLoading, refetch, isRefetching, error } = useCertificates();
  const rows = data ?? [];

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  const navItems = buildVendorNavItems(StackNav.MyCertificates, user);

  const keyExtractor = useCallback(
    (item: CertificateRow) => item.year_month_no || item.month_year,
    [],
  );

  const renderItem: ListRenderItem<CertificateRow> = useCallback(
    ({ item }) => <CertificateRowCard row={item} />,
    [],
  );

  const showTable = !isLoading && !error && rows.length > 0;

  return (

    <Container fullScreen statusBarStyle='light-content'>

      <AppBar title='Certificates' leading='menu' />
      <View style={styles.containerWrapper}>
        {isLoading ? (
          <View style={styles.emptyBody}>
            <ActivityIndicator size="large" color={Colors.brand} />
            <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
              Loading certificates…
            </CustomText>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.emptyBody}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.errorText}>
              {getApiErrorMessage(error, 'Could not load certificates')}
            </CustomText>
          </View>
        ) : null}

        {!isLoading && !error && rows.length === 0 ? (
          <View style={styles.emptyBody}>
            <EmptyState
              icon="ribbon-outline"
              title="No certificates"
              subtitle="Certificates will appear here when available."
            />
          </View>
        ) : null}

        {showTable ? (
          <FlatList
            data={rows}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={Colors.brand}
              />
            }
          />
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScaleVertical(12),
    paddingBottom: moderateScaleVertical(16),
  },
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
  },
  emptySub: {
    marginTop: moderateScaleVertical(12),
    color: Colors.muted,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
});
