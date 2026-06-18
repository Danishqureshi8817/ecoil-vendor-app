import axios from 'axios';
import {VENDOR_API_BASE} from '@/config/env';
import {getStoredToken} from '@/utils/sessionStorage';

export type ScratchRewardType = 'PERCENT' | 'FLAT';
export type ScratchCardStatus = 'PENDING' | 'COMPLETE';
export type ScratchIssueType =
  | 'FESTIVAL'
  | 'GENERAL'
  | 'OTHERS'
  | 'COLLECTION_REQUEST'
  | 'BACKTEAM'
  | 'MILESTONE';

export type CampaignDistributionType = 'PUBLIC' | 'VENDOR_SPECIFIC' | 'SYSTEM';

export type ScratchCard = {
  id: string;
  campaignId?: string;
  name: string;
  coinAmount: number;
  rewardType: ScratchRewardType;
  status: ScratchCardStatus;
  expiryDate: string;
  vendorId: string;
  vendorName: string;
  cardIssueDate: string;
  collectionRequestId: string | null;
  issueType: ScratchIssueType;
  issueTypeDescription: string | null;
  serialNumber?: string | null;
  assignedSerialNumber?: string | null;
  distributionType?: CampaignDistributionType;
  createdAt: string;
  updatedAt: string;
};

export type VendorCoins = {
  vendorId: string;
  vendorName: string;
  coinTotal: number;
  minRedeemAmount?: number;
  redeemEligible?: boolean;
  coinsNeededForRedeem?: number;
};

export type ScratchResult = {
  card: ScratchCard;
  coinsEarned: number;
  coinTotal: number;
  scratchSequence?: number;
};

export async function claimPublicCampaign(payload: {
  vendorId: string | number;
  vendorName: string;
  campaignId: string;
}): Promise<ScratchCard> {
  const {data} = await axios.post<ScratchCard>(
    `${base()}/scratch-cards/claim`,
    payload,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return data;
}

export type ScratchTxnType = 'EARNED' | 'REDEEM';
export type ScratchTxnStatus = 'PENDING' | 'SUCCESS' | 'REJECTED';

export type CoinTransaction = {
  id: string;
  scratchCardId: string | null;
  vendorId: string;
  vendorName: string;
  action: string;
  name: string;
  coinAmount: number;
  rewardType: ScratchRewardType;
  issueType: ScratchIssueType;
  issueTypeDescription: string | null;
  collectionRequestId: string | null;
  txnType: ScratchTxnType | null;
  txnStatus: ScratchTxnStatus | null;
  description: string | null;
  utrNumber: string | null;
  receiptPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RedeemResult = {
  transaction: CoinTransaction;
  coinTotal: number;
};

const base = () => VENDOR_API_BASE.replace(/\/$/, '');

function bearerHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Please sign in again');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

export async function fetchVendorScratchCards(
  vendorId: string | number,
  status?: ScratchCardStatus,
): Promise<ScratchCard[]> {
  const {data} = await axios.post<ScratchCard[]>(
    `${base()}/scratch-cards/list`,
    {vendorId, status},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchVendorCoins(
  vendorId: string | number,
): Promise<VendorCoins> {
  const {data} = await axios.post<VendorCoins>(
    `${base()}/scratch-cards/coins`,
    {vendorId},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return data ?? {vendorId: String(vendorId), vendorName: '', coinTotal: 0};
}

export async function fetchVendorTransactions(
  vendorId: string | number,
  txnType?: ScratchTxnType,
): Promise<CoinTransaction[]> {
  const {data} = await axios.post<CoinTransaction[]>(
    `${base()}/scratch-cards/transactions`,
    {vendorId, txnType},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return Array.isArray(data) ? data : [];
}

export async function redeemVendorCoins(payload: {
  vendorId: string | number;
  vendorName: string;
  coinAmount: number;
  description: string;
}): Promise<RedeemResult> {
  const {data} = await axios.post<RedeemResult>(
    `${base()}/scratch-cards/redeem`,
    payload,
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return data;
}

export async function scratchVendorCard(
  vendorId: string | number,
  cardId: string,
): Promise<ScratchResult> {
  const {data} = await axios.post<ScratchResult>(
    `${base()}/scratch-cards/scratch`,
    {vendorId, cardId},
    {headers: bearerHeaders(), timeout: 60_000},
  );
  return data;
}
