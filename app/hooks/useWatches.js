import { useQuery } from '@tanstack/react-query';
import { fetchWatches } from '../lib/supabaseClient';

export const watchesQueryKey = ['watches'];

export const useWatches = () =>
   useQuery({
      queryKey: watchesQueryKey,
      queryFn: fetchWatches,
      staleTime: 1000 * 60 * 5,
   });
