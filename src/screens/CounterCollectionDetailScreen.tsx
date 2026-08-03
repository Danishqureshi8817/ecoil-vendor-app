import CustomText from '@/components/global/CustomText';
import {Container} from '@/components/global/Container';
import {VendorBackHeader} from '@/components/layout/VendorBackHeader';
import {GreenTruckIcon} from '@/components/icon/icon';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  collectionChallanUrl,
} from '@/api/collectionApi';
import {
  counterCollectionAddress,
  counterCollectionBranchLabel,
  counterCollectionFileUrl,
  counterCollectionId,
  counterCollectionRequestType,
  type CounterCollectionRow,
} from '@/api/reportsApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import type {RootStackParamList} from '@/navigations/NavigationKeys';
import {screen} from '@/styles/ui';
import {gatePassImageUrl} from '@/utils/gatePass';
import {goBack} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {
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
  typeof StackNav.CountersCollectionDetail
>;

const DETAIL_TITLE = 'Collection Details';
const REQUEST_DETAIL_BOTTOM = require('@/assets/images/requestDetailBottom.png');

const SHOWN_KEYS = new Set([
  'id',
  'collection_request_id',
  'request_id',
  'branch_name',
  'store_code',
  'request_date',
  'created_at',
  'date',
  'request_type',
  'request_type_name',
  'entered_drums_qty',
  'actual_drums_qty',
  'actual_drums_qty_temp',
  'entered_volume',
  'actual_volume',
  'actual_volume_temp',
  'empty_drums_qty',
  'empty_drums',
  'transfer_ticket',
  'challan',
  'challan_url',
  'gate_pass',
  'address',
  'address_line1',
  'address_line2',
  'address_line3',
  'area',
  'city',
  'logistic_manager',
  'assigned_to_name',
  'vehicle_no',
  'security_code',
  'request_status',
  'request_status_name',
  'status',
  'notes_for_team',
  'challan_number',
]);

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

function formatKg(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatExtraValue(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
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
        numberOfLine={4}>
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

export default function CounterCollectionDetailScreen({route}: Props) {
  const row = route.params.row;
  const requestId = counterCollectionId(row) ?? '—';
  const status = String(
    row.request_status_name ?? row.request_status ?? row.status ?? '—',
  );

  const transferTicketRaw =
    row.transfer_ticket ?? row.gate_pass ?? row.transfer_ticket_url ?? null;
  const transferTicketUrl = transferTicketRaw
    ? gatePassImageUrl(String(transferTicketRaw)) || counterCollectionFileUrl(transferTicketRaw)
    : '';

  const challanRaw = row.challan ?? row.challan_url ?? null;
  const challanUrl = challanRaw
    ? counterCollectionFileUrl(challanRaw)
    : requestId !== '—'
      ? collectionChallanUrl(requestId)
      : '';

  const extraFields = useMemo(
    () =>
      Object.entries(row).filter(([key, value]) => {
        if (SHOWN_KEYS.has(key)) {
          return false;
        }
        return value != null && String(value).trim() !== '';
      }),
    [row],
  );

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
          icon={<Ionicons name="business-outline" size={moderateScale(20)} color={Colors.buttonPrimary} />}
          title="Branch Information"
          headerRight={requestId !== '—' ? `Request #${requestId}` : undefined}>
          <DetailRow label="Branch Name" value={counterCollectionBranchLabel(row)} />
          <DetailRow
            label="Store Code"
            value={row.store_code != null ? String(row.store_code) : '—'}
          />
          <DetailRow label="Address" value={counterCollectionAddress(row)} />
        </DetailCard>

        <DetailCard
          icon={<Ionicons name="clipboard-outline" size={moderateScale(20)} color={Colors.buttonPrimary} />}
          title="Request Information">
          <DetailRow label="Request Type" value={counterCollectionRequestType(row)} valueHighlight />
          <DetailRow
            label="Request Date"
            value={formatDetailDate(row.request_date ?? row.created_at ?? row.date)}
          />
          <DetailRow label="Request Status" value={status} valueHighlight />
          <DetailRow
            label="Challan Number"
            value={row.challan_number != null ? String(row.challan_number) : '—'}
          />
          <DetailRow
            label="Notes"
            value={row.notes_for_team != null ? String(row.notes_for_team) : '—'}
          />
        </DetailCard>

        <DetailCard
          icon={<Ionicons name="water-outline" size={moderateScale(20)} color={Colors.brand} />}
          title="Drum & Oil Details">
          <DetailRow
            label="Filled Drums (Pickup)"
            value={String(
              row.actual_drums_qty_temp ??
                row.actual_drums_qty ??
                row.entered_drums_qty ??
                '—',
            )}
          />
          <DetailRow
            label="Oil Weight (kg)"
            value={formatKg(
              row.actual_volume_temp ?? row.actual_volume ?? row.entered_volume,
            )}
          />
          <DetailRow
            label="Empty Drums (Drop)"
            value={String(row.empty_drums_qty ?? row.empty_drums ?? '—')}
          />
        </DetailCard>

        <DetailCard icon={<GreenTruckIcon />} title="Documents & Logistics">
          <DetailRow label="Logistic Manager" value={String(row.logistic_manager ?? '—')} />
          <DetailRow label="Collection Hero" value={String(row.assigned_to_name ?? '—')} />
          <DetailRow label="Vehicle No" value={String(row.vehicle_no ?? '—')} />
          <DetailRow
            label="Security Code"
            value={
              row.security_code != null && String(row.security_code).trim()
                ? '****'
                : '—'
            }
          />
          <View style={styles.detailRow}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailLabel}>
              Transfer Ticket
            </CustomText>
            {transferTicketRaw && transferTicketUrl ? (
              <DownloadButton
                label="View / Download"
                onPress={() => void Linking.openURL(transferTicketUrl)}
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
            {challanUrl ? (
              <DownloadButton
                label="View / Download"
                onPress={() => void Linking.openURL(challanUrl)}
              />
            ) : (
              <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.detailValue}>
                —
              </CustomText>
            )}
          </View>
          {/* {transferTicketRaw && transferTicketUrl ? (
            <Image
              source={{uri: transferTicketUrl}}
              style={styles.ticketPreview}
              resizeMode="contain"
            />
          ) : null} */}
        </DetailCard>

        {extraFields.length > 0 ? (
          <DetailCard
            icon={<Ionicons name="list-outline" size={moderateScale(20)} color={Colors.buttonPrimary} />}
            title="Additional Details">
            {extraFields.map(([key, value]) => (
              <DetailRow key={key} label={humanizeKey(key)} value={formatExtraValue(value)} />
            ))}
          </DetailCard>
        ) : null}

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
            Back to Counters Collection
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
  ticketPreview: {
    width: '100%',
    height: moderateScaleVertical(160),
    marginTop: moderateScaleVertical(10),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.bg,
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
