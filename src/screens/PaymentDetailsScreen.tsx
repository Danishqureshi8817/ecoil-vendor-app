import CustomText from '@/components/global/CustomText';
import PrimaryButton from '@/components/global/PrimaryButton';
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
import {defaultPaymentDateRange} from '@/utils/knparisesDate';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {clearSession} from '@/utils/sessionStorage';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

const FIELDS: {label: string; key: keyof PaymentDetailRow}[] = [
  {label: 'Weight (kg)', key: 'weight'},
  {label: 'Request date', key: 'request_date'},
  {label: 'Oil rate', key: 'oil_rate'},
  {label: 'Pickup date', key: 'pickup_date'},
  {label: 'Amount', key: 'amount'},
  {label: 'Payment date', key: 'payment_date'},
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
    </View>
  );
}

export default function PaymentDetailsScreen() {
  const defaultRange = defaultPaymentDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.date_from);
  const [dateUpto, setDateUpto] = useState(defaultRange.date_upto);
  const [rows, setRows] = useState<PaymentDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load(from: string, upto: string) {
    setError('');
    try {
      const list = await fetchPaymentDetails({date_from: from, date_upto: upto});
      setRows(list);
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

  return (
    <ExternalLayout
      title="Payment details"
      activeKey={StackNav.PaymentDetails}
      navItems={buildVendorNavItems(StackNav.PaymentDetails)}
      onLogout={handleLogout}>
      <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
        <View style={[card.base, styles.filterCard]}>
          <CustomText variant="h5" fontFamily={Fonts.inter.bold}>
            Filter by date
          </CustomText>
          <CustomText variant="h7" style={styles.range}>
            {dateFrom} → {dateUpto}
          </CustomText>
          <CustomText variant="h7" style={styles.hint}>
            Use DD-MMM-YYYY (e.g. 01-Jan-2026)
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fieldLabel}>
            Date from
          </CustomText>
          <TextInput
            style={styles.input}
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="DD-MMM-YYYY"
            autoCapitalize="characters"
          />
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fieldLabel}>
            Date upto
          </CustomText>
          <TextInput
            style={styles.input}
            value={dateUpto}
            onChangeText={setDateUpto}
            placeholder="DD-MMM-YYYY"
            autoCapitalize="characters"
          />
          <PrimaryButton
            buttonText={submitting ? 'Loading…' : 'Show data'}
            onPress={() => void handleShowData()}
            disabled={submitting}
          />
        </View>

        {loading && rows.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.brand} />
            <CustomText variant="h7" style={styles.muted}>
              Loading payment details…
            </CustomText>
          </View>
        ) : null}

        {error ? <ErrorBanner message={error} /> : null}

        {!loading && !error && rows.length === 0 ? (
          <EmptyState
            icon="card-outline"
            title="No records"
            subtitle="No payment records found for this date range."
          />
        ) : null}

        {rows.map((row, index) => (
          <PaymentCard key={String(row.id ?? index)} row={row} index={index} />
        ))}
      </ScrollView>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  filterCard: {marginBottom: moderateScaleVertical(14), gap: moderateScaleVertical(8)},
  range: {
    color: Colors.brandDark,
    fontWeight: '700',
    backgroundColor: Colors.brandSoft,
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
  },
  hint: {color: Colors.muted},
  fieldLabel: {marginTop: moderateScaleVertical(4)},
  input: {
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    fontSize: moderateScale(15),
    color: Colors.black,
    backgroundColor: Colors.bg,
  },
  paymentCard: {marginBottom: moderateScaleVertical(12)},
  center: {alignItems: 'center', paddingVertical: moderateScaleVertical(24), gap: 8},
  muted: {color: Colors.muted},
});
