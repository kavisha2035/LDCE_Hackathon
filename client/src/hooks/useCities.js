import { useQuery } from '@tanstack/react-query';
import { fetchCities } from '../api/citiesApi';
import { queryKeys } from '../api/queryKeys';

export function useCities(params) {
  return useQuery({
    queryKey: queryKeys.cities(params),
    queryFn: () => fetchCities(params),
    placeholderData: (prev) => prev,
  });
}
