import {validateVendorLogin} from '@/api/vendorApi';
import {
  fetchAllCollectionRequests,
  submitCollectionRequest,
  type SubmitCollectionRequestInput,
} from '@/api/collectionApi';

class VendorService {
  queryKeys = {
    vendorLogin: 'vendorLogin',
    collectionRequests: 'collectionRequests',
  };

  validateLogin = (mobile: string, password: string) =>
    validateVendorLogin(mobile, password);

  getAllCollectionRequests = () => fetchAllCollectionRequests();

  submitCollection = (input: SubmitCollectionRequestInput) =>
    submitCollectionRequest(input);
}

export default new VendorService();
