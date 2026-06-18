import vendorService from '@/services/vendor-service';
import {useAuthStore} from '@/states/authStore';
import {vendorUserId} from '@/utils/vendorUser';
import {useQuery} from '@tanstack/react-query';

export default function useCertificates() {
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);

  return useQuery({
    queryKey: [vendorService.queryKeys.certificates, vid],
    queryFn: () => vendorService.getCertificatesList(),
    enabled: Boolean(vid),
  });
}
