import {fetchPublicSettings} from '@/api/publicApi';
import {useQuery} from '@tanstack/react-query';

export default function useAppSettings() {
  return useQuery({
    queryKey: ['public', 'settings'],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
