import {useQuery} from '@tanstack/react-query';
import vendorService from '@/services/vendor-service';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {useToastMessage} from '@/utils/useToastMessage';

export default function useCollectionRequests(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.collectionRequests],
    queryFn: () => vendorService.getAllCollectionRequests(),
    enabled,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load collections'));
      },
    },
  });
}
