import vendorService from '@/services/vendor-service';
import {useAuthStore} from '@/states/authStore';
import {vendorDashboardParams} from '@/utils/vendorUser';
import {useQuery} from '@tanstack/react-query';

export default function useVendorDashboard() {
  const user = useAuthStore(s => s.user);
  const params = vendorDashboardParams(user);

  return useQuery({
    queryKey: [vendorService.queryKeys.vendorDashboard, params],
    queryFn: () => vendorService.getDashboard(params),
    enabled: Boolean(params.user_id && params.vendor_id),
    staleTime: 0,
  });
}
