/**
 * React Query hook for fetching daily scripture data
 * Provides automatic caching, refetching, and error handling
 */

import { getDailyDevotional, getDailyScripture, getDailyVerse } from '@/lib/appApi';
import {
    DailyDevotionalResponse,
    DailyScriptureResponse,
    DailyVerseResponse,
} from '@/types/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Query key factory for daily scripture queries
 */
export const dailyScriptureKeys = {
  all: ['dailyScripture'] as const,
  scripture: () => [...dailyScriptureKeys.all, 'scripture'] as const,
  verse: () => [...dailyScriptureKeys.all, 'verse'] as const,
  devotional: () => [...dailyScriptureKeys.all, 'devotional'] as const,
};

/**
 * Fetch complete daily scripture (verse + devotional)
 * Cache duration: 24 hours (staleTime) since content changes daily
 */
export function useDailyScripture() {
  return useQuery<DailyScriptureResponse, Error>({
    queryKey: dailyScriptureKeys.scripture(),
    queryFn: getDailyScripture,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - content changes daily
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Fetch daily verse only (without devotional)
 */
export function useDailyVerse() {
  return useQuery<DailyVerseResponse, Error>({
    queryKey: dailyScriptureKeys.verse(),
    queryFn: getDailyVerse,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Fetch daily devotional only
 */
export function useDailyDevotional() {
  return useQuery<DailyDevotionalResponse, Error>({
    queryKey: dailyScriptureKeys.devotional(),
    queryFn: getDailyDevotional,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}
