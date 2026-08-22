import { useQuery } from '@tanstack/react-query';
import { fetchTripBudget } from '../api/budgetApi';
import { queryKeys } from '../api/queryKeys';

export function useTripBudget(tripId) {
  return useQuery({
    queryKey: queryKeys.tripBudget(tripId),
    queryFn: () => fetchTripBudget(tripId),
    enabled: !!tripId,
  });
}
