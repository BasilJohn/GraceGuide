import {
    getConversationHistory,
    getDailyDevotional,
    getDailyScripture,
    getDailyVerse,
    getRecentCheckIns,
    listConversations,
    sendChatMessage,
    submitCheckIn,
} from '@/lib/appApi';
import {
    ChatMessageResponse,
    CheckInResponse,
    CheckInsListResponse,
    ConversationHistoryResponse,
    ConversationsListResponse,
    DailyDevotionalResponse,
    DailyScriptureResponse,
    DailyVerseResponse,
    Emotion,
    Tone
} from '@/types/types';
import { useCallback, useState } from 'react';

export const useGraceGuideAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check-In Methods
  const handleSubmitCheckIn = useCallback(async (
    emotions: Emotion[],
    tone: Tone,
    timestamp?: string
  ): Promise<CheckInResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await submitCheckIn({ emotions, tone, timestamp });
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to submit check-in';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetRecentCheckIns = useCallback(async (
    limit: number = 10,
    offset: number = 0
  ): Promise<CheckInsListResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecentCheckIns(limit, offset);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to fetch check-ins';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chat Methods
  const handleSendChatMessage = useCallback(async (
    message: string,
    conversationId?: string,
    includeContext: boolean = true
  ): Promise<ChatMessageResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendChatMessage({ message, conversationId, includeContext });
      return result;
    } catch (err: any) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        const errorMsg = `Rate limit exceeded. Please wait ${retryAfter} seconds.`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to send message';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetConversationHistory = useCallback(async (
    conversationId: string,
    limit: number = 50,
    before?: string
  ): Promise<ConversationHistoryResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConversationHistory(conversationId, limit, before);
      return result;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const errorMsg = 'Conversation not found';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch conversation';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleListConversations = useCallback(async (
    limit: number = 20,
    offset: number = 0
  ): Promise<ConversationsListResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await listConversations(limit, offset);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch conversations';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Daily Scripture Methods
  const handleGetDailyScripture = useCallback(async (): Promise<DailyScriptureResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyScripture();
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch daily scripture';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetDailyVerse = useCallback(async (): Promise<DailyVerseResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyVerse();
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch daily verse';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetDailyDevotional = useCallback(async (): Promise<DailyDevotionalResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyDevotional();
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch daily devotional';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    submitCheckIn: handleSubmitCheckIn,
    getRecentCheckIns: handleGetRecentCheckIns,
    sendChatMessage: handleSendChatMessage,
    getConversationHistory: handleGetConversationHistory,
    listConversations: handleListConversations,
    getDailyScripture: handleGetDailyScripture,
    getDailyVerse: handleGetDailyVerse,
    getDailyDevotional: handleGetDailyDevotional,
  };
};


