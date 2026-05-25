import {validateVendorLogin} from '@/api/vendorApi';
import {fetchCertificatesList} from '@/api/certificatesApi';
import {
  fetchAllCollectionRequests,
  submitCollectionRequest,
  type SubmitCollectionRequestInput,
} from '@/api/collectionApi';

class VendorService {
  queryKeys = {
    vendorLogin: 'vendorLogin',
    collectionRequests: 'collectionRequests',
    certificates: 'certificates',
  };

  validateLogin = (mobile: string, password: string) =>
    validateVendorLogin(mobile, password);

  getAllCollectionRequests = () => fetchAllCollectionRequests();

  submitCollection = (input: SubmitCollectionRequestInput) =>
    submitCollectionRequest(input);

  getCertificatesList = () => fetchCertificatesList();
}

export default new VendorService();
