import CustomText from '@/components/global/CustomText';
import {PartnerCard} from '@/components/partners/PartnerCard';
import {ServiceDynamicForm} from '@/components/ServiceDynamicForm';
import {ServiceStepNav, type ServiceStep} from '@/components/service/ServiceStepNav';
import {EmptyState} from '@/components/ui/EmptyState';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  getPublicApiError,
  isServiceFormAvailable,
  serviceAvatarColor,
  type PublicService,
  type PublicSupplierDirectoryRow,
  type ServiceFormPayload,
} from '@/api/publicApi';
import publicService from '@/services/public-service';
import {useAuthStore} from '@/states/authStore';
import {TabNav} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {serviceUi} from '@/styles/serviceUi';
import {navigateToTab} from '@/utils/NavigationUtils';
import {vendorUserCity} from '@/utils/vendorUser';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {useToastMessage} from '@/utils/useToastMessage';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useMemo, useState} from 'react';
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
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {externalUi} from '@/styles/externalUi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import LinearGradient from 'react-native-linear-gradient';

function ServiceListItem({
  service,
  loading,
  onPress,
}: {
  service: PublicService;
  loading: boolean;
  onPress: () => void;
}) {
  const letter = (service.name.trim()[0] || 'S').toUpperCase();

  return (
    <Pressable
      style={({pressed}) => [
        serviceUi.serviceCard,
        pressed && serviceUi.serviceCardPressed,
        loading && styles.serviceDisabled,
      ]}
      onPress={onPress}
      disabled={loading}>
      <View
        style={[
          serviceUi.serviceAvatar,
          {backgroundColor: serviceAvatarColor(service.name)},
        ]}>
        <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={{color: Colors.white}}>
          {letter}
        </CustomText>
      </View>
      <View style={styles.serviceBody}>
        <CustomText variant="h6" fontFamily={Fonts.inter.bold} numberOfLine={1}>
          {service.name}
        </CustomText>
        <CustomText variant="h7" style={serviceUi.serviceMeta}>
          View local partners
        </CustomText>
      </View>
      <View style={serviceUi.serviceChevron}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.brand} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={Colors.brand} />
        )}
      </View>
    </Pressable>
  );
}

