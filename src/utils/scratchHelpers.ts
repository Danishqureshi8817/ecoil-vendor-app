import {Colors} from '@/constants/colors';
import type {ScratchCard, ScratchIssueType} from '@/api/scratchApi';

export const ISSUE_LABELS: Record<ScratchIssueType, string> = {
  FESTIVAL: 'Festival',
  GENERAL: 'General',
  OTHERS: 'Others',
  COLLECTION_REQUEST: 'Collection',
  BACKTEAM: 'Backteam',
  MILESTONE: 'Milestone',
};

export type IssueTone = 'green' | 'gold' | 'blue' | 'purple' | 'orange' | 'slate';

export const ISSUE_TONE: Record<ScratchIssueType, IssueTone> = {
  FESTIVAL: 'gold',
  GENERAL: 'blue',
  OTHERS: 'slate',
  COLLECTION_REQUEST: 'green',
  BACKTEAM: 'purple',
  MILESTONE: 'orange',
};

export const TONE_COLORS: Record<
  IssueTone,
  {bg: string; border: string; banner: string[]}
> = {
  green: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    banner: [Colors.brandDark, Colors.brandMid],
  },
  gold: {
    bg: '#fffbeb',
    border: '#fcd34d',
    banner: ['#b45309', '#f59e0b'],
  },
  blue: {
    bg: '#eff6ff',
    border: '#93c5fd',
    banner: ['#0369a1', '#0ea5e9'],
  },
  purple: {
    bg: '#f5f3ff',
    border: '#c4b5fd',
    banner: ['#5b21b6', '#8b5cf6'],
  },
  orange: {
    bg: '#fff7ed',
    border: '#fdba74',
    banner: ['#c2410c', '#fb923c'],
  },
  slate: {
    bg: '#f8fafc',
    border: '#cbd5e1',
    banner: ['#334155', '#64748b'],
  },
};

export function formatScratchDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function rewardLabel(card: ScratchCard) {
  if (card.rewardType === 'PERCENT') {
    return `${card.coinAmount}% off`;
  }
  return `${card.coinAmount} coins`;
}

export function isScratchExpired(card: ScratchCard) {
  return new Date(card.expiryDate) < new Date();
}

export function formatRedeemMinimumMessage(
  minRedeemAmount: number,
  coinTotal: number,
): string {
  const needed = Math.max(0, minRedeemAmount - coinTotal);
  if (needed <= 0.0001) return '';
  return `You need at least ${minRedeemAmount} coins in your wallet before you can request a redeem. You currently have ${coinTotal} coins — earn ${needed} more coins first.`;
}
