import CustomText from '@/components/global/CustomText';
import { ScratchCardPreview } from '@/components/external/ScratchCardPreview';
import { ScratchModal } from '@/components/external/ScratchModal';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CoinTransaction, ScratchCard } from '@/api/scratchApi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import {
  useRedeemCoinsMutation,
  useScratchCardMutation,
  useScratchCards,
  useVendorCoins,
  useVendorTransactions,
} from '@/hooks/vendor/use-scratch-cards';
import { StackNav } from '@/navigations/NavigationKeys';
import { useAuthStore } from '@/states/authStore';
import { externalUi } from '@/styles/externalUi';
import { screen } from '@/styles/ui';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { formatRedeemMinimumMessage, isScratchExpired } from '@/utils/scratchHelpers';
import { clearSession } from '@/utils/sessionStorage';
import { buildVendorNavItems } from '@/utils/vendorNavItems';
import { vendorUserId } from '@/utils/vendorUser';
import { resetAndNavigate } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';
import { RFValue } from 'react-native-responsive-fontsize';
import { formatAmount } from '@/utils/helperFunctions';

type RewardsTab = 'scratch' | 'earned' | 'redeem';

const REWARDS_BG_CARD = require('@/assets/images/scratchICardInfoBg.png');
const TILTED_GIFT_IMAGE = require('@/assets/images/scratchCardGift.png');
const STAR_COIN_IMAGE = require('@/assets/images/scratchCardCoin.png');

const REWARDS_TABS: { id: RewardsTab; label: string; icon: string }[] = [
  { id: 'scratch', label: 'To scratch', icon: 'gift-outline' },
  { id: 'earned', label: 'Coins earned', icon: 'sparkles-outline' },
  { id: 'redeem', label: 'Redemtions', icon: 'receipt-outline' },
];

const TXN_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  REJECTED: 'Rejected',
};

const TXN_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fff8e6', color: '#825300' },
  SUCCESS: { bg: '#e8f7df', color: '#176c08' },
  REJECTED: { bg: '#fef2f2', color: '#b91c1c' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TransactionRow({ txn }: { txn: CoinTransaction }) {
  const isEarned = txn.txnType === 'EARNED';
  const status = txn.txnStatus ?? '';
  const statusStyle = TXN_STATUS_COLORS[status] ?? TXN_STATUS_COLORS.PENDING;

  return (
    <View style={styles.txnRow}>
      <View style={styles.txnRowMain}>
        <View style={styles.txnRowLeft}>
          <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
            {isEarned ? txn.name || 'Scratch reward' : 'Coin redeem'}
          </CustomText>
          {txn.description ? (
            <CustomText variant="h7" style={styles.txnDesc}>
              {txn.description}
            </CustomText>
          ) : null}
          <CustomText variant="h7" style={styles.txnDate}>
            {formatDate(txn.createdAt)}
          </CustomText>
        </View>
        <View style={styles.txnRowRight}>
          <View style={styles.txnAmountContainer}>
            <Image source={STAR_COIN_IMAGE} style={styles.txnCoinIcon} resizeMode="contain" />
            <CustomText
              variant="h5"
              fontFamily={Fonts.inter.bold}
              style={isEarned ? styles.txnAmountCredit : styles.txnAmountDebit}>
              {isEarned ? '+' : '-'}
              {txn.coinAmount}
            </CustomText>
          </View>
          {!isEarned && status ? (
            <View style={[styles.txnStatus, { backgroundColor: statusStyle.bg }]}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.inter.bold}
                style={[styles.txnStatusText, { color: statusStyle.color }]}>
                {TXN_STATUS_LABELS[status] ?? status}
              </CustomText>
            </View>
          ) : null}
        </View>
      </View>
      {/* {!isEarned && status === 'SUCCESS' && (txn.utrNumber || txn.receiptPhotoUrl) ? (
        <View style={styles.txnProof}>
          {txn.utrNumber ? (
            <CustomText variant="h7" style={styles.txnProofText}>
              UTR: {txn.utrNumber}
            </CustomText>
          ) : null}
          {txn.receiptPhotoUrl ? (
            <Pressable onPress={() => void Linking.openURL(txn.receiptPhotoUrl!)}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.txnProofLink}>
                View receipt
              </CustomText>
            </Pressable>
          ) : null}
        </View>
      ) : null} */}
    </View>
  );
}

