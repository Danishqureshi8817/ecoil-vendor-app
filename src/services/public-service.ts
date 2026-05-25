import {
  fetchMyApplicationDetail,
  fetchMyApplications,
  fetchPublicServiceForm,
  fetchPublicServices,
  submitPublicServiceApplication,
} from '@/api/publicApi';

class PublicService {
  queryKeys = {
    services: 'publicServices',
    serviceForm: 'publicServiceForm',
    myApplications: 'myApplications',
  };

  getServices = (q?: string) => fetchPublicServices(q);

  getServiceForm = (serviceId: string) => fetchPublicServiceForm(serviceId);

  getMyApplications = (vendorMobile: string) =>
    fetchMyApplications(vendorMobile);

  getMyApplicationDetail = (id: string, vendorMobile: string) =>
    fetchMyApplicationDetail(id, vendorMobile);

  submitApplication = (
    serviceId: string,
    payload: Parameters<typeof submitPublicServiceApplication>[1],
  ) => submitPublicServiceApplication(serviceId, payload);
}

export default new PublicService();
