import CustomText from '@/components/global/CustomText';
import {KnparisesDatePickerField} from '@/components/global/KnparisesDatePickerField';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {fetchPaymentDetails, type PaymentDetailRow} from '@/api/paymentApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {externalUi} from '@/styles/externalUi';
import {screen, shadowStyle} from '@/styles/ui';
import {
  defaultPaymentDateRange,
  parseKnparisesDate,
} from '@/utils/knparisesDate';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {clearSession} from '@/utils/sessionStorage';
import {vendorUserId} from '@/utils/vendorUser';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

const PAYMENT_EMPTY_IMAGE = require('@/assets/images/paymentNo.png');

const FIELDS: {label: string; key: keyof PaymentDetailRow}[] = [
  {label: 'Firm', key: 'firm_name'},
  {label: 'Branch', key: 'branch_name'},
  {label: 'Store code', key: 'store_code'},
  {label: 'Volume (kg)', key: 'weight'},
  {label: 'Oil rate', key: 'oil_rate'},
  {label: 'GST', key: 'gst_amount'},
  {label: 'Amount', key: 'amount'},
  {label: 'Pickup', key: 'pickup_date'},
  {label: 'Payment date', key: 'payment_date'},
  {label: 'Receipt no.', key: 'receipt_no'},
  {label: 'Invoice', key: 'invoice_number'},
  {label: 'Remarks', key: 'payment_remarks'},
];

function PaymentEmptyState() {
  return (
    <View style={styles.emptyBody}>
      <Image source={PAYMENT_EMPTY_IMAGE} style={styles.emptyImage} resizeMode="contain" />
      <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.emptyTitle}>
        No record found
      </CustomText>
      <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.emptySub}>
        No payment details available for the selected date range. Try adjusting the dates.
      </CustomText>
    </View>
  );
}

function PaymentCard({row, index}: {row: PaymentDetailRow; index: number}) {
  return (
    <View style={[externalUi.listCard, styles.paymentCard]}>
      <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold}>
        Payment #{index + 1}
      </CustomText>
      {FIELDS.map(({label, key}) => {
        const value = row[key];
        if (value == null || value === '') {
          return null;
        }
        return (
          <View key={key} style={externalUi.metaRow}>
            <CustomText variant="h7" style={externalUi.metaDt}>
              {label}
            </CustomText>
            <CustomText variant="h7" style={externalUi.metaDd}>
              {String(value)}
            </CustomText>
          </View>
        );
      })}
      {row.payment_ref_2_url ? (
        <Pressable
          onPress={() => void Linking.openURL(row.payment_ref_2_url!)}
          style={styles.receiptLink}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.semiBold}
            style={styles.receiptLinkText}>
            View receipt
          </CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function PaymentDetailsScreen() {
  const user = useAuthStore(s => s.user);
  const defaultRange = defaultPaymentDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.date_from);
  const [dateUpto, setDateUpto] = useState(defaultRange.date_upto);
  const [rows, setRows] = useState<PaymentDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dateFromValue = useMemo(() => parseKnparisesDate(dateFrom), [dateFrom]);
  const dateUptoValue = useMemo(() => parseKnparisesDate(dateUpto), [dateUpto]);
  const isEmpty = !loading && !error && rows.length === 0;

  async function load(from: string, upto: string) {
    setError('');
    const vendorId = vendorUserId(user);
    if (!vendorId) {
      setError('Vendor ID is missing. Please sign in again.');
      setRows([]);
      return;
    }
    try {
      const result = await fetchPaymentDetails({
        vendor_id: vendorId,
        date_from: from,
        date_upto: upto,
      });
      setRows(result.payments);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load payment details'));
      setRows([]);
    }
  }

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load(defaultRange.date_from, defaultRange.date_upto);
      setLoading(false);
    })();
  }, []);

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  async function handleShowData() {
    setSubmitting(true);
    setLoading(true);
    await load(dateFrom, dateUpto);
    setSubmitting(false);
    setLoading(false);
  }

  const renderItem: ListRenderItem<PaymentDetailRow> = useCallback(
    ({item, index}) => (
      <View style={styles.listItem}>
        <PaymentCard row={item} index={index} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: PaymentDetailRow, index: number) => String(item.id ?? index),
    [],
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.emptyBody}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.loadingText}>
            Loading payment details…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return null;
    }
    return <PaymentEmptyState />;
  }, [loading, error]);

  return (
    <ExternalLayout
      title="Payment Details"
      activeKey={StackNav.PaymentDetails}
      navItems={buildVendorNavItems(StackNav.PaymentDetails, user)}
      onLogout={handleLogout}
      headerHideAvatar
      headerCenterTitle>
      <View style={styles.page}>
        <View style={styles.filterCard}>
          <View style={styles.dateRow}>
            <KnparisesDatePickerField
              label="Date from"
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

          <Pressable
            style={({pressed}) => [
              styles.showDataBtn,
              pressed && styles.showDataBtnPressed,
              submitting && styles.showDataBtnDisabled,
            ]}
            disabled={submitting}
            onPress={() => void handleShowData()}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.showDataText}>
                Show Data
              </CustomText>
            )}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <ErrorBanner message={error} />
          </View>
        ) : null}

        <FlatList
          style={styles.list}
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={[
            screen.scroll,
            (loading && rows.length === 0) || isEmpty ? styles.emptyContent : null,
            styles.listContent,
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  filterCard: {
    marginHorizontal: moderateScale(15),
    marginTop: moderateScaleVertical(15),
    marginBottom: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(16),
    paddingBottom: moderateScaleVertical(18),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.white,
    ...shadowStyle,
    gap: moderateScaleVertical(16),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  showDataBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(999),
    paddingVertical: moderateScaleVertical(14),
    minHeight: moderateScaleVertical(48),
  },
  showDataBtnPressed: {
    opacity: 0.92,
  },
  showDataBtnDisabled: {
    opacity: 0.75,
  },
  showDataText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: moderateScaleVertical(8),
    paddingBottom: moderateScaleVertical(24),
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    minHeight: moderateScaleVertical(360),
  },
  emptyImage: {
    width: moderateScale(220),
    height: moderateScaleVertical(180),
    marginBottom: moderateScaleVertical(20),
  },
  emptyTitle: {
    color: Colors.black,
    fontSize: RFValue(16),
    textAlign: 'center',
    marginBottom: moderateScaleVertical(10),
  },
  emptySub: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
    textAlign: 'center',
  },
  loadingText: {
    marginTop: moderateScaleVertical(12),
    color: Colors.muted,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
  listItem: {
    paddingHorizontal: moderateScale(16),
  },
  errorWrap: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
  },
  paymentCard: {
    marginBottom: moderateScaleVertical(12),
  },
  receiptLink: {
    marginTop: moderateScaleVertical(8),
  },
  receiptLinkText: {
    color: Colors.brand,
  },
});
