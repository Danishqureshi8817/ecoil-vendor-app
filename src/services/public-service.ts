import {
  fetchMyApplicationDetail,
  fetchMyApplications,
  fetchPublicServiceForm,
  fetchPublicServices,
  fetchPublicSuppliersByCity,
  submitPublicServiceApplication,
} from '@/api/publicApi';

class PublicService {
  queryKeys = {
    services: 'publicServices',
    serviceForm: 'publicServiceForm',
    myApplications: 'myApplications',
    suppliers: 'publicSuppliers',
  };

  getServices = (q?: string) => fetchPublicServices(q);

  getServiceForm = (serviceId: string) => fetchPublicServiceForm(serviceId);

  getSuppliersByCity = (city: string, serviceId?: string) =>
    fetchPublicSuppliersByCity(city, serviceId);

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
