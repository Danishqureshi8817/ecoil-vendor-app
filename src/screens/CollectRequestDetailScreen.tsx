import CustomText from '@/components/global/CustomText';
import {Container} from '@/components/global/Container';
import {VendorBackHeader} from '@/components/layout/VendorBackHeader';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  collectionRequestLabel,
  collectionRequestStatus,
  fetchCollectionRequestById,
  type CollectionRequestRow,
} from '@/api/collectionApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import type {RootStackParamList} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {card, screen} from '@/styles/ui';
import {externalUi} from '@/styles/externalUi';
import {gatePassFileName, gatePassImageUrl} from '@/utils/gatePass';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {vendorUserId} from '@/utils/vendorUser';
import {goBack} from '@/utils/NavigationUtils';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackNav.CollectRequestDetail
>;

function formatDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const s = String(value);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return s;
}

type DetailRow = {label: string; value: unknown};

function buildDetailRows(row: CollectionRequestRow): DetailRow[] {
  const pairs: DetailRow[] = [
    {label: 'Request type', value: row.request_type_name ?? row.request_type},
    {label: 'Pickup date', value: row.request_date},
    {label: 'Estimated pickup', value: row.max_completion_datetime},
    {label: 'Status', value: row.request_status_name ?? collectionRequestStatus(row)},
    {label: 'Requested drums', value: row.entered_drums_qty},
    {label: 'Actual drums', value: row.actual_drums_qty ?? row.actual_drums_qty_temp},
    {label: 'Requested oil (kg)', value: row.entered_volume},
    {label: 'Actual oil (kg)', value: row.actual_volume ?? row.actual_volume_temp},
    {label: 'Empty drums', value: row.empty_drums_qty},
    {label: 'Logistic manager', value: row.logistic_manager},
    {label: 'PDA', value: row.assigned_to_name},
    {label: 'Vehicle no.', value: row.vehicle_no},
    {label: 'Security code', value: row.security_code},
    {label: 'Notes', value: row.notes_for_team ?? row.notes},
  ];
  return pairs.filter(p => p.value != null && String(p.value).trim() !== '');
}

export default function CollectRequestDetailScreen({route}: Props) {
  const {id} = route.params;
  const user = useAuthStore(s => s.user);
  const [row, setRow] = useState<CollectionRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCollectionRequestById(id, vendorUserId(user));
      setRow(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load request details'));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const defaultTitle = 'Collection request';

  if (loading) {
    return (
      <Container
        backgroundColor={Colors.bg}
        fullScreen
        statusBarStyle="light-content"
        statusBarBackgroundColor="transparent">
        <VendorBackHeader title={defaultTitle} onBack={() => void goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.brand} />
          <CustomText variant="h7" style={externalUi.muted}>
            Loading…
          </CustomText>
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        backgroundColor={Colors.bg}
        fullScreen
        statusBarStyle="light-content"
        statusBarBackgroundColor="transparent">
        <VendorBackHeader title={defaultTitle} onBack={() => void goBack()} />
        <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
          <ErrorBanner message={error} />
        </ScrollView>
      </Container>
    );
  }

  if (!row) {
    return (
      <Container
        backgroundColor={Colors.bg}
        fullScreen
        statusBarStyle="light-content"
        statusBarBackgroundColor="transparent">
        <VendorBackHeader title={defaultTitle} onBack={() => void goBack()} />
        <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
          <CustomText variant="h7" style={externalUi.muted}>
            Request details not found.
          </CustomText>
        </ScrollView>
      </Container>
    );
  }

  const gatePassRaw =
    row.gate_pass != null && String(row.gate_pass).trim() !== ''
      ? String(row.gate_pass)
      : null;
  const gatePassUrl = gatePassRaw ? gatePassImageUrl(gatePassRaw) : '';
  const title = collectionRequestLabel(row);

  return (
    <Container
      backgroundColor={Colors.bg}
      fullScreen
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent">
      <VendorBackHeader title={title} onBack={() => void goBack()} />

      <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
        <View style={card.base}>
          <View style={externalUi.listCardHead}>
            <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={{flex: 1}}>
              {collectionRequestLabel(row)}
            </CustomText>
            <View style={externalUi.badge}>
              <CustomText variant="h7" style={externalUi.badgeText}>
                {collectionRequestStatus(row)}
              </CustomText>
            </View>
          </View>

          {buildDetailRows(row).map(({label, value}) => (
            <View key={label} style={externalUi.metaRow}>
              <CustomText variant="h7" style={externalUi.metaDt}>
                {label}
              </CustomText>
              <CustomText variant="h7" style={externalUi.metaDd}>
                {/date|time/i.test(label) ? formatDate(value) : String(value)}
              </CustomText>
            </View>
          ))}

          {gatePassRaw && gatePassUrl ? (
            <View style={styles.gatePassRow}>
              <View style={styles.gatePassInfo}>
                <CustomText variant="h7" style={externalUi.metaDt}>
                  Gate pass
                </CustomText>
                <CustomText variant="h7" style={externalUi.metaDd} numberOfLine={2}>
                  {gatePassFileName(gatePassRaw)}
                </CustomText>
              </View>
              <Pressable
                style={[externalUi.btnSecondary, externalUi.btnSecondaryLink, styles.downloadBtn]}
                onPress={() => void Linking.openURL(gatePassUrl)}>
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.inter.bold}
                  style={[externalUi.btnSecondaryText, externalUi.btnSecondaryTextLink]}>
                  Download
                </CustomText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScaleVertical(12),
    paddingVertical: moderateScaleVertical(32),
  },
  gatePassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: moderateScaleVertical(16),
    paddingTop: moderateScaleVertical(12),
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  gatePassInfo: {
    flex: 1,
    minWidth: 0,
  },
  downloadBtn: {
    flexShrink: 0,
  },
});
