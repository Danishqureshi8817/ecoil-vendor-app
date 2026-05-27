import CustomText from '@/components/global/CustomText';
import PrimaryButton from '@/components/global/PrimaryButton';
import {ErrorBanner} from '@/components/ui/ErrorBanner';
import {
  acceptAgreement,
  emailAgreement,
  fetchAgreement,
} from '@/api/agreementApi';
import {Colors} from '@/constants/colors';
import {ExternalLayout} from '@/layouts/ExternalLayout';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {card, screen} from '@/styles/ui';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {clearSession} from '@/utils/sessionStorage';
import {buildVendorNavItems} from '@/utils/vendorNavItems';
import {vendorUserId} from '@/utils/vendorUser';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {useToastMessage} from '@/utils/useToastMessage';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export default function AgreementScreen() {
  const user = useAuthStore(s => s.user);
  const userId = vendorUserId(user);
  const {toastSuccess} = useToastMessage();
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAgreement(userId);
        setContent(data.content);
        setStatus(data.status);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load agreement'));
        setContent('');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  function handleLogout() {
    clearSession();
    useAuthStore.getState().logout();
    resetAndNavigate(StackNav.Login, 0);
  }

  async function handleAccept() {
    setActionLoading(true);
    setError('');
    try {
      await acceptAgreement(userId);
      setStatus(1);
      toastSuccess('Agreement accepted successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept agreement'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEmail() {
    setActionLoading(true);
    setError('');
    try {
      const res = await emailAgreement(userId);
      toastSuccess(res.message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send agreement email'));
    } finally {
      setActionLoading(false);
    }
  }

  const plainContent = stripHtml(content);

  return (
    <ExternalLayout
      title="Agreement"
      activeKey={StackNav.Agreement}
      navItems={buildVendorNavItems(StackNav.Agreement)}
      onLogout={handleLogout}>
      <ScrollView contentContainerStyle={screen.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.brand} />
            <CustomText variant="h7" style={styles.muted}>
              Loading agreement…
            </CustomText>
          </View>
        ) : null}

        {error ? <ErrorBanner message={error} /> : null}

        {!loading && !error && plainContent === '' ? (
          <View style={card.base}>
            <CustomText variant="h7" style={styles.warn}>
              Your agreement is not available for now. Contact the support team.
            </CustomText>
          </View>
        ) : null}

        {!loading && !error && plainContent !== '' ? (
          <View style={card.base}>
            <ScrollView style={styles.agreementScroll} nestedScrollEnabled>
              <CustomText variant="h7" style={styles.agreementText}>
                {plainContent}
              </CustomText>
            </ScrollView>
            <View style={styles.actions}>
              {status === 0 ? (
                <PrimaryButton
                  buttonText={actionLoading ? 'Please wait…' : 'Accept'}
                  onPress={() => void handleAccept()}
                  disabled={actionLoading}
                />
              ) : (
                <PrimaryButton
                  buttonText={actionLoading ? 'Please wait…' : 'Get on email'}
                  onPress={() => void handleEmail()}
                  disabled={actionLoading}
                />
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ExternalLayout>
  );
}

const styles = StyleSheet.create({
  center: {alignItems: 'center', paddingVertical: moderateScaleVertical(32), gap: 8},
  muted: {color: Colors.muted},
  warn: {color: Colors.error, fontWeight: '600'},
  agreementScroll: {maxHeight: 420, marginBottom: moderateScaleVertical(16)},
  agreementText: {lineHeight: 22, color: Colors.black},
  actions: {paddingTop: moderateScaleVertical(4)},
});
