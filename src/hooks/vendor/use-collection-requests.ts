import {useQuery} from '@tanstack/react-query';
import vendorService from '@/services/vendor-service';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {vendorUserId} from '@/utils/vendorUser';
import {useToastMessage} from '@/utils/useToastMessage';

export default function useCollectionRequests(enabled = true) {
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.collectionRequests, uid],
    queryFn: () =>
      uid && uid !== 0
        ? vendorService.getCollectionRequestsByVendor(uid)
        : vendorService.getAllCollectionRequests(),
    enabled,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load collections'));
      },
    },
  });
}
