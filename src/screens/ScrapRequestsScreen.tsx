import {CancelRequestModal} from '@/components/external/CancelRequestModal';
import {
  RequestListFilters,
  type AssignmentFilter,
  type StatusFilter,
} from '@/components/external/RequestListFilters';
import {ScrapRequestCard} from '@/components/external/ScrapRequestCard';
import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import CustomText from '@/components/global/CustomText';
import {EmptyState} from '@/components/ui/EmptyState';
import {
  scrapCollectionId,
  SCRAP_ASSIGN_MYSELF_ID,
  isScrapRequestCancelled,
  isScrapRequestCompleted,
  isScrapRequestOwnedByOutlet,
  isScrapRequestOwnedByUser,
  type ScrapAssignUser,
  type ScrapRequestRow,
} from '@/api/scrapApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import useScrapRequests, {
  useAssignScrapRequest,
  useCancelScrapRequest,
  useDeleteScrapRequest,
  useScrapAssignUsers,
} from '@/hooks/vendor/use-scrap-requests';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {screen} from '@/styles/ui';
import {navigate, push} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {
  hasScrapVendorAccess,
  isScrapVendor,
  isScrapVendorUser,
} from '@/utils/vendorUser';
import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
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

type AssignOption = {
  id: string;
  name: string;
  mobile?: string;
};

const MYSELF_OPTION: AssignOption = {
  id: SCRAP_ASSIGN_MYSELF_ID,
  name: 'My Self',
};

function assignOptionLabel(option: AssignOption): string {
  if (option.id === SCRAP_ASSIGN_MYSELF_ID) {
    return option.name;
  }
  return option.mobile ? `${option.name} (${option.mobile})` : option.name;
}

