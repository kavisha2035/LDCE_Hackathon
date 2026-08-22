import { useQuery } from '@tanstack/react-query';
import { fetchTrip } from '../api/tripsApi';
import { queryKeys } from '../api/queryKeys';

export function useTrip(tripId) {
  return useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: () => fetchTrip(tripId),
    enabled: !!tripId,
  });
}
