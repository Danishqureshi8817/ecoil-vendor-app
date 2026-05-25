import {useMutation} from '@tanstack/react-query';
import vendorService from '@/services/vendor-service';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {useToastMessage} from '@/utils/useToastMessage';

export default function useVendorLogin() {
  const {toastError} = useToastMessage();

  return useMutation({
    mutationFn: ({mobile, password}: {mobile: string; password: string}) =>
      vendorService.validateLogin(mobile, password),
    onError: (error: unknown) => {
      toastError(
        getApiErrorMessage(error, 'Login failed. Check mobile and password.'),
      );
    },
  });
}
