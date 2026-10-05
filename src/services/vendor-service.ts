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
  assignScrapRequest,
  completeScrapRequest,
  createScrapRequest,
  deleteScrapRequest,
  fetchAssignedScrapRequests,
  fetchLinkedScrapCategories,
  fetchLinkedScrapVendors,
  fetchOutletLinkedScrapVendors,
  fetchScrapAssignUsers,
  updateScrapRequest,
  type AssignScrapRequestInput,
  type CompleteScrapRequestInput,
  type CreateScrapRequestInput,
  type DeleteScrapRequestInput,
  type UpdateScrapRequestInput,
} from '@/api/scrapApi';
import {
  assignWasteRequest,
  completeWasteRequest,
  createWasteRequest,
  deleteWasteRequest,
  fetchAssignedWasteRequests,
  fetchLinkedWasteCategories,
  fetchLinkedWasteVendors,
  updateWasteRequest,
  type AssignWasteRequestInput,
  type CompleteWasteRequestInput,
  type CreateWasteRequestInput,
  type DeleteWasteRequestInput,
  type UpdateWasteRequestInput,
} from '@/api/wasteApi';
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
    scrapRequests: 'scrapRequests',
    linkedScrapVendors: 'linkedScrapVendors',
    outletLinkedScrapVendors: 'outletLinkedScrapVendors',
    linkedScrapCategories: 'linkedScrapCategories',
    scrapAssignUsers: 'scrapAssignUsers',
    wasteRequests: 'wasteRequests',
    linkedWasteCategories: 'linkedWasteCategories',
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

  getAssignedScrapRequests = (vendorUserId: string | number = 0) =>
    fetchAssignedScrapRequests(vendorUserId);

  completeScrapRequest = (input: CompleteScrapRequestInput) =>
    completeScrapRequest(input);

  getLinkedScrapVendors = () => fetchLinkedScrapVendors();

  getOutletLinkedScrapVendors = () => fetchOutletLinkedScrapVendors();

  getLinkedScrapCategories = () => fetchLinkedScrapCategories();

  getScrapAssignUsers = () => fetchScrapAssignUsers();

  createScrapRequest = (input: CreateScrapRequestInput) =>
    createScrapRequest(input);

  updateScrapRequest = (input: UpdateScrapRequestInput) =>
    updateScrapRequest(input);

  assignScrapRequest = (input: AssignScrapRequestInput) =>
    assignScrapRequest(input);

  deleteScrapRequest = (input: DeleteScrapRequestInput) =>
    deleteScrapRequest(input);

  getAssignedWasteRequests = (vendorUserId: string | number = 0) =>
    fetchAssignedWasteRequests(vendorUserId);

  completeWasteRequest = (input: CompleteWasteRequestInput) =>
    completeWasteRequest(input);

  getLinkedWasteVendors = () => fetchLinkedWasteVendors();

  getLinkedWasteCategories = () => fetchLinkedWasteCategories();

  createWasteRequest = (input: CreateWasteRequestInput) =>
    createWasteRequest(input);

  updateWasteRequest = (input: UpdateWasteRequestInput) =>
    updateWasteRequest(input);

  assignWasteRequest = (input: AssignWasteRequestInput) =>
    assignWasteRequest(input);

  deleteWasteRequest = (input: DeleteWasteRequestInput) =>
    deleteWasteRequest(input);

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
    vendorEmail?: string;
    coinAmount: number;
    description: string;
  }) => redeemVendorCoins(payload);
}

export default new VendorService();
