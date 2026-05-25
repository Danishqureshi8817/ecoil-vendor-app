import vendorService from '@/services/vendor-service';
import {useQuery} from '@tanstack/react-query';

export default function useCertificates() {
  return useQuery({
    queryKey: [vendorService.queryKeys.certificates],
    queryFn: () => vendorService.getCertificatesList(),
  });
}
