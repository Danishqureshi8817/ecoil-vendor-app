import {validateVendorLogin} from '@/api/vendorApi';
import {fetchCertificatesList} from '@/api/certificatesApi';
import {
  fetchAllCollectionRequests,
  fetchCollectionRequestsByVendor,
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

  getCollectionRequestsByVendor = (vendorUserId: string | number) =>
    fetchCollectionRequestsByVendor(vendorUserId);

  submitCollection = (input: SubmitCollectionRequestInput) =>
    submitCollectionRequest(input);

  getCertificatesList = () => fetchCertificatesList();
}

export default new VendorService();
