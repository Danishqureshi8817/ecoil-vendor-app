import {WasteRequestCard} from '@/components/external/WasteRequestCard';
import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import CustomText from '@/components/global/CustomText';
import {EmptyState} from '@/components/ui/EmptyState';
import {
  wasteCollectionId,
  isWasteRequestOwnedByUser,
  type WasteRequestRow,
} from '@/api/wasteApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useWasteRequests, {
  useDeleteWasteRequest,
} from '@/hooks/vendor/use-waste-requests';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {navigate, push} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {useRoute} from '@react-navigation/native';
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

export default function WasteRequestsScreen() {
  const {height: windowHeight} = useWindowDimensions();
  const {data, isLoading, refetch, isRefetching, error} = useWasteRequests();
  const deleteMutation = useDeleteWasteRequest();
  const rows = data ?? [];

  const emptyListMinHeight = Math.max(
    windowHeight - moderateScaleVertical(300),
    moderateScaleVertical(200),
  );

  const keyExtractor = useCallback(
    (item: WasteRequestRow, index: number) =>
      wasteCollectionId(item) || String(index),
    [],
  );

  const handleDelete = useCallback(
    (item: WasteRequestRow) => {
      const waste_collection_id = wasteCollectionId(item);
      const vendor_id = String(item.vendor_id ?? '').trim();
      if (!waste_collection_id || !vendor_id) {
        return;
      }
      Alert.alert(
        'Delete request',
        'Are you sure you want to delete this waste collection request?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void deleteMutation.mutateAsync({
                waste_collection_id,
                vendor_id,
              });
            },
          },
        ],
      );
    },
    [deleteMutation],
  );

  const renderItem: ListRenderItem<WasteRequestRow> = useCallback(({item}) => {
    const owned = isWasteRequestOwnedByUser(item);
    return (
      <WasteRequestCard
        row={item}
        onComplete={() => push(StackNav.ProcessWasteRequest, {request: item})}
        onEdit={
          owned
            ? () => navigate(StackNav.CreateWasteRequest, {request: item})
            : undefined
        }
        onDelete={owned ? () => handleDelete(item) : undefined}
      />
    );
  }, [handleDelete]);

  const TrailingIcon = useCallback(
    () => (
      <Pressable
        onPress={() => navigate(StackNav.CreateWasteRequest, {request: undefined})}
        accessibilityLabel="New waste collection request">
        <Ionicons name="add" size={moderateScale(24)} color={Colors.white} />
      </Pressable>
    ),
    [],
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
            Loading Waste Requests…
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
            Could not load Waste Requests.
          </CustomText>
        </View>
      );
    }
    return (
      <View style={[styles.emptyWrap, {minHeight: emptyListMinHeight}]}>
        <EmptyState
          icon="trash-outline"
          title="No Waste Requests"
          subtitle="Assigned Waste Requests will appear here"
        />
      </View>
    );
  }, [isLoading, error, emptyListMinHeight]);

  const route = useRoute();
  const nestedInTab = route.name === 'Waste' || route.name === TabNav.Waste;

  return (
    <Container
      fullScreen={!nestedInTab}
      statusBarStyle={nestedInTab ? 'dark-content' : 'light-content'}>
      {!nestedInTab ? (
        <AppBar
          title="Waste Requests"
          leading="back"
          trailing={<TrailingIcon />}
        />
      ) : (
        <View style={styles.tabToolbar}>
          <TrailingIcon />
        </View>
      )}
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
  tabToolbar: {
    alignItems: 'flex-end',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
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
