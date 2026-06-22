import {validateVendorLogin} from '@/api/vendorApi';
import {fetchCertificatesList} from '@/api/certificatesApi';
import {
  fetchVendorDashboard,
  type VendorDashboardData,
} from '@/api/dashboardApi';
import {
  fetchAllCollectionRequests,
  fetchCollectionRequestsByVendor,
  submitCollectionRequest,
  type SubmitCollectionRequestInput,
} from '@/api/collectionApi';
import {
  fetchVendorCoins,
  fetchVendorScratchCards,
  fetchVendorTransactions,
  redeemVendorCoins,
  scratchVendorCard,
  type ScratchCardStatus,
  type ScratchTxnType,
} from '@/api/scratchApi';
import {useAuthStore} from '@/states/authStore';
import {vendorUserId} from '@/utils/vendorUser';

class VendorService {
  queryKeys = {
    vendorLogin: 'vendorLogin',
    collectionRequests: 'collectionRequests',
    certificates: 'certificates',
    scratchCards: 'scratchCards',
    vendorCoins: 'vendorCoins',
    vendorTransactions: 'vendorTransactions',
    vendorDashboard: 'vendorDashboard',
  };

  validateLogin = (mobile: string, password: string) =>
    validateVendorLogin(mobile, password);

  getAllCollectionRequests = () => fetchAllCollectionRequests();

  getCollectionRequestsByVendor = (vendorUserId: string | number) =>
    fetchCollectionRequestsByVendor(vendorUserId);

  submitCollection = (input: SubmitCollectionRequestInput) =>
    submitCollectionRequest(input);

  getCertificatesList = () => {
    const user = useAuthStore.getState().user;
    return fetchCertificatesList(vendorUserId(user));
  };

  getScratchCards = (vendorUserId: string | number, status?: ScratchCardStatus) =>
    fetchVendorScratchCards(vendorUserId, status);

  getVendorCoins = (vendorUserId: string | number) =>
    fetchVendorCoins(vendorUserId);

  getDashboard = (payload: {
    user_id: string | number;
    user_type: string | number;
    vendor_id: string | number;
  }): Promise<VendorDashboardData> => fetchVendorDashboard(payload);

  scratchCard = (vendorUserId: string | number, cardId: string) =>
    scratchVendorCard(vendorUserId, cardId);

  getVendorTransactions = (
    vendorUserId: string | number,
    txnType?: ScratchTxnType,
  ) => fetchVendorTransactions(vendorUserId, txnType);

  redeemCoins = (payload: {
    vendorId: string | number;
    vendorName: string;
    coinAmount: number;
    description: string;
  }) => redeemVendorCoins(payload);
}

export default new VendorService();
