
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
  breed: string;
  age: number;
  parity: number; // Number of times given birth
  milking_start_date: string; // Date cow started getting milked
  is_pregnant: boolean;
  lactation_stage: string; 
  milk_yield_last_7_days: number[];
  health: HealthStatus;
  photos: string[];
  video: string;
  vet_verification: VetVerification;
  location: string;
  price: number;
  seller_id: string;
  seller_name: string;
  seller_farm: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'draft';
  createdAt: string;
}

export interface InspectionRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  preferred_date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  is_verified_seller: boolean;
  is_phone_verified: boolean;
  is_id_verified: boolean;
  farm_name?: string;
  listings_count?: number;
}
