import CustomText from '@/components/global/CustomText';
import type { ScratchCard } from '@/api/scratchApi';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import {
  formatScratchDate,
  ISSUE_LABELS,
  ISSUE_TONE,
  rewardLabel,
  TONE_COLORS,
  type IssueTone,
} from '@/utils/scratchHelpers';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

const GIFT_BOX_IMAGE = require('@/assets/images/cardScratchGiftBox.png');
const COIN_IMAGE = require('@/assets/images/scratchCardCoin.png');

type Props = {
  card: ScratchCard;
  redeemed: boolean;
  expired: boolean;
  onPress: () => void;
};

const TONE_TEXT_COLORS: Record<IssueTone, string> = {
  green: '#059669',
  gold: '#b45309',
  blue: '#0284c7',
  purple: '#7c3aed',
  orange: '#ea580c',
  slate: '#475569',
};

const TONE_CTA_BGS: Record<IssueTone, string> = {
  green: '#d1fae5',
  gold: '#fef3c7',
  blue: '#dbeafe',
  purple: '#ede9fe',
  orange: '#ffedd5',
  slate: '#e2e8f0',
};

export function ScratchCardPreview({ card, redeemed, expired, onPress }: Props) {
  const tone = ISSUE_TONE[card.issueType] ?? 'slate';
  const colors = TONE_COLORS[tone];
  const disabled = expired && !redeemed;

  const textColor = TONE_TEXT_COLORS[tone];
  const ctaBg = TONE_CTA_BGS[tone];

  return (
    <Pressable
      style={({ pressed }) => [
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
      
      {/* Top row with badges */}
      <View style={styles.top}>
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.inter.bold}
            style={[styles.badgeText, { color: textColor }]}>
            {ISSUE_LABELS[card.issueType]?.toUpperCase() || card.issueType}
          </CustomText>
        </View>

        {!redeemed && !disabled ? (
          <View style={styles.chipNew}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              New
            </CustomText>
          </View>
        ) : null}

        {redeemed ? (
          <View style={styles.chipWon}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              Won
            </CustomText>
          </View>
        ) : null}

        {disabled ? (
          <View style={styles.chipExpired}>
            <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.chipText}>
              Expired
            </CustomText>
          </View>
        ) : null}
      </View>

      {/* Main content body */}
      <View style={styles.body}>
        {redeemed ? (
          <>
            <Image source={COIN_IMAGE} style={styles.cardImage} resizeMode="contain" />
            <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.title}>
              {rewardLabel(card)}
            </CustomText>
            <CustomText variant="h7" style={styles.hint}>
              Won successfully
            </CustomText>
          </>
        ) : (
          <>
            <Image source={GIFT_BOX_IMAGE} style={styles.cardImage} resizeMode="contain" />
            <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.title}>
              Mystery Reward
            </CustomText>
            <CustomText variant="h7" style={styles.hint}>
              Tap to open & scratch
            </CustomText>
          </>
        )}
      </View>

      {/* Expiry / validity info */}
      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={12} color={Colors.muted} />
        <CustomText variant="h7" style={styles.footerText}>
          {disabled ? 'Expired' : `Valid till ${formatScratchDate(card.expiryDate)}`}
        </CustomText>
      </View>

      {/* Bottom Action button */}
      {!redeemed && !disabled ? (
        <View style={[styles.cta, { backgroundColor: ctaBg, borderTopColor: colors.border }]}>
          <CustomText
            variant="h7"
            fontFamily={Fonts.inter.bold}
            style={[styles.ctaText, { color: textColor }]}>
            Open card
          </CustomText>
          <Ionicons name="chevron-forward" size={12} color={textColor} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: moderateScaleVertical(12),
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
    transform: [{ scale: 0.98 }],
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingTop: moderateScaleVertical(10),
  },
  badge: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(8),
  },
  badgeText: {
    fontSize: moderateScale(9),
    letterSpacing: 0.4,
  },
  chipNew: {
    backgroundColor: '#f97316',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(8),
  },
  chipWon: {
    backgroundColor: Colors.success,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(8),
  },
  chipExpired: {
    backgroundColor: Colors.error,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(8),
  },
  chipText: {
    color: Colors.white,
    fontSize: moderateScale(9),
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(14),
    minHeight: moderateScaleVertical(128),
  },
  cardImage: {
    width: moderateScale(70),
    height: moderateScale(70),
    marginBottom: moderateScaleVertical(6),
  },
  title: {
    color: Colors.black,
    textAlign: 'center',
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
  },
  hint: {
    color: Colors.muted,
    fontSize: moderateScale(10),
    marginTop: moderateScaleVertical(2),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(10),
    paddingBottom: moderateScaleVertical(10),
  },
  footerText: {
    color: Colors.muted,
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(3),
    paddingVertical: moderateScaleVertical(8),
    borderTopWidth: 1,
  },
  ctaText: {
    fontSize: moderateScale(11),
  },
});
