import CustomText from '@/components/global/CustomText';
import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import {CounterCollectionCard} from '@/components/external/CounterCollectionCard';
import {KnparisesDatePickerField} from '@/components/global/KnparisesDatePickerField';
import {EmptyState} from '@/components/ui/EmptyState';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  fetchBranchCountersList,
  fetchCollectionByCounters,
  counterCollectionAddress,
  type BranchCounterOption,
  type CounterCollectionRow,
} from '@/api/reportsApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {screen} from '@/styles/ui';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {
  defaultCounterCollectionDateRange,
  parseKnparisesDate,
} from '@/utils/knparisesDate';
import {push} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {vendorDashboardParams} from '@/utils/vendorUser';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

const DEFAULT_BRANCH_ID = '0';

function branchOptionId(option: BranchCounterOption): string {
  return String(option.id);
}

function matchesAddressSearch(row: CounterCollectionRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return counterCollectionAddress(row).toLowerCase().includes(q);
}

export default function CounterCollectionListScreen() {
  const user = useAuthStore(s => s.user);
  const dashboardParams = useMemo(() => vendorDashboardParams(user), [user]);

  const defaultRange = useMemo(() => defaultCounterCollectionDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.date_from);
  const [dateUpto, setDateUpto] = useState(defaultRange.date_upto);
  const [selectedBranchId, setSelectedBranchId] = useState(DEFAULT_BRANCH_ID);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [rows, setRows] = useState<CounterCollectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  const dateFromValue = useMemo(() => parseKnparisesDate(dateFrom), [dateFrom]);
  const dateUptoValue = useMemo(() => parseKnparisesDate(dateUpto), [dateUpto]);

  const branchesQuery = useQuery({
    queryKey: [
      'branchCountersList',
      dashboardParams.user_id,
      dashboardParams.user_type,
      dashboardParams.vendor_id,
    ],
    queryFn: () => fetchBranchCountersList(dashboardParams),
    enabled:
      dashboardParams.user_id.length > 0 && dashboardParams.user_type.length > 0,
  });

  const branchOptions = useMemo<BranchCounterOption[]>(
    () => branchesQuery.data ?? [],
    [branchesQuery.data],
  );

  const selectedBranchLabel =
    branchOptions.find(option => branchOptionId(option) === selectedBranchId)?.label ??
    'All';

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCollectionByCounters({
        date_from: dateFrom,
        date_upto: dateUpto,
        request_by: selectedBranchId,
      });
      setRows(data);
      setHasFetched(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load counters collection'));
      setRows([]);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateUpto, selectedBranchId]);

  useEffect(() => {
    if (dashboardParams.user_id) {
      void loadCollections();
    }
    // Initial load only; Filter button refetches with updated values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardParams.user_id]);

  const renderBranchOption: ListRenderItem<BranchCounterOption> = useCallback(
    ({item: option}) => {
      const optionId = branchOptionId(option);
      const selected = optionId === selectedBranchId;
      return (
        <Pressable
          style={({pressed}) => [
            styles.modalOption,
            selected && styles.modalOptionSelected,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            setSelectedBranchId(optionId);
            setBranchModalOpen(false);
          }}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.medium}
            style={selected ? styles.modalOptionTextSelected : styles.modalOptionText}>
            {option.label}
          </CustomText>
        </Pressable>
      );
    },
    [selectedBranchId],
  );

  const branchKeyExtractor = useCallback(
    (option: BranchCounterOption) => branchOptionId(option),
    [],
  );

  const filteredRows = useMemo(
    () => rows.filter(row => matchesAddressSearch(row, search)),
    [rows, search],
  );

  const handleClear = () => {
    const range = defaultCounterCollectionDateRange();
    setDateFrom(range.date_from);
    setDateUpto(range.date_upto);
    setSelectedBranchId(DEFAULT_BRANCH_ID);
    setSearch('');
    setError('');
  };

  const keyExtractor = useCallback(
    (item: CounterCollectionRow, index: number) =>
      String(
        item.collection_request_id ??
          item.request_id ??
          item.id ??
          `${item.store_code ?? 'row'}-${index}`,
      ),
    [],
  );

  const renderItem: ListRenderItem<CounterCollectionRow> = useCallback(
    ({item}) => (
      <CounterCollectionCard
        row={item}
        onPress={() => push(StackNav.CountersCollectionDetail, {row: item})}
      />
    ),
    [],
  );

  const listHeader = useCallback(
    () => (
      <>
        <View style={styles.filterCard}>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.filterTitle}>
            Filters
          </CustomText>

          <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.fieldLabel}>
            Branch / Counter
          </CustomText>
          <Pressable
            style={({pressed}) => [styles.branchField, pressed && styles.pressed]}
            onPress={() => setBranchModalOpen(true)}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.branchValue}>
              {selectedBranchLabel}
            </CustomText>
            <Ionicons name="chevron-down" size={moderateScale(16)} color={Colors.muted} />
          </Pressable>

          <View style={styles.dateRow}>
            <KnparisesDatePickerField
              label="Date From"
              variant="outlined"
              value={dateFrom}
              onChange={setDateFrom}
              maximumDate={dateUptoValue ?? undefined}
            />
            <KnparisesDatePickerField
              label="Date Upto"
              variant="outlined"
              value={dateUpto}
              onChange={setDateUpto}
              minimumDate={dateFromValue ?? undefined}
            />
          </View>

          <View style={styles.filterActions}>
            <Pressable
              style={({pressed}) => [styles.filterBtn, styles.filterBtnPrimary, pressed && styles.pressed]}
              onPress={() => void loadCollections()}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.filterBtnPrimaryText}>
                  Filter
                </CustomText>
              )}
            </Pressable>
            <Pressable
              style={({pressed}) => [styles.filterBtn, styles.filterBtnClear, pressed && styles.pressed]}
              onPress={handleClear}>
              <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.filterBtnClearText}>
                Clear
              </CustomText>
            </Pressable>
          </View>
        </View>

        {/* <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
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
            placeholder="Filter by address"
            placeholderTextColor={Colors.placeHolderColor}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View> */}
      </>
    ),
    [
      dateFrom,
      dateUpto,
      dateFromValue,
      dateUptoValue,
      selectedBranchLabel,
      loading,
      search,
      searchFocused,
      loadCollections,
    ],
  );

  const listEmpty = useCallback(() => {
    if (loading && !hasFetched) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
            Loading counters collection…
          </CustomText>
        </View>
      );
    }
    if (search.trim() && filteredRows.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="search-outline"
            title="No matching records"
            subtitle="Try a different address filter"
          />
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
          No counters collection found for selected filters.
        </CustomText>
      </View>
    );
  }, [loading, hasFetched, search, filteredRows.length]);

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Counters Collection" leading="menu" />

      <View style={styles.container}>
        {error ? (
          <View style={styles.errorWrap}>
            <ErrorBanner message={error} />
          </View>
        ) : null}

        <FlatList
          style={styles.list}
          data={!loading || hasFetched ? filteredRows : []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={[screen.scroll, styles.listContent]}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={branchModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBranchModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBranchModalOpen(false)}>
          <View style={styles.modalSheet}>
            <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.modalTitle}>
              Branch / Counter
            </CustomText>
            {branchesQuery.isLoading ? (
              <ActivityIndicator color={Colors.brand} style={styles.modalLoader} />
            ) : (
              <FlatList
                data={branchOptions}
                keyExtractor={branchKeyExtractor}
                renderItem={renderBranchOption}
                style={styles.modalList}
                contentContainerStyle={styles.modalListContent}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              />
            )}
          </View>
        </Pressable>
      </Modal>
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
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: Colors.line,
    gap: moderateScaleVertical(10),
  },
  filterTitle: {
    color: Colors.black,
    fontSize: RFValue(14),
    marginBottom: moderateScaleVertical(4),
  },
  fieldLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  branchField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    backgroundColor: Colors.white,
  },
  branchValue: {
    color: Colors.black,
    flex: 1,
    fontSize: RFValue(12),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  filterActions: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(4),
  },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(10),
    paddingVertical: moderateScaleVertical(12),
  },
  filterBtnPrimary: {
    backgroundColor: Colors.buttonPrimary,
  },
  filterBtnPrimaryText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  filterBtnClear: {
    backgroundColor: '#F59E0B',
  },
  filterBtnClearText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(10),
    marginBottom: moderateScaleVertical(14),
  },
  searchRowFocused: {
    borderColor: Colors.brand,
  },
  searchInput: {
    flex: 1,
    color: Colors.black,
    fontFamily: Fonts.montserrat.regular,
    fontSize: RFValue(12),
    padding: 0,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: moderateScaleVertical(32),
    paddingHorizontal: moderateScale(16),
  },
  emptySub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    textAlign: 'center',
    marginTop: moderateScaleVertical(10),
  },
  errorWrap: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
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
  modalOptionSelected: {
    backgroundColor: Colors.brandSoft,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(8),
  },
  modalOptionText: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
  modalOptionTextSelected: {
    color: Colors.brand,
    fontSize: RFValue(12),
  },
  pressed: {
    opacity: 0.92,
  },
});
