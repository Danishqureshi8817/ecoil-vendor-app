import CustomText from '@/components/global/CustomText';
import {Container} from '@/components/global/Container';
import {VendorBackHeader} from '@/components/layout/VendorBackHeader';
import {GreenTruckIcon} from '@/components/icon/icon';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  collectionChallanUrl,
  collectionDroppedDrumsQty,
  collectionDropDrums,
  collectionRequestId,
  collectionRequestStatus,
  fetchCollectionRequestById,
  type CollectionRequestRow,
} from '@/api/collectionApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import type {RootStackParamList} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {screen} from '@/styles/ui';
import {gatePassFileName, gatePassImageUrl} from '@/utils/gatePass';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {vendorUserId} from '@/utils/vendorUser';
import {goBack} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackNav.CollectRequestDetail
>;

const DETAIL_TITLE = 'Request Details';
const REQUEST_DETAIL_BOTTOM = require('@/assets/images/requestDetailBottom.png');

function formatDetailDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString(undefined, {month: 'short'});
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDetailDateTime(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  const date = formatDetailDate(value);
  const time = d.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date}, ${time}`;
}

function formatKg(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
}

function DetailCard({
  icon,
  title,
  headerRight,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  headerRight?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailCardHead}>
        <View style={styles.detailCardTitleRow}>
          {icon}
          <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.detailCardTitle}>
            {title}
          </CustomText>
        </View>
        {headerRight ? (
          <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.detailCardRight}>
            {headerRight}
          </CustomText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string;
  value: string;
  valueHighlight?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailLabel}>
        {label}
      </CustomText>
      <CustomText
        variant="h7"
        fontFamily={Fonts.montserrat.medium}
        style={valueHighlight ? [styles.detailValue, styles.detailValueHighlight] : styles.detailValue}
        numberOfLine={2}>
        {value}
      </CustomText>
    </View>
  );
}

function DownloadButton({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable style={({pressed}) => [styles.downloadBtn, pressed && styles.pressed]} onPress={onPress}>
      <Ionicons name="download-outline" size={moderateScale(14)} color={Colors.white} />
      <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.downloadBtnText}>
        {label}
      </CustomText>
    </Pressable>
  );
}

function SecurityCodeRow({
  code,
  visible,
  onToggleVisible,
}: {
  code: string | null;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const hasCode = code != null && code.trim() !== '';
  const displayValue = !hasCode ? '—' : visible ? code : '****';

  return (
    <View style={styles.detailRow}>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailLabel}>
        Security Code
      </CustomText>
      <View style={styles.securityValueRow}>
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.medium}
          style={styles.detailValue}
          numberOfLine={1}>
          {displayValue}
        </CustomText>
        {hasCode ? (
          <Pressable
            onPress={onToggleVisible}
            hitSlop={12}
            accessibilityLabel={visible ? 'Hide security code' : 'Show security code'}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={moderateScale(18)}
              color={Colors.brand}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function CollectRequestDetailScreen({route}: Props) {
  const {id} = route.params;
  const user = useAuthStore(s => s.user);
  const [row, setRow] = useState<CollectionRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSecurityCode, setShowSecurityCode] = useState(false);

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

  useEffect(() => {
    setShowSecurityCode(false);
  }, [id]);

  if (loading) {
    return (
      <Container
        backgroundColor={Colors.bg}
        fullScreen
        statusBarStyle="light-content"
        statusBarBackgroundColor="transparent">
        <VendorBackHeader title={DETAIL_TITLE} onBack={() => void goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.brand} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.muted}>
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
        <VendorBackHeader title={DETAIL_TITLE} onBack={() => void goBack()} />
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
        <VendorBackHeader title={DETAIL_TITLE} onBack={() => void goBack()} />
        <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.muted}>
            Request details not found.
          </CustomText>
        </ScrollView>
      </Container>
    );
  }

  const requestId = collectionRequestId(row) ?? id;
  const status = collectionRequestStatus(row);
  const gatePassRaw =
    row.gate_pass != null && String(row.gate_pass).trim() !== ''
      ? String(row.gate_pass)
      : null;
  const gatePassUrl = gatePassRaw ? gatePassImageUrl(gatePassRaw) : '';
  const challanUrl = collectionChallanUrl(id);
  const securityCodeRaw =
    row.security_code != null && String(row.security_code).trim() !== ''
      ? String(row.security_code).trim()
      : null;
  console.log('row', row);
  return (
    <Container
      backgroundColor={Colors.bg}
      fullScreen
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent">
      <VendorBackHeader title={DETAIL_TITLE} onBack={() => void goBack()} />

      <ScrollView
        contentContainerStyle={[screen.scroll, styles.scrollContent]}
        showsVerticalScrollIndicator={false}>
        <DetailCard
          icon={<Ionicons name="clipboard-outline" size={moderateScale(20)} color={Colors.buttonPrimary} />}
          title="Request Information"
          headerRight={`Request #${requestId}`}>
          <DetailRow
            label="Request Type"
            value={String(row.request_type_name ?? row.request_type ?? '—')}
          />
          <DetailRow
            label="Pickup Request Date"
            value={formatDetailDate(row.request_date ?? row.created_at)}
          />
          <DetailRow
            label="Estimated Pickup Time"
            value={formatDetailDateTime(row.max_completion_datetime ?? row.request_date)}
          />
          <DetailRow label="Request Status" value={status} valueHighlight />
        </DetailCard>

        <DetailCard
          icon={<Ionicons name="water-outline" size={moderateScale(20)} color={Colors.brand} />}
          title="Drum & Oil Details">
          <DetailRow
            label="Req. Filled Drums Qty"
            value={String(row.entered_drums_qty ?? '—')}
          />
          <DetailRow
            label="Actual Filled Drums Qty"
            value={String(row.actual_drums_qty ?? row.actual_drums_qty_temp ?? '—')}
          />
          <DetailRow
            label="Request Oil Weight (kg)"
            value={formatKg(row.entered_volume)}
          />
          <DetailRow
            label="Actual Oil Weight (kg)"
            value={formatKg(row.actual_volume ?? row.actual_volume_temp ?? row.entered_volume)}
          />
          <DetailRow
            label="Empty Drums Required"
            value={String(row.empty_drums_qty ?? row.empty_drums ?? '—')}
          />
          {(() => {
            const dropDrums = collectionDropDrums(row);
            if (dropDrums.length === 0) {
              return (
                <DetailRow
                  label="Dropped Drums Qty"
                  value={collectionDroppedDrumsQty(row)}
                />
              );
            }
            return dropDrums.flatMap((drum, index) => [
              <DetailRow
                key={`drum-type-${drum.drum_type_id ?? index}`}
                label="Drum Type"
                value={String(drum.drum_type_name ?? '—').trim() || '—'}
              />,
              <DetailRow
                key={`drum-qty-${drum.drum_type_id ?? index}`}
                label="Dropped Drums Qty"
                value={
                  drum.drum_quantity != null && String(drum.drum_quantity).trim() !== ''
                    ? String(drum.drum_quantity)
                    : '—'
                }
              />,
            ]);
          })()}
        </DetailCard>

        <DetailCard
          icon={<GreenTruckIcon />}
          title="Logistics Details">
          <DetailRow label="Collection Hero" value={String(row.assigned_to_name ?? '—')} />
          <DetailRow label="Vehicle No" value={String(row.vehicle_no ?? '—')} />
          <SecurityCodeRow
            code={securityCodeRaw}
            visible={showSecurityCode}
            onToggleVisible={() => setShowSecurityCode(v => !v)}
          />
          <View style={styles.detailRow}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailLabel}>
              Gate Pass
            </CustomText>
            {gatePassRaw && gatePassUrl ? (
              <DownloadButton
                label="View /Download"
                onPress={() => void Linking.openURL(gatePassUrl)}
              />
            ) : (
              <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailValue}>
                —
              </CustomText>
            )}
          </View>
          <View style={styles.detailRow}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailLabel}>
              Challan
            </CustomText>
            <DownloadButton label="View /Download" onPress={() => void Linking.openURL(challanUrl)} />
          </View>
        </DetailCard>

        <Image
          source={REQUEST_DETAIL_BOTTOM}
          style={styles.thankYouBanner}
          resizeMode="contain"
        />

        <Pressable
          style={({pressed}) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => void goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(16)} color={Colors.white} />
          <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.backBtnText}>
            Back to Requests
          </CustomText>
        </Pressable>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: moderateScaleVertical(32),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScaleVertical(12),
    paddingVertical: moderateScaleVertical(32),
  },
  muted: {
    color: Colors.muted,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailCardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(12),
    paddingBottom: moderateScaleVertical(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  detailCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    flex: 1,
  },
  detailCardTitle: {
    color: Colors.buttonPrimary,
    fontSize: RFValue(10),
  },
  detailCardRight: {
    color: Colors.black,
    fontSize: RFValue(10),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DBDBDB',
  },
  detailLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
    flex: 1,
  },
  detailValue: {
    color: Colors.black,
    fontSize: RFValue(11),
    textAlign: 'left',
    flex: 1,
  },
  detailValueHighlight: {
    color: Colors.brand,
  },
  securityValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: moderateScale(8),
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(40),
    flexShrink: 0,
  },
  downloadBtnText: {
    color: Colors.white,
    fontSize: RFValue(8),
  },
  thankYouBanner: {
    width: '100%',
    height: moderateScaleVertical(96),
    marginBottom: moderateScaleVertical(16),
    borderRadius: moderateScale(16),
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 999,
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(24),
    width: '80%',
    alignSelf: 'center',
  },
  backBtnText: {
    color: Colors.white,
    fontSize: RFValue(10),
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.98}],
  },
});
