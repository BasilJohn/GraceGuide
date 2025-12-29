import {
  AppleAuthResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  CheckInRequest,
  CheckInResponse,
  CheckInsListResponse,
  ConversationHistoryResponse,
  ConversationsListResponse,
  DailyDevotionalResponse,
  DailyScriptureResponse,
  DailyVerseResponse,
  GoogleAuthResponse,
  MarkReadResponse,
  ReadingStatusResponse,
  User,
} from "@/types/types";
import api from "./api";

// Auth APIs
export async function loginWithGoogle(
  token: string
): Promise<GoogleAuthResponse> {
  const response = await api.post<GoogleAuthResponse>(
    `auth/google`,
    { idToken: token },
    { skipAuth: true } // skip adding Authorization
  );
  return response.data;
}

export async function loginWithApple(
  token: string
): Promise<AppleAuthResponse> {
  const response = await api.post<AppleAuthResponse>(
    `auth/apple`,
    { identityToken: token },
    { skipAuth: true } // same idea — skip adding Authorization
  );
  return response.data;
}

export async function getUser(): Promise<User> {
  const response = await api.get<User>(`auth/getUser`);
  return response.data;
}

export async function deleteUserAccount(): Promise<void> {
  await api.delete(`auth/me`);
}

// Check-In APIs
export async function submitCheckIn(
  data: CheckInRequest
): Promise<CheckInResponse> {
  const endpoint = `api/checkin`;
  const fullUrl = `${api.defaults.baseURL}${endpoint}`;
  
  if (__DEV__) {
    console.log('Submitting check-in to:', fullUrl);
    console.log('Check-in data:', { emotions: data.emotions, tone: data.tone });
  }
  
  try {
    const response = await api.post<CheckInResponse>(
      endpoint,
      {
        emotions: data.emotions,
        tone: data.tone,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    );
    if (__DEV__) {
      console.log('Check-in submitted successfully:', response.data);
    }
    return response.data;
  } catch (error: any) {
    // Log more details for debugging
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      responseData: error.response?.data,
      url: fullUrl,
      baseURL: api.defaults.baseURL,
    };
    console.error('Check-in API error:', errorDetails);
    
    // Provide more helpful error message
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const networkError = new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    
    throw error;
  }
}

export async function getRecentCheckIns(
  limit: number = 10,
  offset: number = 0
): Promise<CheckInsListResponse> {
  const response = await api.get<CheckInsListResponse>(
    `api/checkin/recent`,
    {
      params: {
        limit,
        offset,
      },
    }
  );
  return response.data;
}

// Chat APIs
export async function sendChatMessage(
  data: ChatMessageRequest
): Promise<ChatMessageResponse> {
  const response = await api.post<ChatMessageResponse>(
    `api/chat/message`,
    {
      message: data.message,
      conversationId: data.conversationId,
      includeContext: data.includeContext !== undefined ? data.includeContext : true,
    }
  );
  return response.data;
}

export async function getConversationHistory(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<ConversationHistoryResponse> {
  const params: { limit: number; before?: string } = { limit };
  if (before) {
    params.before = before;
  }

  const response = await api.get<ConversationHistoryResponse>(
    `api/chat/conversation/${conversationId}`,
    { params }
  );
  return response.data;
}

export async function listConversations(
  limit: number = 20,
  offset: number = 0
): Promise<ConversationsListResponse> {
  const response = await api.get<ConversationsListResponse>(
    `api/chat/conversations`,
    {
      params: {
        limit,
        offset,
      },
    }
  );
  return response.data;
}

// Daily Scripture APIs (public, no authentication required)
export async function getDailyScripture(): Promise<DailyScriptureResponse> {
  const response = await api.get<DailyScriptureResponse>(
    `api/daily/scripture`,
    { skipAuth: true } // Public endpoint, no authentication required
  );
  return response.data;
}

export async function getDailyVerse(): Promise<DailyVerseResponse> {
  const response = await api.get<DailyVerseResponse>(
    `api/daily/scripture/verse`,
    { skipAuth: true } // Public endpoint, no authentication required
  );
  return response.data;
}

export async function getDailyDevotional(): Promise<DailyDevotionalResponse> {
  const response = await api.get<DailyDevotionalResponse>(
    `api/daily/devotional`,
    { skipAuth: true } // Public endpoint, no authentication required
  );
  return response.data;
}

// Daily Reading Status APIs (authentication required)
export async function markScriptureRead(): Promise<MarkReadResponse> {
  const response = await api.post<MarkReadResponse>(
    `api/daily/scripture/mark-read`
  );
  return response.data;
}

export async function markDevotionalRead(): Promise<MarkReadResponse> {
  const response = await api.post<MarkReadResponse>(
    `api/daily/devotional/mark-read`
  );
  return response.data;
}

export async function markDailyComplete(): Promise<MarkReadResponse> {
  const response = await api.post<MarkReadResponse>(
    `api/daily/mark-complete`
  );
  return response.data;
}

export async function getReadingStatus(): Promise<ReadingStatusResponse> {
  const response = await api.get<ReadingStatusResponse>(
    `api/daily/reading-status`
  );
  return response.data;
}


