export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isPremium?: boolean;
  premiumExpiresAt?: string | null; // ISO date string
  subscriptionTier?: "free" | "premium" | null;
  subscriptionStatus?: "active" | "expired" | "cancelled" | null;
  revenueCatUserId?: string | null;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  signIn: (user: User, tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export type GoogleAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export interface AppleAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    appleId?: string; // optional unique identifier from Apple
  };
  accessToken: string;
  refreshToken?: string;
}

