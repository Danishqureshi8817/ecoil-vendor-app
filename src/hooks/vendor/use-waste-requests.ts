import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {
  AssignWasteRequestInput,
  CancelWasteRequestInput,
  CompleteWasteRequestInput,
  CreateWasteRequestInput,
  DeleteWasteRequestInput,
  UpdateWasteRequestInput,
  WasteRequestListFilters,
} from '@/api/wasteApi';
import vendorService from '@/services/vendor-service';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {vendorUserId} from '@/utils/vendorUser';
import {useToastMessage} from '@/utils/useToastMessage';

/** Oil outlet → linked scrap vendors (same API as scrap outlet flow). */
export function useOutletLinkedWasteVendors(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.outletLinkedScrapVendors, 'waste'],
    queryFn: () => vendorService.getOutletLinkedScrapVendors(),
    enabled,
    staleTime: 60_000,
    meta: {
      onError: (error: unknown) => {
        toastError(
          getApiErrorMessage(error, 'Could not load linked scrap vendors'),
        );
      },
    },
  });
}

export default function useWasteRequests(
  enabled = true,
  filters: WasteRequestListFilters = {},
) {
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError} = useToastMessage();
  const ready = uid != null && uid !== '' && uid !== 0;
  const assignment = filters.assignment ?? 'all';
  const requestStatus = filters.request_status ?? '';

  return useQuery({
    queryKey: [
      vendorService.queryKeys.wasteRequests,
      uid,
      assignment,
      requestStatus,
    ],
    queryFn: () =>
      vendorService.getAssignedWasteRequests(uid, {
        assignment,
        request_status: requestStatus,
      }),
    enabled: enabled && ready,
    staleTime: 0,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load waste requests'));
      },
    },
  });
}

export function useCompleteWasteRequest() {
  const queryClient = useQueryClient();
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: CompleteWasteRequestInput) =>
      vendorService.completeWasteRequest(input),
    onSuccess: () => {
      toastSuccess('Waste Request completed');
      void queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.wasteRequests],
      });
      void queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorDashboard],
      });
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not complete waste request'));
    },
  });
}

export function useLinkedWasteVendors(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.linkedScrapVendors, 'waste'],
    queryFn: () => vendorService.getLinkedWasteVendors(),
    enabled,
    staleTime: 60_000,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load vendors'));
      },
    },
  });
}

export function useLinkedWasteCategories(enabled = true) {
  const {toastError} = useToastMessage();

  return useQuery({
    queryKey: [vendorService.queryKeys.linkedWasteCategories],
    queryFn: () => vendorService.getLinkedWasteCategories(),
    enabled,
    staleTime: 60_000,
    meta: {
      onError: (error: unknown) => {
        toastError(getApiErrorMessage(error, 'Could not load waste categories'));
      },
    },
  });
}

function invalidateWasteLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: [vendorService.queryKeys.wasteRequests],
  });
  void queryClient.invalidateQueries({
    queryKey: [vendorService.queryKeys.vendorDashboard],
  });
}

export function useCreateWasteRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: Omit<CreateWasteRequestInput, 'vendorUserId'>) =>
      vendorService.createWasteRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Waste collection request created');
      invalidateWasteLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not create waste request'));
    },
  });
}

export function useUpdateWasteRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: Omit<UpdateWasteRequestInput, 'vendorUserId'>) =>
      vendorService.updateWasteRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Waste collection request updated');
      invalidateWasteLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not update waste request'));
    },
  });
}

export function useAssignWasteRequest() {
  const queryClient = useQueryClient();
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: AssignWasteRequestInput) =>
      vendorService.assignWasteRequest(input),
    onSuccess: () => {
      toastSuccess('Request assigned successfully');
      invalidateWasteLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not reassign waste request'));
    },
  });
}

export function useDeleteWasteRequest() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const uid = vendorUserId(user);
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: Omit<DeleteWasteRequestInput, 'vendorUserId'>) =>
      vendorService.deleteWasteRequest({
        ...input,
        vendorUserId: uid,
      }),
    onSuccess: () => {
      toastSuccess('Waste collection request deleted');
      invalidateWasteLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not delete waste request'));
    },
  });
}

export function useCancelWasteRequest() {
  const queryClient = useQueryClient();
  const {toastError, toastSuccess} = useToastMessage();

  return useMutation({
    mutationFn: (input: CancelWasteRequestInput) =>
      vendorService.cancelWasteRequest(input),
    onSuccess: () => {
      toastSuccess('Waste request cancelled');
      invalidateWasteLists(queryClient);
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Could not cancel waste request'));
    },
  });
}
