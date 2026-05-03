import { useQuery } from '@tanstack/react-query';
import { fetchBrands } from '../lib/supabaseClient';

export const brandsQueryKey = ['brands'];

export const useBrands = (options = {}) =>
   useQuery({
      queryKey: brandsQueryKey,
      queryFn: fetchBrands,
      staleTime: 1000 * 60 * 10, // Brands don't change often
      ...options,
   });
