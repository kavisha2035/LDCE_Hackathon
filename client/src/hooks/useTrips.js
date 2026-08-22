import { useQuery } from '@tanstack/react-query';
import { fetchTrips } from '../api/tripsApi';
import { queryKeys } from '../api/queryKeys';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
  });
}
