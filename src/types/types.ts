
export interface HealthStatus {
  vaccinated: boolean;
  dewormed: boolean;
}

export interface VetVerification {
  verified: boolean;
  clinic: string;
  date: string;
  report_url?: string; // Presence of this triggers the Vet Badge
}

export interface CowListing {
  id: string;
  seller_id: string;
  breed: string;
  age: number;
  parity: number;
  price: number;
  milking_start_date: string | null;
  lactation_stage: 'Early' | 'Mid' | 'Late' | 'Dry' | null;
  is_pregnant: boolean;
  expected_calving_date: string | null;
  milk_yield_day_1: number | null;
  milk_yield_day_2: number | null;
  milk_yield_day_3: number | null;
  milk_yield_day_4: number | null;
  milk_yield_day_5: number | null;
  milk_yield_day_6: number | null;
  milk_yield_day_7: number | null;
  avg_milk_yield: number;
  is_vaccinated: boolean;
  is_dewormed: boolean;
  last_vaccination_date: string | null;
  last_deworming_date: string | null;
  county: string;
  specific_location: string;
  latitude: number | null;
  longitude: number | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sold';
  view_count: number;
  inquiry_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  // Join fields or Mock fields
  media?: { media_url: string; media_type: string }[];
  photos?: string[];
}

export interface InspectionRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer?: { full_name: string };
  preferred_date: string;
  status: 'pending' | 'confirmed' | 'completed';
  rescheduled_by?: 'buyer' | 'seller' | null;
  listing?: Partial<CowListing>;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  phone_number: string | null;
  full_name: string;
  role: 'buyer' | 'seller' | 'admin';
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_id_verified: boolean;
  avatar_url: string | null;
  county: string | null;
  specific_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFeedback {
  id: string;
  user_id: string | null;
  type: 'bug_report' | 'feature_idea' | 'other';
  description: string;
  screenshot_url: string | null;
  is_anonymous: boolean;
  user_email: string | null;
  created_at: string;
}
