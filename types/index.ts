export type UserRole = 'subscriber' | 'admin';
export type SubStatus = 'active' | 'cancelled' | 'lapsed' | 'trialing';
export type SubPlan = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'paid' | 'rejected';
export type DrawStatus = 'draft' | 'simulated' | 'published';
export type DrawType = 'random' | 'algorithmic';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubPlan;
  status: SubStatus;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  charity_id?: string;
  charity_percentage: number;
  amount_cents: number;
  created_at: string;
    charities?: Charity | null;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  website_url?: string;
  featured: boolean;
  active: boolean;
  total_raised: number;
  created_at: string;
}

export interface Draw {
  id: string;
  month: string; // YYYY-MM
  status: DrawStatus;
  draw_type: DrawType;
  winning_numbers: number[];
  jackpot_amount: number;
  tier4_amount: number;
  tier3_amount: number;
  total_pool: number;
  participant_count: number;
  jackpot_rollover: boolean;
  published_at?: string;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores: number[];
  match_count: number;
  prize_amount: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: '5-match' | '4-match' | '3-match';
  prize_amount: number;
  proof_url?: string;
  payment_status: PaymentStatus;
  admin_notes?: string;
  verified_at?: string;
  paid_at?: string;
  created_at: string;
  // Joined
  profile?: Profile;
  draw?: Draw;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityRaised: number;
  monthlyRevenue: number;
}
