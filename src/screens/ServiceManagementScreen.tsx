import CustomText from '@/components/global/CustomText';
import { PartnerCard } from '@/components/partners/PartnerCard';
import { ServiceDynamicForm } from '@/components/ServiceDynamicForm';
import { ServiceStepNav } from '@/components/service/ServiceStepNav';
import type { ServiceStep } from '@/components/service/ServiceStepNav';
import { ServiceIconImage } from '@/components/service/ServiceIconImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import {
  getPublicApiError,
  isServiceFormAvailable,
  type PublicService,
  type PublicSupplierDirectoryRow,
  type ServiceFormPayload,
} from '@/api/publicApi';
import publicService from '@/services/public-service';
import { useServiceNavigationStore } from '@/states/serviceNavigationStore';
import { useAuthStore } from '@/states/authStore';
import { useServiceFlowHeaderStore } from '@/states/serviceFlowHeaderStore';
import { TabNav } from '@/navigations/NavigationKeys';
import { screen } from '@/styles/ui';
import { serviceUi } from '@/styles/serviceUi';
import { navigateToTab } from '@/utils/NavigationUtils';
import { vendorUserCity } from '@/utils/vendorUser';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { useToastMessage } from '@/utils/useToastMessage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { externalUi } from '@/styles/externalUi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import LinearGradient from 'react-native-linear-gradient';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';

const REQUEST_DETAILS_TITLE = 'Request Details';

function PartnersEmptyState({
  serviceName,
  city,
}: {
  serviceName: string;
  city: string;
}) {
  return (
    <View style={styles.partnersEmpty}>
      <View style={styles.partnersEmptyIcon}>
        <Ionicons name="location" size={moderateScale(28)} color={Colors.accent} />
      </View>
      <CustomText
        variant="h6"
        fontFamily={Fonts.montserrat.bold}
        style={styles.partnersEmptyTitle}>
        No local partners yet
      </CustomText>
      <CustomText
        variant="h7"
        fontFamily={Fonts.montserrat.regular}
        style={styles.partnersEmptySub}>
        {`We could not find partners for ${serviceName} in ${city}. You can still apply through Ecoil above.`}
      </CustomText>
    </View>
  );
}

function OfficialEcoilCard({
  loading,
  onApply,
}: {
  loading: boolean;
  onApply: () => void;
}) {
  return (
    <View style={styles.officialCard}>
      <LinearGradient
        colors={['#FFF8F3', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.officialCardGlow}
      />
      <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.officialLabel}>
        OFFICIAL
      </CustomText>
      <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.officialTitle}>
        Apply through Ecoil
      </CustomText>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.officialSub}>
        Submit your application with Ecoil support & tracking
      </CustomText>
      <View style={styles.officialActions}>
        <Pressable
          style={({ pressed }) => [
            styles.applyBtnGreen,
            pressed && styles.pressed,
            loading && styles.serviceDisabled,
          ]}
          disabled={loading}
          onPress={onApply}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.applyText}>
            {loading ? '…' : 'Apply'}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}

function ServiceGridTile({
  service,
  loading,
  onPress,
}: {
  service: PublicService;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridTile,
        pressed && styles.pressed,
        loading && styles.serviceDisabled,
      ]}
      onPress={onPress}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.brand} style={styles.gridIconLoader} />
      ) : (
        <ServiceIconImage
          service={service}
          width={moderateScale(52)}
          height={moderateScale(56)}
          emptyIconSize={moderateScale(34)}
          borderRadius={moderateScale(8)}
        />
      )}
      <CustomText
        variant="h7"
        fontFamily={Fonts.montserrat.semiBold}
        style={styles.gridTileLabel}
        numberOfLine={3}>
        {service.name}
      </CustomText>
    </Pressable>
  );
}

function ServicesListHeader({
  count,
  isLoading,
  onRefresh,
  isRefreshing,
}: {
  count: number;
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <View>
      <ServiceStepNav step="list" />
      <View style={styles.listHeadRow}>
        <View style={styles.listHeadCopy}>
          <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.listHeadTitle}>
            Our services
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.listHeadSub}>
            {isLoading ? 'Loading services…' : `${count} service${count === 1 ? '' : 's'} available`}
          </CustomText>
        </View>
        <Pressable
          style={({ pressed }) => [serviceUi.refreshBtn, pressed && styles.pressed]}
          onPress={onRefresh}
          disabled={isRefreshing || isLoading}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={styles.refreshBtnText}>
            Refresh
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}

