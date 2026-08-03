import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import CustomText from '@/components/global/CustomText';
import {
  parseScrapCategories,
  scrapCollectionId,
  type ScrapRequestRow,
} from '@/api/scrapApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {
  useCreateScrapRequest,
  useLinkedScrapCategories,
  useLinkedScrapVendors,
  useUpdateScrapRequest,
} from '@/hooks/vendor/use-scrap-requests';
import {StackNav} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {serviceUi} from '@/styles/serviceUi';
import {navigate, resetToDrawerScreen} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {RouteProp} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import vendorService from '@/services/vendor-service';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  route: RouteProp<
    {[StackNav.CreateScrapRequest]: {request?: ScrapRequestRow} | undefined},
    typeof StackNav.CreateScrapRequest
  >;
};

function initialCategoryIds(request?: ScrapRequestRow): string[] {
  if (!request) {
    return [];
  }
  return parseScrapCategories(request).map(category => category.scrap_category_id);
}

function formStateFromRoute(request?: ScrapRequestRow) {
  return {
    vendorId: String(request?.vendor_id ?? '').trim(),
    selectedCategoryIds: initialCategoryIds(request),
  };
}

export default function CreateScrapRequestScreen({route}: Props) {
  const editRequest = route.params?.request;
  const isEdit = Boolean(editRequest);
  const queryClient = useQueryClient();

  const vendorsQuery = useLinkedScrapVendors();
  const categoriesQuery = useLinkedScrapCategories();
  const createMutation = useCreateScrapRequest();
  const updateMutation = useUpdateScrapRequest();

  const initialForm = formStateFromRoute(editRequest);
  const [vendorId, setVendorId] = useState(initialForm.vendorId);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialForm.selectedCategoryIds,
  );
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const editRequestKey = editRequest
    ? scrapCollectionId(editRequest) || 'edit'
    : 'new';

  // Drawer screen stays mounted — reset form and load options when opened.
  useFocusEffect(
    useCallback(() => {
      const request = route.params?.request;
      const next = formStateFromRoute(request);
      setVendorId(next.vendorId);
      setSelectedCategoryIds(next.selectedCategoryIds);
      setVendorModalOpen(false);
      setFormError('');

      void queryClient.fetchQuery({
        queryKey: [vendorService.queryKeys.linkedScrapVendors],
        queryFn: () => vendorService.getLinkedScrapVendors(),
        staleTime: 60_000,
      });
      void queryClient.fetchQuery({
        queryKey: [vendorService.queryKeys.linkedScrapCategories],
        queryFn: () => vendorService.getLinkedScrapCategories(),
        staleTime: 60_000,
      });
    }, [editRequestKey, queryClient, route.params?.request]),
  );

  const vendors = vendorsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadingOptions =
    vendorsQuery.isLoading ||
    vendorsQuery.isFetching ||
    categoriesQuery.isLoading ||
    categoriesQuery.isFetching;
  const submitting = createMutation.isPending || updateMutation.isPending;

  const selectedVendorLabel = useMemo(() => {
    const match = vendors.find(vendor => vendor.id === vendorId);
    return match?.firm_name ?? (vendorId ? vendorId : 'Select vendor');
  }, [vendorId, vendors]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  }, []);

  const handleBack = useCallback(() => {
    navigate(StackNav.ScrapRequests);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        handleBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBack,
      );
      return () => subscription.remove();
    }, [handleBack]),
  );

  const renderVendorOption: ListRenderItem<(typeof vendors)[number]> = useCallback(
    ({item}) => {
      const selected = item.id === vendorId;
      return (
        <Pressable
          style={({pressed}) => [
            styles.modalOption,
            selected && styles.modalOptionSelected,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            setVendorId(item.id);
            setVendorModalOpen(false);
          }}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.medium}
            style={selected ? styles.modalOptionTextSelected : styles.modalOptionText}>
            {item.firm_name}
          </CustomText>
        </Pressable>
      );
    },
    [vendorId],
  );

  const vendorKeyExtractor = useCallback(
    (item: (typeof vendors)[number]) => item.id,
    [],
  );

  async function handleSubmit() {
    setFormError('');

    if (!vendorId) {
      setFormError('Please select a vendor');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setFormError('Please select at least one scrap category');
      return;
    }

    try {
      if (isEdit && editRequest) {
        await updateMutation.mutateAsync({
          scrap_collection_id: scrapCollectionId(editRequest),
          vendor_id: vendorId,
          scrap_category_ids: selectedCategoryIds,
        });
      } else {
        await createMutation.mutateAsync({
          vendor_id: vendorId,
          scrap_category_ids: selectedCategoryIds,
        });
      }
      resetToDrawerScreen(StackNav.ScrapRequests);
    } catch {
      // Toast handled in mutation hooks.
    }
  }

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar
        title={isEdit ? 'Edit Scrap Request' : 'New Scrap Request'}
        leading="back"
        onLeadingPress={handleBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[screen.scroll, styles.content]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.medium}
            style={styles.fieldLabel}>
            Vendor
          </CustomText>
          <Pressable
            style={({pressed}) => [styles.vendorField, pressed && styles.pressed]}
            onPress={() => setVendorModalOpen(true)}
            disabled={loadingOptions}>
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.medium}
              style={vendorId ? styles.vendorValue : [styles.vendorValue, styles.vendorPlaceholder]}
              numberOfLine={2}>
              {selectedVendorLabel}
            </CustomText>
            <Ionicons
              name="chevron-down"
              size={moderateScale(18)}
              color={Colors.muted}
            />
          </Pressable>

          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.medium}
            style={[styles.fieldLabel, styles.categoryLabel]}>
            Scrap Categories
          </CustomText>

          {loadingOptions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.brand} />
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.regular}
                style={styles.loadingText}>
                Loading options…
              </CustomText>
            </View>
          ) : categories.length === 0 ? (
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.regular}
              style={styles.emptyCategories}>
              No scrap categories available.
            </CustomText>
          ) : (
            <View style={serviceUi.checkboxGroup}>
              {categories.map(category => {
                const checked = selectedCategoryIds.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    style={[
                      serviceUi.checkboxPill,
                      serviceUi.checkboxPillHalf,
                      checked && serviceUi.checkboxPillChecked,
                    ]}
                    onPress={() => toggleCategory(category.id)}>
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={moderateScale(18)}
                      color={checked ? Colors.brand : Colors.muted}
                    />
                    <CustomText
                      variant="h7"
                      fontFamily={Fonts.montserrat.semiBold}
                      style={
                        checked
                          ? serviceUi.checkboxPillTextChecked
                          : serviceUi.checkboxPillText
                      }>
                      {category.name}
                    </CustomText>
                  </Pressable>
                );
              })}
            </View>
          )}

          {formError ? (
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.medium}
              style={styles.errorText}>
              {formError}
            </CustomText>
          ) : null}

          <Pressable
            style={({pressed}) => [
              styles.submitBtn,
              (submitting || loadingOptions) && styles.submitBtnDisabled,
              pressed && !submitting && styles.pressed,
            ]}
            onPress={() => void handleSubmit()}
            disabled={submitting || loadingOptions}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.submitText}>
                {isEdit ? 'Update Request' : 'Submit Request'}
              </CustomText>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={vendorModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setVendorModalOpen(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setVendorModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <CustomText
              variant="h6"
              fontFamily={Fonts.montserrat.bold}
              style={styles.modalTitle}>
              Select vendor
            </CustomText>
            {vendorsQuery.isLoading ? (
              <ActivityIndicator color={Colors.brand} style={styles.modalLoader} />
            ) : vendors.length === 0 ? (
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.regular}
                style={styles.emptyCategories}>
                No linked vendors found.
              </CustomText>
            ) : (
              <FlatList
                data={vendors}
                keyExtractor={vendorKeyExtractor}
                renderItem={renderVendorOption}
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
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: moderateScaleVertical(88),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(16),
    gap: moderateScaleVertical(10),
  },
  fieldLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  categoryLabel: {
    marginTop: moderateScaleVertical(6),
  },
  vendorField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    backgroundColor: Colors.white,
    gap: moderateScale(8),
  },
  vendorValue: {
    color: Colors.black,
    flex: 1,
    fontSize: RFValue(12),
  },
  vendorPlaceholder: {
    color: Colors.placeHolderColor,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(16),
    gap: moderateScaleVertical(8),
  },
  loadingText: {
    color: Colors.muted,
    fontSize: RFValue(11),
  },
  emptyCategories: {
    color: Colors.muted,
    fontSize: RFValue(11),
    paddingVertical: moderateScaleVertical(8),
  },
  errorText: {
    color: Colors.error,
    fontSize: RFValue(11),
    marginTop: moderateScaleVertical(4),
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(12),
    minHeight: moderateScaleVertical(48),
    marginTop: moderateScaleVertical(8),
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: Colors.white,
    fontSize: RFValue(12),
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
});