export default function MyRewardsScreen() {
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);
  const vendorName = user?.name || 'Vendor';
  const [tab, setTab] = useState<RewardsTab>('scratch');
  const [activeCard, setActiveCard] = useState<ScratchCard | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemDesc, setRedeemDesc] = useState('');
  const [redeemFormError, setRedeemFormError] = useState<string | null>(null);

  const {
    data: cards,
    isLoading: cardsLoading,
    refetch: refetchCards,
    isRefetching: cardsRefetching,
    error: cardsError,
  } = useScratchCards('PENDING');
  const {
    data: earnedTxns,
    isLoading: earnedLoading,
    refetch: refetchEarned,
    isRefetching: earnedRefetching,
    error: earnedError,
  } = useVendorTransactions('EARNED', tab === 'earned');
  const {
    data: redeemTxns,
    isLoading: redeemLoading,
    refetch: refetchRedeem,
    isRefetching: redeemRefetching,
    error: redeemError,
  } = useVendorTransactions('REDEEM', tab === 'redeem');
  const { data: coins, refetch: refetchCoins } = useVendorCoins();
  const scratchMutation = useScratchCardMutation();
  const redeemMutation = useRedeemCoinsMutation();

  const pendingRows = cards ?? [];
  const earnedRows = earnedTxns ?? [];
  const redeemRows = redeemTxns ?? [];
  const coinTotal = coins?.coinTotal ?? null;
  const minRedeemAmount = coins?.minRedeemAmount ?? 0;
  const redeemEligible =
    coins?.redeemEligible ?? (coinTotal != null ? coinTotal >= minRedeemAmount : minRedeemAmount <= 0);
  const redeemBlockedMessage =
    coinTotal != null && minRedeemAmount > 0 && !redeemEligible
      ? formatRedeemMinimumMessage(minRedeemAmount, coinTotal)
      : null;
  const isScratchTab = tab === 'scratch';
  const isEarnedTab = tab === 'earned';
  const isRedeemTab = tab === 'redeem';
  const isLoading = isScratchTab
    ? cardsLoading
    : isEarnedTab
      ? earnedLoading
      : redeemLoading;
  const isRefetching = isScratchTab
    ? cardsRefetching
    : isEarnedTab
      ? earnedRefetching
      : redeemRefetching;
  const error = isScratchTab ? cardsError : isEarnedTab ? earnedError : redeemError;

  const onRefresh = useCallback(() => {
    void refetchCoins();
    if (isScratchTab) {
      void refetchCards();
    } else if (isEarnedTab) {
      void refetchEarned();
    } else {
      void refetchRedeem();
    }
  }, [isScratchTab, isEarnedTab, refetchCards, refetchCoins, refetchEarned, refetchRedeem]);

  const handleScratched = useCallback(
    (_result: { coinsEarned: number; coinTotal: number }) => {
      void refetchCards();
      void refetchCoins();
    },
    [refetchCards, refetchCoins],
  );

  const handleScratch = useCallback(
    async (cardId: string) => {
      const result = await scratchMutation.mutateAsync(cardId);
      return { coinsEarned: result.coinsEarned, coinTotal: result.coinTotal };
    },
    [scratchMutation],
  );

  function handleRedeemPress() {
    if (redeemBlockedMessage) {
      Alert.alert('Cannot redeem yet', redeemBlockedMessage);
      return;
    }
    if (coinTotal == null || coinTotal <= 0) {
      Alert.alert('No coins', 'No coins available to redeem');
      return;
    }
    setRedeemFormError(null);
    setRedeemOpen(true);
  }

  async function submitRedeem() {
    setRedeemFormError(null);
    if (redeemBlockedMessage) {
      setRedeemFormError(redeemBlockedMessage);
      return;
    }
    if (coinTotal == null || coinTotal <= 0) {
      setRedeemFormError('No coins available to redeem');
      return;
    }
    if (!redeemDesc.trim()) {
      setRedeemFormError('Description is required');
      return;
    }
    try {
      await redeemMutation.mutateAsync({
        vendorId: vid,
        vendorName,
        coinAmount: coinTotal,
        description: redeemDesc.trim(),
      });
      setRedeemOpen(false);
      setRedeemDesc('');
      setTab('redeem');
      void refetchRedeem();
    } catch (err: unknown) {
      setRedeemFormError(getApiErrorMessage(err, 'Redeem failed'));
    }
  }

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Scratch and win" leading="menu" />

      <ScrollView
        contentContainerStyle={[screen.scroll, styles.scroll]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={Colors.brand}
          />
        }>

        {/* Banner with scratchICardInfoBg */}
        <ImageBackground
          source={REWARDS_BG_CARD}
          style={styles.hero}
          imageStyle={{ borderRadius: moderateScale(16) }}
          resizeMode="cover">
          <View style={styles.heroTop}>
            <Image source={TILTED_GIFT_IMAGE} style={styles.heroGiftImg} resizeMode="contain" />
            <View style={styles.heroCopy}>
              <CustomText variant="h7" fontFamily={Fonts.inter.regular} style={styles.heroLabel}>
                ECOIL REWARDS
              </CustomText>
              <CustomText variant="h3" fontFamily={Fonts.inter.semiBold} style={styles.heroTitle}>
                Scratch & Win
              </CustomText>
              <CustomText variant="h7" style={styles.heroSub}>
                Tap a card, scratch in the popup & collection coins - Paytm & Xomato style rewards.
              </CustomText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.heroBottom}>
            <View style={styles.walletBox}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.walletLabel}>
                WALLET BALANCE
              </CustomText>
              <View style={styles.balanceRow}>
                <Image source={STAR_COIN_IMAGE} style={styles.balanceStarCoin} resizeMode="contain" />
                <CustomText variant="h2" fontFamily={Fonts.inter.bold} style={styles.balanceValue}>
                  {formatAmount(coinTotal as number) ?? '0'}
                </CustomText>
                <CustomText variant="h6" style={styles.balanceUnit}>
                  Coins
                </CustomText>
              </View>
            </View>

            <Pressable style={styles.redeemButton} onPress={handleRedeemPress}>
              <CustomText variant="h6" fontFamily={Fonts.inter.medium} style={styles.redeemButtonText}>
                Redeem Coins
              </CustomText>
              <Ionicons name="chevron-forward" size={moderateScale(15)} color="#5e3a00" />
            </Pressable>
          </View>
        </ImageBackground>

        {/* Tab Selection */}
        <View style={styles.tabsContainer}>
          {REWARDS_TABS.map(item => {
            const active = tab === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setTab(item.id)}>

                <CustomText
                  variant="h7"
                  fontFamily={Fonts.inter.medium}
                  numberOfLine={1}
                  style={active ? [styles.tabText, styles.tabTextActive] : styles.tabText}>
                  {item.label}
                </CustomText>
              </Pressable>
            );
          })}
        </View>

        {/* Tab Content */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.brand} />
            <CustomText variant="h7" style={[externalUi.muted, styles.loadingText]}>
              {isScratchTab ? 'Loading reward cards…' : 'Loading…'}
            </CustomText>
          </View>
        ) : error ? (
          <View style={externalUi.alertError}>
            <CustomText variant="h7" style={externalUi.alertErrorText}>
              {getApiErrorMessage(
                error,
                isScratchTab
                  ? 'Could not load scratch cards'
                  : 'Could not load transactions',
              )}
            </CustomText>
          </View>
        ) : isScratchTab ? (
          pendingRows.length === 0 ? (
            <EmptyState
              icon="gift-outline"
              title="No cards to scratch"
              subtitle="New rewards appear here when issued by Ecoil team."
            />
          ) : (
            <View style={styles.grid}>
              {pendingRows.map(card => (
                <ScratchCardPreview
                  key={card.id}
                  card={card}
                  redeemed={false}
                  expired={isScratchExpired(card)}
                  onPress={() => setActiveCard(card)}
                />
              ))}
            </View>
          )
        ) : isEarnedTab ? (
          earnedRows.length === 0 ? (
            <EmptyState
              icon="sparkles-outline"
              title="No coins earned yet"
              subtitle="Scratch a card to see coins credited here."
            />
          ) : (
            <View style={styles.txnList}>
              {earnedRows.map(txn => (
                <TransactionRow key={txn.id} txn={txn} />
              ))}
            </View>
          )
        ) : redeemRows.length === 0 ? (
          <EmptyState
            icon="cash-outline"
            title="No redemptions yet"
            subtitle="Tap Redeem coins above to request a payout."
          />
        ) : (
          <View style={styles.txnList}>
            {redeemRows.map(txn => (
              <TransactionRow key={txn.id} txn={txn} />
            ))}
          </View>
        )}
      </ScrollView>

      {activeCard ? (
        <ScratchModal
          key={activeCard.id}
          visible
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onScratched={handleScratched}
          onScratch={handleScratch}
        />
      ) : null}

      <Modal visible={redeemOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setRedeemOpen(false)}>
          <Pressable style={styles.redeemForm} onPress={e => e.stopPropagation()}>
            <CustomText variant="h5" fontFamily={Fonts.inter.bold}>
              Redeem coins
            </CustomText>
            <CustomText variant="h7" style={styles.redeemHint}>
              Your full wallet balance will be redeemed. Admin approval is required before payout.
            </CustomText>
            <View style={styles.redeemAmountBox}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fieldLabel}>
                Redeem amount
              </CustomText>
              <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.redeemAmountValue}>
                {coinTotal ?? 0} coins
              </CustomText>
            </View>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.fieldLabel}>
              Description
            </CustomText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={redeemDesc}
              onChangeText={setRedeemDesc}
              placeholder="Reason for redeem"
              multiline
            />
            {redeemFormError ? (
              <CustomText variant="h7" style={styles.redeemFormError}>
                {redeemFormError}
              </CustomText>
            ) : null}
            <View style={styles.redeemActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setRedeemOpen(false)}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold}>
                  Cancel
                </CustomText>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, redeemMutation.isPending && styles.submitBtnDisabled]}
                disabled={redeemMutation.isPending}
                onPress={() => void submitRedeem()}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.submitBtnText}>
                  {redeemMutation.isPending ? 'Submitting…' : 'Submit'}
                </CustomText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: moderateScaleVertical(24) },
  hero: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
    ...theme.shadow,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  heroGiftImg: {
    width: moderateScale(72),
    height: moderateScale(72),
  },
  heroCopy: { flex: 1 },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    fontSize: RFValue(8),
  },
  heroTitle: {
    color: Colors.white,
    fontSize: RFValue(16),
    marginTop: 1,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: moderateScaleVertical(4),
    fontSize: RFValue(10),
  },
  divider: {
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: moderateScaleVertical(14),
    height: 0,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletBox: {
    flexDirection: 'column',
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: RFValue(10),
    letterSpacing: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScaleVertical(4),
  },
  balanceStarCoin: {
    width: moderateScale(18),
    height: moderateScale(18),
    marginRight: moderateScale(10),
  },
  balanceValue: {
    color: Colors.white,
    fontSize: RFValue(28),
    lineHeight: moderateScale(30),
  },
  balanceUnit: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: RFValue(12),
    marginLeft: moderateScale(3),
    alignSelf: 'flex-end',
    marginBottom: moderateScaleVertical(2),
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5C451',
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(10),
    gap: 4,
    ...theme.shadow,
  },
  redeemButtonText: {
    color: '#5e3a00',
    fontSize: RFValue(12),
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: moderateScale(14),
    padding: 3,
    marginBottom: moderateScaleVertical(16),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(10),
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#00875a',
    ...theme.shadow,
  },
  tabIcon: {
    marginRight: 1,
  },
  tabText: {
    color: '#475569',
    fontSize: RFValue(12),
  },
  tabTextActive: {
    color: Colors.white,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(48),
  },
  loadingText: { marginTop: moderateScaleVertical(12) },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: moderateScaleVertical(20),
  },
  txnList: { gap: moderateScaleVertical(10) },
  txnRow: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    ...theme.shadow,
  },
  txnRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  txnRowLeft: { flex: 1 },
  txnRowRight: { alignItems: 'flex-end', gap: moderateScaleVertical(6) },
  txnDesc: { color: Colors.muted, marginTop: 4 },
  txnDate: { color: Colors.muted, marginTop: 6, fontSize: RFValue(11) },
  txnAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txnCoinIcon: {
    width: moderateScale(16),
    height: moderateScale(16),
  },
  txnAmountCredit: { color: '#059669' },
  txnAmountDebit: { color: '#dc2626' },
  txnStatus: {
    borderRadius: 999,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
  },
  txnStatusText: { fontSize: RFValue(10), textTransform: 'uppercase' },
  txnProof: {
    marginTop: moderateScaleVertical(10),
    paddingTop: moderateScaleVertical(10),
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    flexDirection: 'row',
    gap: moderateScale(12),
    flexWrap: 'wrap',
  },
  txnProofText: { color: Colors.muted },
  txnProofLink: { color: Colors.brand },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  redeemForm: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    gap: moderateScaleVertical(8),
  },
  redeemHint: { color: Colors.muted, marginBottom: moderateScaleVertical(8) },
  redeemAmountBox: {
    marginBottom: moderateScaleVertical(12),
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  redeemAmountValue: { color: Colors.brand, marginTop: moderateScaleVertical(4) },
  fieldLabel: { color: Colors.muted, marginTop: moderateScaleVertical(4) },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    fontFamily: Fonts.inter.regular,
    fontSize: RFValue(14),
    color: Colors.black,
  },
  textArea: { minHeight: moderateScaleVertical(80), textAlignVertical: 'top' },
  redeemFormError: { color: '#dc2626' },
  redeemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(8),
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(10),
  },
  submitBtn: {
    backgroundColor: Colors.brand,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(10),
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white },
});
