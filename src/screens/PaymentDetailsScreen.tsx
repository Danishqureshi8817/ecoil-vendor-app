import CustomText from '@/components/global/CustomText';
import {KnparisesDatePickerField} from '@/components/global/KnparisesDatePickerField';
import {EmptyState} from '@/components/ui/EmptyState';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {fetchPaymentDetails, type PaymentDetailRow} from '@/api/paymentApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {card, screen} from '@/styles/ui';
import {externalUi} from '@/styles/externalUi';
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
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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

function PaymentCard({row, index}: {row: PaymentDetailRow; index: number}) {
  return (
    <View style={[externalUi.listCard, styles.paymentCard]}>
      <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
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
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.receiptLinkText}>
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
          <ActivityIndicator color={Colors.brand} />
          <CustomText variant="h7" style={styles.muted}>
            Loading payment details…
          </CustomText>
        </View>
      );
    }
    if (error) {
      return null;
    }
    return (
      <View style={styles.emptyBody}>
        <EmptyState
          icon="card-outline"
          title="No records"
          subtitle="No payment records found for this date range."
        />
      </View>
    );
  }, [loading, error]);

  return (
    <ExternalLayout
      title="Payment details"
      activeKey={StackNav.PaymentDetails}
      navItems={buildVendorNavItems(StackNav.PaymentDetails, user)}
      onLogout={handleLogout}>
      <View style={styles.page}>
        <View style={[card.base, styles.filterFixed, {borderRadius: 0, padding: moderateScale(15)}]}>
          <View style={styles.filterRow}>
            <KnparisesDatePickerField
              label="Date from"
              hideLabel
              compact
              value={dateFrom}
              onChange={setDateFrom}
              maximumDate={dateUptoValue ?? undefined}
            />
            <View style={styles.filterSepWrap}>
              <CustomText variant="h7" style={styles.filterSep}>
                to
              </CustomText>
            </View>
            <KnparisesDatePickerField
              label="Date upto"
              hideLabel
              compact
              value={dateUpto}
              onChange={setDateUpto}
              minimumDate={dateFromValue ?? undefined}
            />
            <Pressable
              style={({pressed}) => [pressed && styles.searchPressed]}
              disabled={submitting}
              onPress={() => void handleShowData()}>
              <LinearGradient
                colors={[Colors.brandDark, Colors.brand]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.searchBtn}>
                {submitting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="search" size={16} color={Colors.white} />
                    <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.searchText}>
                      Search
                    </CustomText>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
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
  page: {flex: 1},
  filterFixed: {
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    zIndex: 2,
  },
  list: {flex: 1},
  listContent: {
    paddingHorizontal: 0,
    paddingTop: moderateScaleVertical(8),
  },
  emptyContent: {flexGrow: 1},
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    gap: moderateScaleVertical(8),
    minHeight: moderateScaleVertical(320),
  },
  listItem: {
    paddingHorizontal: moderateScale(16),
  },
  errorWrap: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  filterSepWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: moderateScale(2),
  },
  filterSep: {
    color: Colors.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(5),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(11),
    borderRadius: moderateScale(12),
    minWidth: moderateScale(88),
  },
  searchText: {color: Colors.white},
  searchPressed: {opacity: 0.92, transform: [{scale: 0.98}]},
  paymentCard: {marginBottom: moderateScaleVertical(12)},
  receiptLink: {marginTop: moderateScaleVertical(8)},
  receiptLinkText: {color: Colors.brand},
  muted: {color: Colors.muted},
});
