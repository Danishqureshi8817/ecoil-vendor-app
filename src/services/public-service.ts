import {
  fetchMyApplicationDetail,
  fetchMyApplications,
  fetchPublicHomeBanners,
  fetchPublicServiceForm,
  fetchPublicServices,
  fetchPublicSuppliersByCity,
  submitPublicServiceApplication,
} from '@/api/publicApi';

class PublicService {
  queryKeys = {
    services: 'publicServices',
    homeBanners: 'publicHomeBanners',
    serviceForm: 'publicServiceForm',
    myApplications: 'myApplications',
    suppliers: 'publicSuppliers',
  };

  getServices = (q?: string) => fetchPublicServices(q);

  getHomeBanners = () => fetchPublicHomeBanners();

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
