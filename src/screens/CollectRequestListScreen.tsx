import CustomText from '@/components/global/CustomText';
import { CollectionRequestCard } from '@/components/external/CollectionRequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  collectionRequestId,
  collectionRequestLabel,
  collectionRequestStatus,
  type CollectionRequestRow,
} from '@/api/collectionApi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import useCollectionRequests from '@/hooks/vendor/use-collection-requests';
import { StackNav, TabNav } from '@/navigations/NavigationKeys';
import { screen } from '@/styles/ui';
import { navigate, navigateToTab, push, resetAndNavigate } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';

/** Exported so VendorChrome can use it for the header + button */
export function goToNewCollectRequest() {
  resetAndNavigate(StackNav.Main, 0);
  navigateToTab(TabNav.Collect);
}

function matchesSearch(row: CollectionRequestRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = [
    collectionRequestId(row),
    collectionRequestLabel(row),
    collectionRequestStatus(row),
    row.request_type_name,
    row.request_type,
    row.request_id,
    row.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function CollectRequestListScreen() {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { data, isLoading, refetch, isRefetching, error } = useCollectionRequests();
  const rows = data ?? [];

  const filteredRows = useMemo(
    () => rows.filter(row => matchesSearch(row, search)),
    [rows, search],
  );

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

  const listHeader = useCallback(
    () => (
      <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={searchFocused ? Colors.brand : Colors.muted}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search requests..."
          placeholderTextColor={Colors.placeHolderColor}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    ),
    [search, searchFocused],
  );

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
            Loading requests…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.errorText}>
            Could not load collection requests.
          </CustomText>
        </View>
      );
    }
    if (search.trim() && filteredRows.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="search-outline"
            title="No matching requests"
            subtitle="Try a different search term"
          />
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Pressable onPress={goToNewCollectRequest}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.emptyLink}>
            Create your first request
          </CustomText>
        </Pressable>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
          No collection requests yet.
        </CustomText>
      </View>
    );
  }, [isLoading, error, search, filteredRows.length]);

  const listData = !isLoading && !error ? filteredRows : [];

  const TrailingIcon = useCallback(() => {
    return (
      <Pressable onPress={() => {
        navigate(StackNav.CollectionRequest)
      }}>
        <Ionicons name="add" size={moderateScale(24)} color={Colors.white} />
      </Pressable>
    )
  }, []);

  return (
    <Container fullScreen statusBarStyle='light-content'>

      <AppBar title='Collection Requests' leading='menu' trailing={<TrailingIcon />} />
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          // ListHeaderComponent={listHeader}
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
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: moderateScaleVertical(88),
    flexGrow: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(14),
    minHeight: moderateScaleVertical(48),
    marginBottom: moderateScaleVertical(16),
  },
  searchRowFocused: {
    borderColor: Colors.brand,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(13),
    color: Colors.black,
    fontFamily: Fonts.montserrat.regular,
    paddingVertical: moderateScaleVertical(10),
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(48),
    paddingHorizontal: moderateScale(16),
  },
  emptyLink: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(13),
    textDecorationLine: 'underline',
    marginBottom: moderateScaleVertical(10),
  },
  emptySub: {
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
