import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addStop, updateStop, deleteStop, addStopActivity, removeStopActivity } from '../api/tripsApi';
import { queryKeys } from '../api/queryKeys';

export function useAddStop(tripId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addStop(tripId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) }),
  });
}

export function useUpdateStop(tripId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, payload }) => updateStop(stopId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) }),
  });
}

export function useDeleteStop(tripId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId) => deleteStop(stopId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) }),
  });
}

export function useAddStopActivity(tripId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, payload }) => addStopActivity(stopId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) }),
  });
}

export function useRemoveStopActivity(tripId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopActivityId) => removeStopActivity(stopActivityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) }),
  });
}
