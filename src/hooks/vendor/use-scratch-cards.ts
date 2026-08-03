import vendorService from '@/services/vendor-service';
import type {ScratchCardStatus, ScratchTxnType} from '@/api/scratchApi';
import {useAuthStore} from '@/states/authStore';
import {vendorUserId} from '@/utils/vendorUser';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

export function useScratchCards(status: ScratchCardStatus) {
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);

  return useQuery({
    queryKey: [vendorService.queryKeys.scratchCards, status, vid],
    queryFn: () => vendorService.getScratchCards(vid, status),
    enabled: Boolean(vid),
  });
}

export function useVendorCoins() {
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);

  return useQuery({
    queryKey: [vendorService.queryKeys.vendorCoins, vid],
    queryFn: () => vendorService.getVendorCoins(vid),
    enabled: Boolean(vid),
  });
}

export function useScratchCardMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);

  return useMutation({
    mutationFn: (cardId: string) => vendorService.scratchCard(vid, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.scratchCards],
      });
      queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorCoins],
      });
      queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorTransactions],
      });
    },
  });
}

export function useVendorTransactions(txnType: ScratchTxnType, enabled = true) {
  const user = useAuthStore(s => s.user);
  const vid = vendorUserId(user);

  return useQuery({
    queryKey: [vendorService.queryKeys.vendorTransactions, vid, txnType],
    queryFn: () => vendorService.getVendorTransactions(vid, txnType),
    enabled: Boolean(vid) && enabled,
  });
}

export function useRedeemCoinsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      vendorId: string | number;
      vendorName: string;
      vendorEmail?: string;
      coinAmount: number;
      description: string;
    }) => vendorService.redeemCoins(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorCoins],
      });
      queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.vendorTransactions],
      });
    },
  });
}