export default function ServiceManagementScreen() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const vendorCity = useMemo(() => vendorUserCity(user), [user]);
  const { toastSuccess } = useToastMessage();
  const [step, setStep] = useState<ServiceStep>('list');
  const [selected, setSelected] = useState<PublicService | null>(null);
  const [suppliers, setSuppliers] = useState<PublicSupplierDirectoryRow[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [form, setForm] = useState<ServiceFormPayload | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formLoadingId, setFormLoadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: services = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: [publicService.queryKeys.services],
    queryFn: () => publicService.getServices(),
  });

  const pendingServiceId = useServiceNavigationStore(s => s.pendingServiceId);
  const clearPendingService = useServiceNavigationStore(s => s.clearPendingService);

  const listData = !isLoading ? services : [];
  const isEmptyList = listData.length === 0;

  const { height: windowHeight } = useWindowDimensions();

  const loadingServiceName = useMemo(() => {
    if (!formLoadingId) {
      return '';
    }
    return services.find(s => s.id === formLoadingId)?.name ?? '';
  }, [formLoadingId, services]);

  const emptyAreaMinHeight = Math.max(
    windowHeight - moderateScaleVertical(300),
    moderateScaleVertical(280),
  );

  const partnersStatusMessage = useMemo(() => {
    if (suppliersLoading) {
      return 'Loading partners…';
    }
    if (!vendorCity) {
      return 'Add city in your profile to see local partners';
    }
    if (suppliers.length === 0) {
      return `No partners in ${vendorCity} for this service yet`;
    }
    return `${suppliers.length} partner${suppliers.length > 1 ? 's' : ''} in ${vendorCity}`;
  }, [suppliersLoading, vendorCity, suppliers.length]);

  const selectService = useCallback(async (service: PublicService) => {
    setSelected(service);
    setForm(null);
    setStep('suppliers');
    setSuppliersLoading(true);
    setError('');
    try {
      const rows = await publicService.getSuppliersByCity(vendorCity, service.id);
      setSuppliers(rows);
    } catch (err) {
      setSuppliers([]);
      setError(getPublicApiError(err, 'Could not load suppliers for your city.'));
    } finally {
      setSuppliersLoading(false);
    }
  }, [vendorCity]);

  useEffect(() => {
    if (!pendingServiceId || isLoading || services.length === 0) {
      return;
    }
    const service = services.find(s => s.id === pendingServiceId);
    clearPendingService();
    if (service) {
      void selectService(service);
    }
  }, [pendingServiceId, isLoading, services, clearPendingService, selectService]);

  async function openEcoilForm() {
    if (!selected) {
      return;
    }
    setError('');
    setFormLoading(true);
    setFormLoadingId(selected.id);
    try {
      const data = await publicService.getServiceForm(selected.id);
      if (!isServiceFormAvailable(data)) {
        Alert.alert(
          'Not available right now',
          `Sorry, you cannot apply for ${selected.name} right now. Please try again later.`,
        );
        return;
      }
      setForm(data);
      setStep('form');
    } catch {
      Alert.alert(
        'Not available right now',
        `Sorry, you cannot apply for ${selected.name} right now. Please try again later.`,
      );
    } finally {
      setFormLoading(false);
      setFormLoadingId(null);
    }
  }

  const setServiceHeader = useServiceFlowHeaderStore(s => s.setHeader);
  const clearServiceHeader = useServiceFlowHeaderStore(s => s.clearHeader);

  const resetToServiceList = useCallback(() => {
    setStep('list');
    setSelected(null);
    setForm(null);
    setSuppliers([]);
    setError('');
    setFormLoading(false);
    setFormLoadingId(null);
    clearServiceHeader();
  }, [clearServiceHeader]);

  const backToServices = useCallback(() => {
    resetToServiceList();
  }, [resetToServiceList]);

  const backToSuppliers = useCallback(() => {
    setStep('suppliers');
    setForm(null);
    setError('');
  }, []);

  useLayoutEffect(() => {
    if (step === 'suppliers' && selected) {
      setServiceHeader(REQUEST_DETAILS_TITLE, backToServices);
    } else if (step === 'form' && selected) {
      setServiceHeader(REQUEST_DETAILS_TITLE, backToSuppliers);
    } else {
      clearServiceHeader();
    }
  }, [step, selected, setServiceHeader, clearServiceHeader, backToServices, backToSuppliers]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetToServiceList();
      };
    }, [resetToServiceList]),
  );

  async function handleSubmit(answers: { questionId: string; value: string }[]) {
    if (!selected || !user) {
      return;
    }
    const mobile = String(user.mobile ?? '').replace(/\D/g, '');
    if (mobile.length < 10) {
      setError('Your profile mobile is missing. Sign in again.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await publicService.submitApplication(selected.id, {
        vendorName: user.name || 'Vendor',
        vendorMobile: user.mobile || mobile,
        answers,
      });
      await queryClient.invalidateQueries({
        queryKey: [publicService.queryKeys.myApplications],
      });
      toastSuccess('Application submitted successfully');
      backToServices();
      navigateToTab(TabNav.Requests);
    } catch (err) {
      setError(getPublicApiError(err, 'Could not submit application'));
    } finally {
      setSaving(false);
    }
  }

  const keyExtractor = useCallback((item: PublicService) => item.id, []);

  const renderItem: ListRenderItem<PublicService> = useCallback(
    ({ item }) => (
      <View style={styles.gridCell}>
        <ServiceGridTile
          service={item}
          loading={suppliersLoading && selected?.id === item.id}
          onPress={() => void selectService(item)}
        />
      </View>
    ),
    [suppliersLoading, selected?.id, selectService],
  );

  const listHeader = useCallback(
    () => (
      <View>
        {error ? <ErrorBanner message={error} /> : null}
        <ServicesListHeader
          count={services.length}
          isLoading={isLoading}
          onRefresh={() => void refetch()}
          isRefreshing={isRefetching}
        />
        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={styles.skeletonTileHalf} />
            ))}
          </View>
        ) : null}
      </View>
    ),
    [error, services.length, isLoading, isRefetching, refetch],
  );

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={[styles.emptyFill, { minHeight: emptyAreaMinHeight }]}>
        <EmptyState
          icon="grid-outline"
          title="No services available"
          subtitle="Pull down to refresh or tap Refresh"
        />
      </View>
    );
  }, [isLoading, emptyAreaMinHeight]);

  if (step === 'form' && form) {
    return (
      <Container fullScreen statusBarStyle='light-content'>

        <AppBar title='Request Details' />
        <ScrollView
          contentContainerStyle={screen.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {error ? <ErrorBanner message={error} /> : null}
          <ServiceStepNav step="form" />
          <ServiceDynamicForm
            form={form}
            user={user}
            saving={saving}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </Container>
    );
  }

  if (step === 'suppliers' && selected) {
    return (
      <Container fullScreen statusBarStyle='light-content'>
        <AppBar title='Request Details' />

        <ScrollView
          style={screen.pageBg}
          contentContainerStyle={[screen.scroll, styles.partnersScroll]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {error ? <ErrorBanner message={error} /> : null}
          <ServiceStepNav step="suppliers" />

          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.sectionEyebrow}>
            SERVICE PARTNERS
          </CustomText>

          <View style={styles.serviceHeadRow}>
            <CustomText
              variant="h5"
              fontFamily={Fonts.montserrat.bold}
              style={styles.serviceHeadTitle}
              numberOfLine={2}>
              {selected.name}
            </CustomText>
            {vendorCity ? (
              <View style={styles.cityPill}>
                <Ionicons name="location" size={moderateScale(14)} color={Colors.accent} />
                <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.cityPillText}>
                  {vendorCity}
                </CustomText>
              </View>
            ) : null}
          </View>

          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.partnersStatus}>
            {partnersStatusMessage}
          </CustomText>

          <OfficialEcoilCard
            loading={formLoading}
            onApply={() => void openEcoilForm()}
          />

          {suppliersLoading ? (
            <View style={styles.skeletonList}>
              <View style={[styles.skeleton, { height: moderateScaleVertical(148) }]} />
              <View style={[styles.skeleton, { height: moderateScaleVertical(148) }]} />
            </View>
          ) : null}

          {!suppliersLoading && suppliers.length > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <CustomText variant="h6" fontFamily={Fonts.montserrat.bold}>
                  Local partners
                </CustomText>
                <View style={styles.countBadge}>
                  <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.countText}>
                    {suppliers.length}
                  </CustomText>
                </View>
              </View>
              {suppliers.map(row => (
                <View key={row.id} style={styles.partnerGap}>
                  <PartnerCard row={row} />
                </View>
              ))}
            </>
          ) : null}

          {!suppliersLoading && suppliers.length === 0 && vendorCity ? (
            <PartnersEmptyState serviceName={selected.name} city={vendorCity} />
          ) : null}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container fullScreen statusBarStyle='light-content'>

      <AppBar title='Our Services' leading='menu' />

      <>
        <FlatList
          style={[styles.list, screen.pageBg]}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={[
            screen.scroll,
            styles.listContent,
            isEmptyList && !isLoading && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.brand}
            />
          }
        />

        <Modal
          visible={formLoading}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => { }}>
          <View style={externalUi.detailBackdrop}>
            <Pressable style={styles.loadingModalCard} onPress={e => e.stopPropagation()}>
              <ActivityIndicator size="large" color={Colors.brand} />
              <CustomText
                variant="h5"
                fontFamily={Fonts.inter.bold}
                style={styles.loadingModalTitle}>
                Opening application form
              </CustomText>
              {loadingServiceName ? (
                <CustomText variant="h7" style={styles.muted} numberOfLine={2}>
                  {loadingServiceName}
                </CustomText>
              ) : null}
            </Pressable>
          </View>
        </Modal>
      </>
    </Container>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { flexGrow: 1 },
  listContentEmpty: { flexGrow: 1 },
  emptyFill: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  listHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(16),
  },
  listHeadCopy: { flex: 1, minWidth: 0 },
  listHeadTitle: {
    color: Colors.black,
    fontSize: RFValue(16),
    marginBottom: moderateScaleVertical(4),
  },
  listHeadSub: {
    color: Colors.muted,
    fontSize: RFValue(11),
  },
  refreshBtnText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: moderateScaleVertical(12),
  },
  gridCell: {
    width: '48%',
  },
  gridTile: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    paddingVertical: moderateScaleVertical(18),
    paddingHorizontal: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScaleVertical(148),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gridTileLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
    textAlign: 'center',
    marginTop: moderateScaleVertical(12),
    lineHeight: RFValue(15),
  },
  gridEmptyIcon: {
    width: moderateScale(52),
    height: moderateScale(56),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconLoader: {
    height: moderateScaleVertical(56),
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: moderateScaleVertical(12),
    marginBottom: moderateScaleVertical(12),
  },
  skeletonTileHalf: {
    width: '48%',
    minHeight: moderateScaleVertical(148),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.line,
    opacity: 0.55,
  },
  serviceDisabled: { opacity: 0.65 },
  muted: { color: Colors.muted },
  skeletonList: { gap: moderateScaleVertical(10), marginBottom: moderateScaleVertical(12) },
  skeleton: {
    height: moderateScaleVertical(148),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.line,
    opacity: 0.55,
  },
  loadingModalCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScaleVertical(28),
    paddingHorizontal: moderateScale(28),
    alignItems: 'center',
    minWidth: moderateScale(260),
    maxWidth: '85%',
    gap: moderateScaleVertical(10),
  },
  loadingModalTitle: { color: Colors.black, textAlign: 'center' },
  partnersScroll: {
    flexGrow: 1,
  },
  sectionEyebrow: {
    color: Colors.muted,
    fontSize: RFValue(8),
    letterSpacing: 1.1,
    // marginBottom: moderateScaleVertical(8),
  },
  serviceHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  serviceHeadTitle: {
    flex: 1,
    color: Colors.black,
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    flexShrink: 0,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(7),
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  cityPillText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  partnersStatus: {
    color: Colors.muted,
    fontSize: RFValue(12),
    marginBottom: moderateScaleVertical(18),
  },
  officialCard: {
    backgroundColor: '#FFFBF5',
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    marginBottom: moderateScaleVertical(24),
    borderWidth: 1,
    borderColor: 'rgba(252,128,25,0.16)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  officialCardGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: moderateScale(20),
  },
  officialLabel: {
    color: Colors.accent,
    fontSize: RFValue(10),
    letterSpacing: 0.8,
    marginBottom: moderateScaleVertical(8),
  },
  officialTitle: {
    color: Colors.black,
    fontSize: RFValue(15),
    marginBottom: moderateScaleVertical(6),
  },
  officialSub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    marginBottom: moderateScaleVertical(14),
  },
  officialActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  applyBtnGreen: {
    paddingVertical: moderateScaleVertical(11),
    paddingHorizontal: moderateScale(28),
    borderRadius: 999,
    backgroundColor: Colors.buttonPrimary,
  },
  applyText: { color: Colors.white, fontSize: RFValue(12) },
  partnersEmpty: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(36),
    paddingHorizontal: moderateScale(12),
  },
  partnersEmptyIcon: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: '#FDF6E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(16),
  },
  partnersEmptyTitle: {
    color: Colors.black,
    fontSize: RFValue(15),
    textAlign: 'center',
    marginBottom: moderateScaleVertical(10),
  },
  partnersEmptySub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    textAlign: 'center',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.97 }] },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(12),
  },
  countBadge: {
    minWidth: moderateScale(22),
    height: moderateScale(22),
    borderRadius: 999,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(7),
  },
  countText: { color: Colors.brandDark, fontSize: RFValue(11) },
  partnerGap: { marginBottom: moderateScaleVertical(14) },
});
