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
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

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

  return (
    <ScrollView
      contentContainerStyle={screen.scroll}
      refreshControl={
        step === 'list' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.brand} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <ServiceStepNav step={step} />

      {error ? <ErrorBanner message={error} /> : null}

      {step === 'list' && (
        <>
          <View
            style={[
              serviceUi.searchRow,
              searchFocused && serviceUi.searchRowFocused,
            ]}>
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

          {!isLoading && filtered.length === 0 && (
            <EmptyState
              icon="search-outline"
              title="No services found"
              subtitle="Try a different search or pull down to refresh"
            />
          )}

          {!isLoading && filtered.length > 0 && (
            <View style={serviceUi.serviceList}>
              {filtered.map(s => {
                const letter = (s.name.trim()[0] || 'S').toUpperCase();
                const loadingThis = formLoading && formLoadingId === s.id;
                return (
                  <Pressable
                    key={s.id}
                    style={({pressed}) => [
                      serviceUi.serviceCard,
                      pressed && serviceUi.serviceCardPressed,
                      loadingThis && styles.serviceDisabled,
                    ]}
                    onPress={() => selectService(s)}
                    disabled={formLoading}>
                    <View
                      style={[
                        serviceUi.serviceAvatar,
                        {backgroundColor: serviceAvatarColor(s.name)},
                      ]}>
                      <CustomText
                        variant="h5"
                        fontFamily={Fonts.inter.bold}
                        style={{color: Colors.white}}>
                        {letter}
                      </CustomText>
                    </View>
                    <View style={{flex: 1, minWidth: 0}}>
                      <CustomText variant="h6" fontFamily={Fonts.inter.bold} numberOfLine={1}>
                        {s.name}
                      </CustomText>
                      <CustomText variant="h7" style={serviceUi.serviceMeta}>
                        Fill application form
                      </CustomText>
                    </View>
                    <View style={serviceUi.serviceChevron}>
                      {loadingThis ? (
                        <ActivityIndicator size="small" color={Colors.brand} />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color={Colors.brand} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      )}

      {formLoading && step === 'list' && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={Colors.brand} />
          <CustomText variant="h7" style={styles.muted}>
            Checking application form…
          </CustomText>
        </View>
      )}

      {step === 'form' && form && (
        <ServiceDynamicForm
          form={form}
          user={user}
          saving={saving}
          onSubmit={handleSubmit}
          onBack={backToList}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(8),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.brandSoft,
  },
});
