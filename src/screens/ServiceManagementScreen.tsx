import CustomText from '@/components/global/CustomText';
import {ServiceDynamicForm} from '@/components/ServiceDynamicForm';
import {ServiceStepNav} from '@/components/service/ServiceStepNav';
import {EmptyState} from '@/components/ui/EmptyState';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {
  getPublicApiError,
  isServiceFormAvailable,
  serviceAvatarColor,
  type PublicService,
  type ServiceFormPayload,
} from '@/api/publicApi';
import publicService from '@/services/public-service';
import {useAuthStore} from '@/states/authStore';
import {TabNav} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {serviceUi} from '@/styles/serviceUi';
import {navigateToTab} from '@/utils/NavigationUtils';
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
          Fill application form
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
  const {toastSuccess} = useToastMessage();
  const [step, setStep] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selected, setSelected] = useState<PublicService | null>(null);
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

  /** Space below step nav + search so empty state sits in the middle of the screen */
  const emptyAreaMinHeight = Math.max(
    windowHeight - moderateScaleVertical(300),
    moderateScaleVertical(280),
  );

  const contentContainerStyle = useMemo(
    () => [
      screen.scroll,
      styles.listContent,
      isEmptyList && !isLoading && styles.listContentEmpty,
    ],
    [isEmptyList, isLoading],
  );

  async function selectService(service: PublicService) {
    setError('');
    setFormLoading(true);
    setFormLoadingId(service.id);
    try {
      const data = await publicService.getServiceForm(service.id);
      if (!isServiceFormAvailable(data)) {
        Alert.alert(
          'Not available right now',
          `Sorry, you cannot apply for ${service.name} right now. Please try again later.`,
        );
        return;
      }
      setSelected(service);
      setForm(data);
      setStep('form');
    } catch {
      Alert.alert(
        'Not available right now',
        `Sorry, you cannot apply for ${service.name} right now. Please try again later.`,
      );
    } finally {
      setFormLoading(false);
      setFormLoadingId(null);
    }
  }

  function backToList() {
    setStep('list');
    setSelected(null);
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
      backToList();
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
        loading={formLoading && formLoadingId === item.id}
        onPress={() => selectService(item)}
      />
    ),
    [formLoading, formLoadingId],
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
          onBack={backToList}
        />
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
        contentContainerStyle={contentContainerStyle}
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
              Checking application form
            </CustomText>
            {loadingServiceName ? (
              <CustomText variant="h7" style={styles.muted} numberOfLine={2}>
                {loadingServiceName}
              </CustomText>
            ) : null}
            <CustomText variant="h7" style={styles.loadingModalSub}>
              Please wait…
            </CustomText>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyFill: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSeparator: {
    height: moderateScaleVertical(10),
  },
  serviceBody: {
    flex: 1,
    minWidth: 0,
  },
  muted: {color: Colors.muted},
  searchIcon: {marginRight: moderateScale(10)},
  serviceDisabled: {opacity: 0.65},
  skeletonList: {gap: moderateScaleVertical(10)},
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
  loadingModalTitle: {
    color: Colors.black,
    textAlign: 'center',
    marginTop: moderateScaleVertical(4),
  },
  loadingModalSub: {
    color: Colors.muted,
    textAlign: 'center',
  },
});
