export const queryKeys = {
  cities: (params) => ['cities', params],
  cityActivities: (cityId, params) => ['cityActivities', cityId, params],
  tripBudget: (tripId) => ['tripBudget', tripId],
  trip: (tripId) => ['trip', tripId],
};
