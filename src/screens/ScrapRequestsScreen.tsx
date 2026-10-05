import {ScrapRequestCard} from '@/components/external/ScrapRequestCard';
import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import CustomText from '@/components/global/CustomText';
import {EmptyState} from '@/components/ui/EmptyState';
import {
  scrapCollectionId,
  isScrapRequestOwnedByUser,
  type ScrapRequestRow,
} from '@/api/scrapApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useScrapRequests, {
  useDeleteScrapRequest,
} from '@/hooks/vendor/use-scrap-requests';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {navigate, push} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import type {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import Ionicons from '@react-native-vector-icons/ionicons';

type Props = {
  route: RouteProp<
    {[StackNav.ScrapRequests]: {mode?: 'outlet'} | undefined},
    typeof StackNav.ScrapRequests
  >;
};

export default function ScrapRequestsScreen({route}: Props) {
  const isOutletMode = route.params?.mode === 'outlet';
  const {height: windowHeight} = useWindowDimensions();
  const {data, isLoading, refetch, isRefetching, error} = useScrapRequests();
  const deleteMutation = useDeleteScrapRequest();
  const rows = data ?? [];

  const emptyListMinHeight = Math.max(
    windowHeight - moderateScaleVertical(300),
    moderateScaleVertical(200),
  );

  const keyExtractor = useCallback(
    (item: ScrapRequestRow, index: number) =>
      scrapCollectionId(item) || String(index),
    [],
  );

  const handleDelete = useCallback(
    (item: ScrapRequestRow) => {
      const scrap_collection_id = scrapCollectionId(item);
      const vendor_id = String(item.vendor_id ?? '').trim();
      if (!scrap_collection_id || !vendor_id) {
        return;
      }
      Alert.alert(
        'Delete request',
        'Are you sure you want to delete this scrap collection request?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void deleteMutation.mutateAsync({
                scrap_collection_id,
                vendor_id,
              });
            },
          },
        ],
      );
    },
    [deleteMutation],
  );

  const openCreate = useCallback(() => {
    navigate(StackNav.CreateScrapRequest, {
      request: undefined,
      ...(isOutletMode ? {mode: 'outlet' as const} : {}),
    });
  }, [isOutletMode]);

  const renderItem: ListRenderItem<ScrapRequestRow> = useCallback(
    ({item}) => {
      const owned = isScrapRequestOwnedByUser(item);
      return (
        <ScrapRequestCard
          row={item}
          onComplete={
            isOutletMode
              ? undefined
              : () => push(StackNav.ProcessScrapRequest, {request: item})
          }
          onEdit={
            owned
              ? () =>
                  navigate(StackNav.CreateScrapRequest, {
                    request: item,
                    ...(isOutletMode ? {mode: 'outlet' as const} : {}),
                  })
              : undefined
          }
          onDelete={owned ? () => handleDelete(item) : undefined}
        />
      );
    },
    [handleDelete, isOutletMode],
  );

  const TrailingIcon = useCallback(
    () => (
      <Pressable
        onPress={openCreate}
        accessibilityLabel="New scrap collection request">
        <Ionicons name="add" size={moderateScale(24)} color={Colors.white} />
      </Pressable>
    ),
    [openCreate],
  );

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={[styles.emptyWrap, {minHeight: emptyListMinHeight}]}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.regular}
            style={styles.emptySub}>
            Loading scrap requests…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return (
        <View style={[styles.emptyWrap, {minHeight: emptyListMinHeight}]}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.regular}
            style={styles.errorText}>
            Could not load scrap requests.
          </CustomText>
        </View>
      );
    }
    return (
      <View style={[styles.emptyWrap, {minHeight: emptyListMinHeight}]}>
        <EmptyState
          icon="cube-outline"
          title="No scrap requests"
          subtitle={
            isOutletMode
              ? 'Tap + to create a scrap collection request'
              : 'Assigned scrap requests will appear here'
          }
        />
      </View>
    );
  }, [isLoading, error, emptyListMinHeight, isOutletMode]);

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar
        title="Scrap Requests"
        leading={isOutletMode ? 'back' : 'menu'}
        onLeadingPress={
          isOutletMode
            ? () => navigate(StackNav.TabNav, {screen: TabNav.Home})
            : undefined
        }
        trailing={<TrailingIcon />}
      />
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={!isLoading && !error ? rows : []}
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
  emptyWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
  },
  emptySub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: moderateScaleVertical(10),
  },
  errorText: {
    color: Colors.error,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
});
