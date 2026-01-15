export type PlanType = 'FREE' | 'PREMIUM';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';

export type DownloadStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'ACTIVE' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  planType: PlanType;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Download {
  id: string;
  userId: string;
  videoUrl: string;
  videoTitle: string | null;
  videoDuration: number | null;
  videoResolution: string | null;
  fileSize: number | null;
  filePath: string | null;
  status: DownloadStatus;
  errorMessage: string | null;
  downloadedAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  brCode: string | null;
  qrCodeImage: string | null;
  paymentLinkUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  currency: string;
  billingCycle?: 'monthly' | 'yearly';
  savings?: string;
  features: string[];
  limits: {
    dailyDownloads: number;
    historySize: number;
    simultaneousDownloads?: number;
  };
}

export interface DownloadStats {
  planType: PlanType;
  dailyLimit: number;
  todayDownloads: number;
  remainingDownloads: number;
  totalDownloads: number;
  completedDownloads: number;
}

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface CreateDownloadRequest {
  videoUrl: string;
}

export interface CreatePaymentRequest {
  planType: 'PREMIUM';
  billingPeriod: 'monthly' | 'yearly';
  customerData: {
    name: string;
    taxID: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  payment: {
    id: string;
    amount: number;
    status: PaymentStatus;
    expiresAt: string | null;
  };
  qrCode: {
    brCode: string;
    qrCodeImage: string;
    paymentLinkUrl: string;
  };
  message: string;
}

export interface PaymentHistory extends Payment {
  subscription?: {
    planType: PlanType;
    startedAt: string;
    expiresAt: string | null;
  };
}

export interface UpcomingInvoice {
  dueDate: string;
  amount: number;
  status: string;
  description: string;
}