export default function ServiceManagementScreen() {
  const user = useAuthStore(s => s.user);
  const vendorCity = useMemo(() => vendorUserCity(user), [user]);
  const {toastSuccess} = useToastMessage();
  const [step, setStep] = useState<ServiceStep>('list');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selected, setSelected] = useState<PublicService | null>(null);
  const [suppliers, setSuppliers] = useState<PublicSupplierDirectoryRow[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [form, setForm] = useState<ServiceFormPayload | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formLoadingId, setFormLoadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {data: services = [], isLoading, refetch, isRefetching} = useQuery({
    queryKey: [publicService.queryKeys.services],
    queryFn: () => publicService.getServices(),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return services;
    }
    return services.filter(s => s.name.toLowerCase().includes(q));
  }, [services, search]);

  const {height: windowHeight} = useWindowDimensions();
  const listData = !isLoading ? filtered : [];
  const isEmptyList = listData.length === 0;

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

  const supplierCountLabel = suppliersLoading
    ? 'Loading suppliers…'
    : !vendorCity
      ? 'Add city in your profile to see local partners'
      : suppliers.length === 0
        ? `No partners in ${vendorCity} for this service yet`
        : `${suppliers.length} partner${suppliers.length > 1 ? 's' : ''} in ${vendorCity}`;

  async function loadSuppliersForService(service: PublicService) {
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
  }

  async function selectService(service: PublicService) {
    setSelected(service);
    setForm(null);
    setStep('suppliers');
    await loadSuppliersForService(service);
  }

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

  function backToServices() {
    setStep('list');
    setSelected(null);
    setForm(null);
    setSuppliers([]);
    setError('');
  }

  function backToSuppliers() {
    setStep('suppliers');
    setForm(null);
    setError('');
  }

  async function handleSubmit(answers: {questionId: string; value: string}[]) {
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
    ({item}) => (
      <ServiceListItem
        service={item}
        loading={suppliersLoading && selected?.id === item.id}
        onPress={() => void selectService(item)}
      />
    ),
    [suppliersLoading, selected?.id],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );

  const listHeader = useCallback(
    () => (
      <View>
        <ServiceStepNav step={step} />
        {error ? <ErrorBanner message={error} /> : null}
        <View
          style={[serviceUi.searchRow, searchFocused && serviceUi.searchRowFocused]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={searchFocused ? Colors.brand : Colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={serviceUi.searchInput}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search services…"
            placeholderTextColor={Colors.placeHolderColor}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {isLoading && (
          <View style={styles.skeletonList}>
            <View style={styles.skeleton} />
            <View style={styles.skeleton} />
            <View style={styles.skeleton} />
          </View>
        )}
      </View>
    ),
    [step, error, search, searchFocused, isLoading],
  );

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={[styles.emptyFill, {minHeight: emptyAreaMinHeight}]}>
        <EmptyState
          icon="search-outline"
          title="No services found"
          subtitle="Try a different search or pull down to refresh"
        />
      </View>
    );
  }, [isLoading, emptyAreaMinHeight]);

  if (step === 'form' && form) {
    return (
      <ScrollView
        contentContainerStyle={screen.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ServiceStepNav step={step} />
        {error ? <ErrorBanner message={error} /> : null}
        <ServiceDynamicForm
          form={form}
          user={user}
          saving={saving}
          onSubmit={handleSubmit}
          onBack={backToSuppliers}
        />
      </ScrollView>
    );
  }

  if (step === 'suppliers' && selected) {
    return (
      <ScrollView
        contentContainerStyle={screen.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ServiceStepNav step={step} />

        <Pressable onPress={backToServices} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color={Colors.brandDark} />
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.backText}>
            Back to services
          </CustomText>
        </Pressable>

        {error ? <ErrorBanner message={error} /> : null}

        <View style={styles.hero}>
          <CustomText variant="h7" style={styles.eyebrow}>
            SERVICE PARTNERS
          </CustomText>
          <CustomText variant="h4" fontFamily={Fonts.inter.bold}>
            {selected.name}
          </CustomText>
          {vendorCity ? (
            <View style={styles.cityPill}>
              <Ionicons name="location-outline" size={14} color={Colors.accent} />
              <CustomText variant="h7" fontFamily={Fonts.inter.bold}>
                {vendorCity}
              </CustomText>
            </View>
          ) : null}
          <CustomText variant="h7" style={styles.muted}>
            {supplierCountLabel}
          </CustomText>
        </View>

        <View style={styles.ecoilBanner}>
          <View style={styles.ecoilCopy}>
            <View style={styles.officialTag}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.officialText}>
                OFFICIAL
              </CustomText>
            </View>
            <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
              Apply through Ecoil
            </CustomText>
            <CustomText variant="h7" style={styles.muted}>
              Submit your application with Ecoil support & tracking
            </CustomText>
          </View>
          <Pressable
            style={({pressed}) => [pressed && styles.pressed]}
            disabled={formLoading}
            onPress={() => void openEcoilForm()}>
            <LinearGradient
              colors={['#e6730f', Colors.accent]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.applyBtn}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.applyText}>
                {formLoading ? '…' : 'Apply'}
              </CustomText>
            </LinearGradient>
          </Pressable>
        </View>

        {suppliersLoading ? (
          <View style={styles.skeletonList}>
            <View style={[styles.skeleton, {height: moderateScaleVertical(148)}]} />
            <View style={[styles.skeleton, {height: moderateScaleVertical(148)}]} />
          </View>
        ) : null}

        {!suppliersLoading && suppliers.length > 0 ? (
          <>
            <View style={styles.sectionHead}>
              <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
                Local partners
              </CustomText>
              <View style={styles.countBadge}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.countText}>
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
          <EmptyState
            icon="location-outline"
            title="No local partners yet"
            subtitle={`You can still apply through Ecoil above.`}
          />
        ) : null}
      </ScrollView>
    );
  }

  return (
    <>
      <FlatList
        style={styles.list}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
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
        onRequestClose={() => {}}>
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
  );
}

const styles = StyleSheet.create({
  list: {flex: 1},
  listContent: {flexGrow: 1},
  listContentEmpty: {flexGrow: 1},
  emptyFill: {flexGrow: 1, justifyContent: 'center', alignItems: 'center'},
  itemSeparator: {height: moderateScaleVertical(10)},
  serviceBody: {flex: 1, minWidth: 0},
  muted: {color: Colors.muted},
  searchIcon: {marginRight: moderateScale(10)},
  serviceDisabled: {opacity: 0.65},
  skeletonList: {gap: moderateScaleVertical(10), marginBottom: moderateScaleVertical(12)},
  skeleton: {
    height: moderateScaleVertical(76),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.line,
    opacity: 0.6,
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
  loadingModalTitle: {color: Colors.black, textAlign: 'center'},
  backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: moderateScaleVertical(12)},
  backText: {color: Colors.brandDark},
  hero: {marginBottom: moderateScaleVertical(14)},
  eyebrow: {
    color: Colors.muted,
    letterSpacing: 0.8,
    fontSize: moderateScale(11),
    marginBottom: 4,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  ecoilBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    padding: moderateScale(16),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(252,128,25,0.28)',
    marginBottom: moderateScaleVertical(16),
  },
  ecoilCopy: {flex: 1, minWidth: 0},
  officialTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(6),
    marginBottom: moderateScaleVertical(6),
  },
  officialText: {color: Colors.white, fontSize: moderateScale(10)},
  applyBtn: {
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(18),
    borderRadius: moderateScale(14),
  },
  applyText: {color: Colors.white},
  pressed: {opacity: 0.92, transform: [{scale: 0.97}]},
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
  countText: {color: Colors.brandDark, fontSize: moderateScale(12)},
  partnerGap: {marginBottom: moderateScaleVertical(14)},
});
