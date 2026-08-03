import CustomText from '@/components/global/CustomText';
import { ApplicationDetailModal } from '@/components/external/ApplicationDetailModal';
import { SecondaryButton } from '@/components/external/SecondaryButton';
import type { VendorApplicationDetail, VendorApplicationRow } from '@/api/publicApi';
import publicService from '@/services/public-service';
import { useAuthStore } from '@/states/authStore';
import { TabNav } from '@/navigations/NavigationKeys';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { externalUi } from '@/styles/externalUi';
import { serviceUi } from '@/styles/serviceUi';
import { screen } from '@/styles/ui';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { navigateToTab } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { ExternalLayout } from '@/layouts/ExternalLayout';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RequestsActionCard({
  isLoading,
  isRefreshing,
  onRefresh,
  onNewRequest,
}: {
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNewRequest: () => void;
}) {
  return (
    <View style={styles.actionCard}>
      <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.actionTitle}>
        My service requests
      </CustomText>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.actionSub}>
        Applications you have submitted for our services.
      </CustomText>
      <View style={styles.actionBtnRow}>
        <Pressable
          style={({ pressed }) => [serviceUi.refreshBtn, pressed && styles.pressed]}
          onPress={onRefresh}
          disabled={isRefreshing || isLoading}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.refreshText}>
            Refresh
          </CustomText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.newRequestBtn, pressed && styles.pressed]}
          onPress={onNewRequest}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.newRequestText}>
            + New service request
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}

function RequestsEmptyState({
  onBrowseServices,
  minHeight,
}: {
  onBrowseServices: () => void;
  minHeight: number;
}) {
  return (
    <View style={[styles.emptyWrapCentered, { minHeight }]}>
      <Pressable onPress={onBrowseServices} style={({ pressed }) => pressed && styles.pressed}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.browseLink}>
          Browse our services
        </CustomText>
      </Pressable>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptyMessage}>
        You have not submitted any applications yet.
      </CustomText>
    </View>
  );
}

function ApplicationListCard({
  row,
  onViewDetails,
}: {
  row: VendorApplicationRow;
  onViewDetails: () => void;
}) {
  return (
    <View style={externalUi.listCard}>
      <View style={externalUi.listCardHead}>
        <CustomText
          variant="h6"
          fontFamily={Fonts.montserrat.bold}
          style={externalUi.listCardTitle}
          numberOfLine={2}>
          {row.serviceName}
        </CustomText>
        <View style={externalUi.badge}>
          <CustomText variant="h7" style={externalUi.badgeText}>
            Submitted
          </CustomText>
        </View>
      </View>

      <View style={externalUi.metaRow}>
        <CustomText variant="h7" style={externalUi.metaDt}>
          Application ID
        </CustomText>
        <CustomText variant="h7" style={externalUi.metaDd}>
          {row.requestNo != null ? `SR-${row.requestNo}` : `${row.id.slice(0, 8)}…`}
        </CustomText>
      </View>
      <View style={externalUi.metaRow}>
        <CustomText variant="h7" style={externalUi.metaDt}>
          Submitted
        </CustomText>
        <CustomText variant="h7" style={externalUi.metaDd}>
          {formatDate(row.createdAt)}
        </CustomText>
      </View>

      <View style={styles.viewDetailsWrap}>
        <SecondaryButton label="View details" onPress={onViewDetails} />
      </View>
    </View>
  );
}

export default function MyApplicationsScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const user = useAuthStore(s => s.user);
  const mobile = user?.mobile?.trim() ?? '';
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<VendorApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: rows = [], isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: [publicService.queryKeys.myApplications, mobile],
    queryFn: () => publicService.getMyApplications(mobile),
    enabled: mobile.length > 0,
  });

  const listData = !isLoading && !error && mobile ? rows : [];
  const isEmptyList = listData.length === 0;

  const emptyListMinHeight = Math.max(
    windowHeight - moderateScaleVertical(300),
    moderateScaleVertical(200),
  );

  const goToServices = useCallback(() => {
    navigateToTab(TabNav.Services);
  }, []);

  async function openDetail(row: VendorApplicationRow) {
    if (!mobile) {
      return;
    }
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await publicService.getMyApplicationDetail(row.id, mobile);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetail(null);
    setDetailLoading(false);
  }

  const keyExtractor = useCallback((item: VendorApplicationRow) => item.id, []);

  const renderItem: ListRenderItem<VendorApplicationRow> = useCallback(
    ({ item }) => (
      <ApplicationListCard row={item} onViewDetails={() => void openDetail(item)} />
    ),
    [mobile],
  );

  const listHeader = useCallback(
    () => (
      <RequestsActionCard
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={() => void refetch()}
        onNewRequest={goToServices}
      />
    ),
    [isLoading, isRefetching, refetch, goToServices],
  );

  const listEmpty = useCallback(() => {
    if (!mobile) {
      return (
        <View style={styles.emptyWrap}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptyMessage}>
            Mobile number missing on your profile. Please sign in again.
          </CustomText>
        </View>
      );
    }
    if (isLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptyMessage}>
            Loading…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.errorText}>
            {getApiErrorMessage(error, 'Could not load your applications')}
          </CustomText>
        </View>
      );
    }
    return (
      <RequestsEmptyState onBrowseServices={goToServices} minHeight={emptyListMinHeight} />
    );
  }, [mobile, isLoading, error, goToServices, emptyListMinHeight]);

  const contentContainerStyle = useMemo(
    () => [
      screen.scroll,
      styles.listContent,
      isEmptyList && !isLoading && styles.listContentEmpty,
    ],
    [isEmptyList, isLoading],
  );

  return (
    <Container fullScreen statusBarStyle='light-content'>

      <AppBar title='My Service Requests' leading='menu' />

      <View style={styles.container}>
        <FlatList
          style={[styles.list, screen.pageBg]}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.brand}
              enabled={mobile.length > 0}
            />
          }
        />

        <ApplicationDetailModal
          visible={detailOpen}
          loading={detailLoading}
          detail={detail}
          submittedLabel={detail ? `Submitted ${formatDate(detail.createdAt)}` : undefined}
          onClose={closeDetail}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: moderateScaleVertical(88),
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    marginBottom: moderateScaleVertical(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  actionTitle: {
    color: Colors.black,
    fontSize: RFValue(16),
    marginBottom: moderateScaleVertical(6),
  },
  actionSub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    marginBottom: moderateScaleVertical(16),
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  refreshText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  newRequestBtn: {
    flex: 1,
    paddingVertical: moderateScaleVertical(11),
    paddingHorizontal: moderateScale(14),
    borderRadius: 999,
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRequestText: {
    color: Colors.white,
    fontSize: RFValue(11),
    textAlign: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(24),
  },
  emptyWrapCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
  },
  browseLink: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(13),
    textDecorationLine: 'underline',
    marginBottom: moderateScaleVertical(10),
  },
  emptyMessage: {
    color: Colors.muted,
    fontSize: RFValue(12),
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  errorText: {
    color: Colors.error,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
  viewDetailsWrap: {
    marginTop: moderateScaleVertical(10),
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
