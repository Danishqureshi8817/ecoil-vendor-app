import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {
  CompleteScrapRequestInput,
  CreateScrapRequestInput,
  DeleteScrapRequestInput,
  UpdateScrapRequestInput,
} from '@/api/scrapApi';
import vendorService from '@/services/vendor-service';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {vendorUserId} from '@/utils/vendorUser';
import {useToastMessage} from '@/utils/useToastMessage';

export default function useScrapRequests(enabled = true) {
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError} = useToastMessage();
  const ready = uid != null && uid !== '' && uid !== 0;

  return useQuery({
    queryKey: [vendorService.queryKeys.scrapRequests, uid],
    queryFn: () => vendorService.getAssignedScrapRequests(uid),
    enabled: enabled && ready,
    staleTime: 0,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load scrap requests'));
      },
    },
  });
}

export function useCompleteScrapRequest() {
  const queryClient = useQueryClient();
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: CompleteScrapRequestInput) =>
      vendorService.completeScrapRequest(input),
    onSuccess: () => {
      toastSuccess('Scrap request completed');
      void queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.scrapRequests],
      });
      void queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorDashboard],
      });
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not complete scrap request'));
    },
  });
}

export function useLinkedScrapVendors(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.linkedScrapVendors],
    queryFn: () => vendorService.getLinkedScrapVendors(),
    enabled,
    staleTime: 60_000,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load vendors'));
      },
    },
  });
}

export function useLinkedScrapCategories(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.linkedScrapCategories],
    queryFn: () => vendorService.getLinkedScrapCategories(),
    enabled,
    staleTime: 60_000,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load scrap categories'));
      },
    },
  });
}

function invalidateScrapLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: [vendorService.queryKeys.scrapRequests],
  });
  void queryClient.invalidateQueries({
    queryKey: [vendorService.queryKeys.vendorDashboard],
  });
}

export function useCreateScrapRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: Omit<CreateScrapRequestInput, 'vendorUserId'>) =>
      vendorService.createScrapRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Scrap collection request created');
      invalidateScrapLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not create scrap request'));
    },
  });
}

export function useUpdateScrapRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: Omit<UpdateScrapRequestInput, 'vendorUserId'>) =>
      vendorService.updateScrapRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Scrap collection request updated');
      invalidateScrapLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not update scrap request'));
    },
  });
}

export function useDeleteScrapRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (
      input: Omit<DeleteScrapRequestInput, 'vendorUserId'>,
    ) =>
      vendorService.deleteScrapRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Scrap collection request deleted');
      invalidateScrapLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not delete scrap request'));
    },
  });
}
