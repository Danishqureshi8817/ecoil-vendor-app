import CustomText from '@/components/global/CustomText';
import {
  CertificateRowCard,
  CertificateTableHeader,
  TABLE_MIN_WIDTH,
} from '@/components/external/CertificateRowCard';
import {EmptyState} from '@/components/ui/EmptyState';
import type {CertificateRow} from '@/api/certificatesApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useCertificates from '@/hooks/vendor/use-certificates';
import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {clearSession} from '@/utils/sessionStorage';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useCallback, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

export default function MyCertificatesScreen() {
  const user = useAuthStore(s => s.user);
  const {data, isLoading, refetch, isRefetching, error} = useCertificates();
  const rows = data ?? [];
  const headerScrollRef = useRef<ScrollView>(null);

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  const navItems = buildVendorNavItems(StackNav.MyCertificates, user);

  const handleBodyHorizontalScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      headerScrollRef.current?.scrollTo({x, animated: false});
    },
    [],
  );

  const keyExtractor = useCallback(
    (item: CertificateRow) => item.year_month_no || item.month_year,
    [],
  );

  const renderItem: ListRenderItem<CertificateRow> = useCallback(
    ({item}) => <CertificateRowCard row={item} />,
    [],
  );

  const showTable = !isLoading && !error && rows.length > 0;

  return (
    <ExternalLayout
      title="Certificates"
      activeKey={StackNav.MyCertificates}
      navItems={navItems}
      onLogout={handleLogout}
      headerHideAvatar
      headerCenterTitle>
      <View style={styles.container}>
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
          <View style={styles.tableWrap}>
            <View style={styles.tableCard}>
              <ScrollView
                ref={headerScrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                style={styles.headerScroll}>
                <CertificateTableHeader />
              </ScrollView>

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleBodyHorizontalScroll}
                scrollEventThrottle={16}
                style={styles.bodyScroll}
                contentContainerStyle={styles.bodyScrollContent}>
                <FlatList
                  data={rows}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefetching}
                      onRefresh={refetch}
                      tintColor={Colors.brand}
                    />
                  }
                />
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tableWrap: {
    flex: 1,
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScaleVertical(12),
    paddingBottom: moderateScaleVertical(16),
  },
  tableCard: {
    flex: 1,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  headerScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    zIndex: 2,
    backgroundColor: Colors.bg,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyScrollContent: {
    flexGrow: 1,
  },
  list: {
    width: TABLE_MIN_WIDTH,
    flex: 1,
  },
  listContent: {
    paddingBottom: moderateScaleVertical(8),
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
