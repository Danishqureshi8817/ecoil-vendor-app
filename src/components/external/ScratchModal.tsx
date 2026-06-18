import CustomText from '@/components/global/CustomText';
import type {ScratchCard} from '@/api/scratchApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {
  formatScratchDate,
  ISSUE_LABELS,
  ISSUE_TONE,
  rewardLabel,
  TONE_COLORS,
} from '@/utils/scratchHelpers';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import {ScratchCard as RnScratchCard} from 'rn-scratch-card';

const SCRATCH_REVEAL_THRESHOLD = 25;
const SCRATCH_BRUSH_WIDTH = 50;
const SCRATCH_COMPLETE_DELAY_MS = 300;
const CONFETTI_DURATION_MS = 700;
const CONFETTI_MAX_PLAYS = 3;
const PAD_HEIGHT = moderateScaleVertical(240);

type Props = {
  visible: boolean;
  card: ScratchCard;
  onClose: () => void;
  onScratched: (result: {coinsEarned: number; coinTotal: number}) => void;
  onScratch: (cardId: string) => Promise<{coinsEarned: number; coinTotal: number}>;
};

export function ScratchModal({
  visible,
  card,
  onClose,
  onScratched,
  onScratch,
}: Props) {
  const [revealed, setRevealed] = useState(card.status === 'COMPLETE');
  const [progress, setProgress] = useState(revealed ? 100 : 0);
  const [scratchKey, setScratchKey] = useState(0);
  const [padLayout, setPadLayout] = useState({width: 0, height: 0});
  const [isCompleting, setIsCompleting] = useState(false);
  const [scratchResult, setScratchResult] = useState<{
    coinsEarned: number;
    coinTotal: number;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const busyRef = useRef(false);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiPlaysRef = useRef(0);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  const handleConfettiFinish = useCallback((isCancelled?: boolean) => {
    if (isCancelled) {
      return;
    }
    confettiPlaysRef.current += 1;
    if (confettiPlaysRef.current >= CONFETTI_MAX_PLAYS) {
      setShowConfetti(false);
      return;
    }
    lottieRef.current?.play();
  }, []);

  const isExpired = new Date(card.expiryDate) < new Date();
  const canScratch = !revealed && !isExpired && card.status !== 'COMPLETE';
  const tone = ISSUE_TONE[card.issueType] ?? 'slate';
  const bannerColors = TONE_COLORS[tone].banner;

  const revealAll = useCallback(() => {
    setProgress(100);
    setRevealed(true);
    confettiPlaysRef.current = 0;
    setConfettiKey(k => k + 1);
    setShowConfetti(true);
  }, []);

  const runCompleteScratch = useCallback(() => {
    revealAll();
    void onScratch(card.id)
      .then(result => {
        setScratchResult({
          coinsEarned: Number(result.coinsEarned) || 0,
          coinTotal: Number(result.coinTotal) || 0,
        });
        onScratched(result);
      })
      .catch(() => {
        busyRef.current = false;
        setIsCompleting(false);
        setScratchResult(null);
        setShowConfetti(false);
        setRevealed(false);
        setProgress(0);
        setScratchKey(k => k + 1);
      });
  }, [card.id, onScratch, onScratched, revealAll]);

  const scheduleCompleteScratch = useCallback(() => {
    if (busyRef.current || revealed || completeTimerRef.current) {
      return;
    }
    busyRef.current = true;
    setIsCompleting(true);
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      completeTimerRef.current = null;
      runCompleteScratch();
    }, SCRATCH_COMPLETE_DELAY_MS);
  }, [revealed, runCompleteScratch]);

  const handleScratchProgress = useCallback(
    (scratchPercentage: number) => {
      if (revealed || busyRef.current) {
        return;
      }

      const pct = Math.round(scratchPercentage);
      setProgress(pct);

      if (pct >= SCRATCH_REVEAL_THRESHOLD) {
        scheduleCompleteScratch();
      }
    },
    [scheduleCompleteScratch, revealed],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={20} color={Colors.black} />
          </Pressable>

          <LinearGradient
            colors={bannerColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.banner}>
            <View style={styles.bannerBadge}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.bannerBadgeText}>
                {ISSUE_LABELS[card.issueType]}
              </CustomText>
            
            </View>
            <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.bannerTitle}>
              {card.name}
            </CustomText>
           
            {/* {card.issueTypeDescription ? (
              <CustomText variant="h7" style={styles.bannerSub}>
                {card.issueTypeDescription}
              </CustomText>
            ) : null} */}
          </LinearGradient>

          <View style={styles.padWrap}>
            <View
              collapsable={false}
              style={[styles.pad, revealed && styles.padRevealed]}
              onLayout={event => {
                const {width, height} = event.nativeEvent.layout;
                setPadLayout({width, height});
              }}>
              <View style={styles.reward} pointerEvents="none">
                <View style={styles.rewardContent}>
                  {revealed ? (
                    <CustomText
                      variant="h5"
                      fontFamily={Fonts.inter.bold}
                      style={styles.congratsTitle}>
                      Congratulations!
                    </CustomText>
                  ) : null}
                  <CustomText style={styles.rewardIcon}>🪙</CustomText>
                  <CustomText variant="h2" fontFamily={Fonts.inter.bold} style={styles.rewardAmount}>
                    {revealed && scratchResult
                      ? `+${scratchResult.coinsEarned} coins`
                      : rewardLabel(card)}
                  </CustomText>
                  <CustomText variant="h7" style={styles.rewardSub}>
                    {revealed ? 'Added to your wallet!' : 'Your reward awaits'}
                  </CustomText>
                </View>
              </View>

              {canScratch && padLayout.width > 0 && padLayout.height > 0 ? (
                <View
                  style={[
                    styles.scratchOverlay,
                    {width: padLayout.width, height: padLayout.height},
                  ]}>
                  <View style={styles.scratchBacking} />
                  <RnScratchCard
                    key={scratchKey}
                    source={require('@/assets/images/scratchForeground.png')}
                    brushWidth={SCRATCH_BRUSH_WIDTH}
                    onScratch={handleScratchProgress}
                    style={{
                      width: padLayout.width,
                      height: padLayout.height,
                    }}
                  />
                  {isCompleting ? (
                    <View style={styles.overlayHint} pointerEvents="none">
                      <ActivityIndicator color={Colors.brandDark} size="small" />
                      <CustomText
                        variant="h7"
                        fontFamily={Fonts.inter.bold}
                        style={[styles.overlayHintText, styles.completingText]}>
                        Revealing your reward…
                      </CustomText>
                    </View>
                  ) : progress < 5 ? (
                    <View style={styles.overlayHint} pointerEvents="none">
                      <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.overlayHintText}>
                        Scratch with your finger
                      </CustomText>
                      <CustomText variant="h7" style={styles.overlayHintSub}>
                        Reveal at {SCRATCH_REVEAL_THRESHOLD}% scratched
                      </CustomText>
                    </View>
                  ) : null}
                  <View style={styles.progressTrack} pointerEvents="none">
                    <View style={[styles.progressBar, {width: `${progress}%`}]} />
                  </View>
                </View>
              ) : null}
            </View>

            {showConfetti && revealed && padLayout.width > 0 ? (
              <View
                pointerEvents="none"
                style={[
                  styles.lottieOverlay,
                  {width: padLayout.width, height: PAD_HEIGHT},
                ]}>
                <LottieView
                  ref={lottieRef}
                  key={`confetti-${confettiKey}`}
                  source={require('@/assets/animation/Confetti.json')}
                  autoPlay
                  loop={false}
                  duration={CONFETTI_DURATION_MS}
                  resizeMode="contain"
                  renderMode="AUTOMATIC"
                  onAnimationFinish={handleConfettiFinish}
                  style={styles.lottieConfetti}
                />
              </View>
            ) : null}

            {isExpired && !revealed ? (
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.expiredMsg}>
                This card expired on {formatScratchDate(card.expiryDate)}
              </CustomText>
            ) : null}
          </View>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <CustomText variant="h7" style={styles.metaLabel}>
                Issued
              </CustomText>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold}>
                {formatScratchDate(card.cardIssueDate)}
              </CustomText>
            </View>
            <View style={styles.metaItem}>
              <CustomText variant="h7" style={styles.metaLabel}>
                Valid till
              </CustomText>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold}>
                {formatScratchDate(card.expiryDate)}
              </CustomText>
            </View>
            {card.collectionRequestId ? (
              <View style={styles.metaItem}>
                <CustomText variant="h7" style={styles.metaLabel}>
                  Request
                </CustomText>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold}>
                  #{card.collectionRequestId}
                </CustomText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    padding: moderateScale(16),
    position: 'relative',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    maxHeight: '92%',
    zIndex: 1,
    ...theme.shadow,
  },
  closeBtn: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    zIndex: 5,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
  },
  banner: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(22),
    paddingBottom: moderateScaleVertical(18),
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: 999,
    marginBottom: moderateScaleVertical(8),
  },
  bannerBadgeText: {
    color: Colors.white,
    fontSize: moderateScale(9),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bannerTitle: {color: Colors.white, letterSpacing: -0.3},
  bannerSub: {color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18},
  padWrap: {
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScaleVertical(16),
    position: 'relative',
  },
  pad: {
    height: PAD_HEIGHT,
    width: '100%',
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fcd34d',
    backgroundColor: '#fef3c7',
    position: 'relative',
  },
  padRevealed: {
    borderColor: '#86efac',
    backgroundColor: '#ecfdf5',
  },
  reward: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(20),
    zIndex: 2,
  },
  rewardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScaleVertical(6),
  },
  rewardIcon: {fontSize: moderateScale(42), lineHeight: moderateScale(46)},
  rewardAmount: {color: '#c2410c', letterSpacing: -0.5, textAlign: 'center'},
  rewardSub: {color: Colors.muted, fontWeight: '600', textAlign: 'center'},
  congratsTitle: {color: Colors.brandDark, textAlign: 'center', marginBottom: moderateScaleVertical(2)},
  scratchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  scratchBacking: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#b8bcc4',
  },
  overlayHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  overlayHintText: {color: 'rgba(55,65,81,0.7)'},
  completingText: {marginTop: moderateScaleVertical(10)},
  overlayHintSub: {color: 'rgba(55,65,81,0.55)', marginTop: 4},
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.brandMid,
  },
  lottieOverlay: {
    position: 'absolute',
    top: moderateScaleVertical(16),
    left: moderateScale(18),
    right: moderateScale(18),
    zIndex: 10,
    overflow: 'hidden',
    borderRadius: moderateScale(18),
  },
  lottieConfetti: {
    width: '100%',
    height: '100%',
    transform: [{scaleY: -1}],
  },
  expiredMsg: {
    color: Colors.error,
    textAlign: 'center',
    marginTop: moderateScaleVertical(10),
  },
  meta: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScaleVertical(14),
    gap: moderateScale(8),
  },
  metaItem: {flex: 1, alignItems: 'center'},
  metaLabel: {
    color: Colors.muted,
    fontSize: moderateScale(9),
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
});
