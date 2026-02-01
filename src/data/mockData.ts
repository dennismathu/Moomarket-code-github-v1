
import { CowListing, User } from '../types/types';

export const MOCK_USERS: User[] = [
  {
    id: 'seller-01',
    name: 'Dennis Mathu',
    email: 'dennis@farm.co.ke',
    role: 'seller',
    is_verified_seller: true,
    is_phone_verified: true,
    is_id_verified: true,
    farm_name: 'Green Valleys Farm',
    listings_count: 5
  },
  {
    id: 'buyer-01',
    name: 'Alice Wanjiku',
    email: 'alice@buyer.com',
    role: 'buyer',
    is_verified_seller: false,
    is_phone_verified: true,
    is_id_verified: false
  },
  {
    id: 'admin-01',
    name: 'Platform Admin',
    email: 'admin@moomarket.ke',
    role: 'admin',
    is_verified_seller: false,
    is_phone_verified: true,
    is_id_verified: true
  }
];

export const MOCK_LISTINGS: CowListing[] = [
  {
    id: 'cow-01',
    breed: 'Friesian',
    age: 4,
    parity: 2,
    milking_start_date: '2024-11-15',
    is_pregnant: false,
    lactation_stage: 'Mid',
    milk_yield_last_7_days: [18, 19, 20, 21, 20, 22, 21],
    health: { vaccinated: true, dewormed: true },
    photos: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527153357827-7a9da8163b64?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800'
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    vet_verification: {
      verified: true,
      clinic: 'Kiambu Vet Clinic',
      date: '2025-01-12',
      report_url: 'https://example.com/report1.pdf'
    },
    location: 'Kiambu County',
    price: 240000,
    seller_id: 'seller-01',
    seller_name: 'Dennis Mathu',
    seller_farm: 'Green Valleys Farm',
    status: 'approved',
    createdAt: '2025-01-10'
  },
  {
    id: 'cow-02',
    breed: 'Ayrshire',
    age: 3,
    parity: 1,
    milking_start_date: '2024-12-20',
    is_pregnant: true,
    lactation_stage: 'Early',
    milk_yield_last_7_days: [15, 16, 17, 16, 18, 17, 18],
    health: { vaccinated: true, dewormed: false },
    photos: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800'
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    vet_verification: {
      verified: true,
      clinic: 'Nakuru Veterinary Services',
      date: '2025-01-14',
      report_url: 'https://example.com/report2.pdf'
    },
    location: 'Nakuru County',
    price: 185000,
    seller_id: 'seller-02',
    seller_name: 'Grace Muli',
    seller_farm: 'Muli Dairy',
    status: 'approved',
    createdAt: '2025-01-11'
  },
  {
    id: 'cow-03',
    breed: 'Jersey',
    age: 5,
    parity: 3,
    milking_start_date: '2024-08-01',
    is_pregnant: false,
    lactation_stage: 'Late',
    milk_yield_last_7_days: [12, 11, 13, 12, 12, 11, 12],
    health: { vaccinated: true, dewormed: true },
    photos: [
      'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1597401411516-724f79612f0f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563280027-2bfc69382f6e?auto=format&fit=crop&q=80&w=800'
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    vet_verification: {
      verified: false,
      clinic: '',
      date: ''
    },
    location: 'Nyeri County',
    price: 150000,
    seller_id: 'seller-01',
    seller_name: 'Dennis Mathu',
    seller_farm: 'Green Valleys Farm',
    status: 'pending',
    createdAt: '2025-01-15'
  }
];
