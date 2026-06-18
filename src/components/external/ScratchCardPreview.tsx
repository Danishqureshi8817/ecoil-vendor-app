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
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

type Props = {
  card: ScratchCard;
  redeemed: boolean;
  expired: boolean;
  onPress: () => void;
};

export function ScratchCardPreview({card, redeemed, expired, onPress}: Props) {
  const tone = ISSUE_TONE[card.issueType] ?? 'slate';
  const colors = TONE_COLORS[tone];
  const disabled = expired && !redeemed;

  return (
    <Pressable
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        redeemed && styles.cardRedeemed,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.badgeText}>
            {ISSUE_LABELS[card.issueType]}
          </CustomText>
        </View>
        {!redeemed && !disabled ? (
          <View style={[styles.chip, styles.chipNew]}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              New
            </CustomText>
          </View>
        ) : null}
        {redeemed ? (
          <View style={[styles.chip, styles.chipWon]}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              Won
            </CustomText>
          </View>
        ) : null}
        {disabled ? (
          <View style={[styles.chip, styles.chipExpired]}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              Expired
            </CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {redeemed ? (
          <>
            <CustomText style={styles.emoji}>🪙</CustomText>
            <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.title}>
              {rewardLabel(card)}
            </CustomText>
          </>
        ) : (
          <>
            <CustomText style={styles.emoji}>🎁</CustomText>
            <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.title}>
              Mystery Reward
            </CustomText>
            <CustomText variant="h7" style={styles.hint}>
              Tap to open & scratch
            </CustomText>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <CustomText variant="h7" style={styles.footerText}>
          {formatScratchDate(card.cardIssueDate)}
        </CustomText>
        {!redeemed && !disabled ? (
          <CustomText variant="h7" style={styles.footerText}>
            Till {formatScratchDate(card.expiryDate)}
          </CustomText>
        ) : null}
      </View>

      {!redeemed && !disabled ? (
        <View style={styles.cta}>
          <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.ctaText}>
            Open card
          </CustomText>
          <Ionicons name="chevron-forward" size={14} color={Colors.brandDark} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47.5%',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadow,
  },
  cardRedeemed: {
    borderColor: '#86efac',
  },
  cardDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.94,
    transform: [{scale: 0.98}],
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScaleVertical(12),
    gap: moderateScale(6),
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: 999,
  },
  badgeText: {
    fontSize: moderateScale(9),
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.black,
  },
  chip: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: 999,
  },
  chipNew: {backgroundColor: Colors.accent},
  chipWon: {backgroundColor: Colors.success},
  chipExpired: {backgroundColor: Colors.error},
  chipText: {color: Colors.white, fontSize: moderateScale(9)},
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(18),
    minHeight: moderateScaleVertical(118),
    gap: moderateScaleVertical(4),
  },
  emoji: {fontSize: moderateScale(34), lineHeight: moderateScale(38)},
  title: {textAlign: 'center', letterSpacing: -0.2},
  hint: {color: Colors.muted, fontWeight: '600'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(12),
    paddingBottom: moderateScaleVertical(10),
  },
  footerText: {
    color: Colors.muted,
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
    paddingVertical: moderateScaleVertical(10),
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.6)',
  },
  ctaText: {color: Colors.brandDark, fontSize: moderateScale(12)},
});
