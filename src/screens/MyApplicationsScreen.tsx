import CustomText from '@/components/global/CustomText';
import {ApplicationDetailModal} from '@/components/external/ApplicationDetailModal';
import {SecondaryButton} from '@/components/external/SecondaryButton';
import {EmptyState} from '@/components/ui/EmptyState';
import type {VendorApplicationDetail, VendorApplicationRow} from '@/api/publicApi';
import publicService from '@/services/public-service';
import {useAuthStore} from '@/states/authStore';
import {TabNav} from '@/navigations/NavigationKeys';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {externalUi} from '@/styles/externalUi';
import {screen} from '@/styles/ui';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {navigateToTab} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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

const TAB_BAR_HEIGHT = moderateScaleVertical(56);

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
          fontFamily={Fonts.inter.bold}
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
          {row.id.slice(0, 8)}…
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
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const mobile = user?.mobile?.trim() ?? '';
  const [detail, setDetail] = useState<VendorApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {data: rows = [], isLoading, refetch, isRefetching, error} = useQuery({
    queryKey: [publicService.queryKeys.myApplications, mobile],
    queryFn: () => publicService.getMyApplications(mobile),
    enabled: mobile.length > 0,
  });

  const fabBottom = insets.bottom  + moderateScaleVertical(0);
  const listData = !isLoading && !error && mobile ? rows : [];
  const isEmptyList = listData.length === 0;

  const contentContainerStyle = useMemo(
    () => [
      screen.scroll,
      styles.listContent,
      isEmptyList && styles.listContentEmpty,
    ],
    [isEmptyList],
  );

  async function openDetail(row: VendorApplicationRow) {
    if (!mobile) {
      return;
    }
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

  const keyExtractor = useCallback((item: VendorApplicationRow) => item.id, []);

  const renderItem: ListRenderItem<VendorApplicationRow> = useCallback(
    ({item}) => (
      <ApplicationListCard row={item} onViewDetails={() => openDetail(item)} />
    ),
    [mobile],
  );

  const listEmpty = useCallback(() => {
    if (!mobile) {
      return (
        <View style={externalUi.card}>
          <CustomText variant="h7" style={externalUi.alertErrorText}>
            Mobile number missing on your profile. Please sign in again.
          </CustomText>
        </View>
      );
    }
    if (isLoading) {
      return (
        <View style={styles.emptyInner}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" style={[externalUi.muted, styles.emptySub]}>
            Loading…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={externalUi.alertError}>
          <CustomText variant="h7" style={externalUi.alertErrorText}>
            {getApiErrorMessage(error, 'Could not load your applications')}
          </CustomText>
        </View>
      );
    }
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <EmptyState
          icon="alert-circle-outline"
          title="Oops!"
          subtitle="You have not submitted any applications yet."
        />
      </View>
    );
  }, [mobile, isLoading, error]);

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand}
            enabled={mobile.length > 0}
          />
        }
      />

      <Pressable
        style={({pressed}) => [styles.fab, {bottom: fabBottom}, pressed && styles.fabPressed]}
        onPress={() => navigateToTab(TabNav.Services)}
        accessibilityRole="button"
        accessibilityLabel="New service request">
        <LinearGradient
          colors={[Colors.brandDark, Colors.brand]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.fabGradient}>
          <Ionicons name="add" size={22} color={Colors.white} />
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fabText}>
            Service request
          </CustomText>
        </LinearGradient>
      </Pressable>

      <ApplicationDetailModal
        visible={detailLoading || detail != null}
        loading={detailLoading}
        detail={detail}
        submittedLabel={detail ? `Submitted ${formatDate(detail.createdAt)}` : undefined}
        onClose={() => setDetail(null)}
      />
    </View>
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
    paddingBottom: moderateScaleVertical(140),
    flexGrow: 1,
  },
  /** Only when empty — fills space so ListEmpty centers vertically */
  listContentEmpty: {
    // flexGrow: 1,
    justifyContent: 'center',
  },
  viewDetailsWrap: {
    marginTop: moderateScaleVertical(10),
  },
  emptyInner: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(24),
  },
  emptySub: {
    marginTop: moderateScaleVertical(12),
  },
  emptyLinkWrap: {
    alignItems: 'center',
    paddingBottom: moderateScaleVertical(8),
  },
  fab: {
    position: 'absolute',
    right: moderateScale(16),
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: Colors.brandDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: '72%',
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(18),
  },
  fabText: {
    color: Colors.white,
    flexShrink: 1,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{scale: 0.97}],
  },
});
