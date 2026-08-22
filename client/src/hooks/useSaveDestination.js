import { useMutation } from '@tanstack/react-query';
import { saveDestination } from '../api/citiesApi';
import { useToast } from '../lib/ToastContext';

export function useSaveDestination() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (cityId) => saveDestination(cityId),
    onSuccess: () => showToast('Saved to your destinations.'),
    onError: () => showToast('Could not save that city — try again.', 'error'),
  });
}
