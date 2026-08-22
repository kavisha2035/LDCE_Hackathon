import { useQuery } from '@tanstack/react-query';
import { fetchCityActivities } from '../api/activitiesApi';
import { queryKeys } from '../api/queryKeys';

export function useCityActivities(cityId, params) {
  return useQuery({
    queryKey: queryKeys.cityActivities(cityId, params),
    queryFn: () => fetchCityActivities(cityId, params),
    enabled: !!cityId,
  });
}