export default function ScrapRequestsScreen({route}: Props) {
  const isOutletMode = route.params?.mode === 'outlet';
  const user = useAuthStore(s => s.user);
  const scrapSideUser = hasScrapVendorAccess(user);
  const canAssignFromList = !isOutletMode && scrapSideUser && !isScrapVendorUser(user);
  const canCancelFromList = !isOutletMode && scrapSideUser;
  /** Oil outlet and scrap vendor (99) can create; scrap user (98) cannot. */
  const canCreateFromList = isOutletMode || isScrapVendor(user);
  const showListFilters = !isOutletMode && scrapSideUser;

  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const listFilters = useMemo(
    () => ({
      // Assignment filter only for scrap vendor (99); type 98 sees only assigned.
      assignment: canAssignFromList ? assignmentFilter : ('all' as const),
      request_status: showListFilters ? statusFilter : '',
    }),
    [assignmentFilter, canAssignFromList, showListFilters, statusFilter],
  );

  const {height: windowHeight} = useWindowDimensions();
  const {data, isLoading, refetch, isRefetching, error} =
    useScrapRequests(true, listFilters);
  const deleteMutation = useDeleteScrapRequest();
  const assignMutation = useAssignScrapRequest();
  const cancelMutation = useCancelScrapRequest();
  const assignUsersQuery = useScrapAssignUsers(canAssignFromList);
  const rows = data ?? [];

  const [assignTarget, setAssignTarget] = useState<ScrapRequestRow | null>(null);
  const assignModalOpen = assignTarget != null;
  const [cancelTarget, setCancelTarget] = useState<ScrapRequestRow | null>(null);
  const cancelModalOpen = cancelTarget != null;

  const assignOptions = useMemo<AssignOption[]>(() => {
    const users: ScrapAssignUser[] = assignUsersQuery.data ?? [];
    return [MYSELF_OPTION, ...users];
  }, [assignUsersQuery.data]);

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

  const openAssign = useCallback((item: ScrapRequestRow) => {
    setAssignTarget(item);
  }, []);

  const closeAssignModal = useCallback(() => {
    setAssignTarget(null);
  }, []);

  const openCancel = useCallback((item: ScrapRequestRow) => {
    setCancelTarget(item);
  }, []);

  const closeCancelModal = useCallback(() => {
    if (cancelMutation.isPending) {
      return;
    }
    setCancelTarget(null);
  }, [cancelMutation.isPending]);

  const handleCancelConfirm = useCallback(
    async (remark: string) => {
      if (!cancelTarget) {
        return;
      }
      const scrap_collection_id = scrapCollectionId(cancelTarget);
      if (!scrap_collection_id) {
        return;
      }
      try {
        await cancelMutation.mutateAsync({
          scrap_collection_id,
          cancel_remark: remark,
        });
        setCancelTarget(null);
      } catch {
        // Toast handled in mutation hook.
      }
    },
    [cancelMutation, cancelTarget],
  );

  const handleAssignToUser = useCallback(
    async (assignToUserId: string) => {
      if (!assignTarget) {
        return;
      }
      const scrap_collection_id = scrapCollectionId(assignTarget);
      if (!scrap_collection_id) {
        return;
      }
      try {
        await assignMutation.mutateAsync({
          scrap_collection_id,
          assign_to_user_id: assignToUserId,
        });
        closeAssignModal();
      } catch {
        // Toast handled in mutation hook.
      }
    },
    [assignTarget, assignMutation, closeAssignModal],
  );

  const renderAssignOption: ListRenderItem<AssignOption> = useCallback(
    ({item}) => (
      <Pressable
        style={({pressed}) => [styles.modalOption, pressed && styles.pressed]}
        onPress={() => void handleAssignToUser(item.id)}>
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.medium}
          style={styles.modalOptionText}>
          {assignOptionLabel(item)}
        </CustomText>
      </Pressable>
    ),
    [handleAssignToUser],
  );

  const assignKeyExtractor = useCallback((item: AssignOption) => item.id, []);

  const renderItem: ListRenderItem<ScrapRequestRow> = useCallback(
    ({item}) => {
      const cancelled = isScrapRequestCancelled(item);
      const completed = isScrapRequestCompleted(item);
      const owned = isOutletMode
        ? isScrapRequestOwnedByOutlet(item)
        : isScrapRequestOwnedByUser(item);
      const canEditDelete = owned && !cancelled && !completed;
      const showAssign =
        canAssignFromList &&
        !isScrapRequestOwnedByUser(item) &&
        !cancelled &&
        !completed;
      const showCancel = canCancelFromList && !cancelled && !completed;
      return (
        <ScrapRequestCard
          row={item}
          onComplete={
            isOutletMode || cancelled || completed
              ? undefined
              : () => push(StackNav.ProcessScrapRequest, {request: item})
          }
          onAssign={showAssign ? () => openAssign(item) : undefined}
          onCancel={showCancel ? () => openCancel(item) : undefined}
          showAssignee={canAssignFromList}
          maskCancelAsPending={isOutletMode}
          onEdit={
            canEditDelete
              ? () =>
                  navigate(StackNav.CreateScrapRequest, {
                    request: item,
                    ...(isOutletMode ? {mode: 'outlet' as const} : {}),
                  })
              : undefined
          }
          onDelete={canEditDelete ? () => handleDelete(item) : undefined}
        />
      );
    },
    [
      canAssignFromList,
      canCancelFromList,
      handleDelete,
      isOutletMode,
      openAssign,
      openCancel,
    ],
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
            canCreateFromList
              ? 'Tap + to create a scrap collection request'
              : 'Assigned scrap requests will appear here'
          }
        />
      </View>
    );
  }, [isLoading, error, emptyListMinHeight, canCreateFromList]);

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
        trailing={canCreateFromList ? <TrailingIcon /> : undefined}
      />
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={!isLoading && !error ? rows : []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={
            showListFilters ? (
              <RequestListFilters
                assignment={assignmentFilter}
                status={statusFilter}
                onAssignmentChange={setAssignmentFilter}
                onStatusChange={setStatusFilter}
                showAssignment={canAssignFromList}
              />
            ) : null
          }
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

      {canAssignFromList ? (
        <Modal
          visible={assignModalOpen}
          transparent
          animationType="slide"
          onRequestClose={closeAssignModal}>
          <Pressable style={styles.modalBackdrop} onPress={closeAssignModal}>
            <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
              <CustomText
                variant="h6"
                fontFamily={Fonts.montserrat.bold}
                style={styles.modalTitle}>
                Assign to user
              </CustomText>
              {assignUsersQuery.isLoading ? (
                <ActivityIndicator color={Colors.brand} style={styles.modalLoader} />
              ) : (
                <FlatList
                  data={assignOptions}
                  keyExtractor={assignKeyExtractor}
                  renderItem={renderAssignOption}
                  style={styles.modalList}
                  contentContainerStyle={styles.modalListContent}
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                />
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {canCancelFromList ? (
        <CancelRequestModal
          visible={cancelModalOpen}
          loading={cancelMutation.isPending}
          title="Cancel scrap request"
          onClose={closeCancelModal}
          onConfirm={handleCancelConfirm}
        />
      ) : null}
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
  pressed: {
    opacity: 0.92,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(16),
    paddingBottom: moderateScaleVertical(16),
    maxHeight: '75%',
  },
  modalTitle: {
    color: Colors.black,
    marginBottom: moderateScaleVertical(12),
  },
  modalList: {
    maxHeight: moderateScaleVertical(440),
  },
  modalListContent: {
    paddingBottom: moderateScaleVertical(12),
  },
  modalLoader: {
    marginVertical: moderateScaleVertical(20),
  },
  modalOption: {
    paddingVertical: moderateScaleVertical(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  modalOptionText: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
});
