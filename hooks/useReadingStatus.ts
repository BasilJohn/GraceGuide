/**
 * React Query hook for managing daily reading status
 * Tracks scripture and devotional reading completion
 */

import {
  getReadingStatus,
  markDailyComplete,
  markDevotionalRead,
  markScriptureRead,
} from '@/lib/appApi';
import {
  MarkReadResponse,
  ReadingStatusResponse,
} from '@/types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for reading status
 */
export const readingStatusKeys = {
  all: ['readingStatus'] as const,
  status: () => [...readingStatusKeys.all, 'status'] as const,
};

/**
 * Fetch current reading status
 */
export function useReadingStatus() {
  return useQuery<ReadingStatusResponse, Error>({
    queryKey: readingStatusKeys.status(),
    queryFn: getReadingStatus,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}


/**
 * Mutation to mark scripture as read
 */
export function useMarkScriptureRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, Error, void>({
    mutationFn: markScriptureRead,
    onSuccess: () => {
      // Invalidate and refetch reading status
      queryClient.invalidateQueries({ queryKey: readingStatusKeys.status() });
    },
  });
}

/**
 * Mutation to mark devotional as read
 */
export function useMarkDevotionalRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, Error, void>({
    mutationFn: markDevotionalRead,
    onSuccess: () => {
      // Invalidate and refetch reading status
      queryClient.invalidateQueries({ queryKey: readingStatusKeys.status() });
    },
  });
}

/**
 * Mutation to mark both scripture and devotional as complete
 */
export function useMarkDailyComplete() {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, Error, void>({
    mutationFn: markDailyComplete,
    onSuccess: () => {
      // Invalidate and refetch reading status
      queryClient.invalidateQueries({ queryKey: readingStatusKeys.status() });
    },
  });
}
