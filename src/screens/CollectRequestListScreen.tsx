import CustomText from '@/components/global/CustomText';
import { CollectionRequestCard } from '@/components/external/CollectionRequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  collectionRequestId,
  type CollectionRequestRow,
} from '@/api/collectionApi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import useCollectionRequests from '@/hooks/vendor/use-collection-requests';
import { ExternalLayout } from '@/layouts/ExternalLayout';
import { StackNav, TabNav } from '@/navigations/NavigationKeys';
import { useAuthStore } from '@/states/authStore';
import { externalUi } from '@/styles/externalUi';
import { screen } from '@/styles/ui';
import { clearSession } from '@/utils/sessionStorage';
import { buildVendorNavItems } from '@/utils/vendorNavItems';
import { navigateToTab, push, resetAndNavigate } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function goToNewCollectRequest() {
  resetAndNavigate(StackNav.Main, 0);
  navigateToTab(TabNav.Collect);
}

export default function CollectRequestListScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching, error } = useCollectionRequests();
  const rows = data ?? [];
  const fabBottom = insets.bottom + moderateScaleVertical(16);

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  const navItems = buildVendorNavItems(StackNav.CollectRequestList);

  const keyExtractor = useCallback(
    (item: CollectionRequestRow, index: number) =>
      String(item.id ?? item.request_id ?? index),
    [],
  );

  const renderItem: ListRenderItem<CollectionRequestRow> = useCallback(({ item }) => {
    const id = collectionRequestId(item);
    return (
      <CollectionRequestCard
        row={item}
        onPress={id ? () => push(StackNav.CollectRequestDetail, { id }) : undefined}
      />
    );
  }, []);

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" style={[externalUi.muted, styles.emptySub]}>
            Loading requests…
          </CustomText>
        </View>
      );
    }
    if (!error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={externalUi.alertError}>
            <CustomText variant="h7" style={externalUi.alertErrorText}>
              Could not load collection requests...
            </CustomText>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={externalUi.card}>
          <EmptyState
            icon="cube-outline"
            title="No collection requests yet"
            subtitle="Create your first pickup request"
          />
          <Pressable onPress={goToNewCollectRequest} style={styles.emptyLinkWrap}>
            <CustomText variant="h7" style={externalUi.inlineLink}>
              Create your first request
            </CustomText>
          </Pressable>
        </View>
      </View>

    );
  }, [isLoading, error]);
  // !isLoading && !error ? rows :
  return (
    <ExternalLayout
      title="Collection history"
      activeKey={StackNav.CollectRequestList}
      navItems={navItems}
      onLogout={handleLogout}>
      <View style={styles.container}>
        <FlatList
          data={!isLoading && !error ? rows :[]}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={[screen.scroll, styles.listContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.brand}
            />
          }
        />

        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { bottom: fabBottom },
            pressed && styles.fabPressed,
          ]}
          onPress={goToNewCollectRequest}
          accessibilityRole="button"
          accessibilityLabel="New request">
          <LinearGradient
            colors={[Colors.brandDark, Colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}>
            <Ionicons name="add" size={22} color={Colors.white} />
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fabText}>
              New request
            </CustomText>
          </LinearGradient>
        </Pressable>
      </View>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  toolbar: {
    marginBottom: moderateScaleVertical(4),
  },
  listContent: {
    paddingBottom: moderateScaleVertical(100),
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(24),
    gap: moderateScaleVertical(12),
  },
  emptySub: {
    marginTop: moderateScaleVertical(4),
  },
  emptyLinkWrap: {
    alignItems: 'center',
    paddingBottom: moderateScaleVertical(20),
  },
  btnPressed: { opacity: 0.88 },
  fab: {
    position: 'absolute',
    right: moderateScale(16),
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: Colors.brandDark,
    shadowOffset: { width: 0, height: 6 },
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
    transform: [{ scale: 0.97 }],
  },
});
