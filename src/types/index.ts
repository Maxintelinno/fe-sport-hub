export type UserRole = 'cust' | 'owner';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  accessToken?: string;
}

export interface FieldImage {
  id: string;
  field_id: string;
  object_key: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
}

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  sport_type: string;
  price_per_hour: number;
  open_time: string;
  close_time: string;
  province: string;
  district: string;
  address_line: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  images: FieldImage[];
  // Compatibility fields for mock data/existing UI
  address?: string; 
  sportType?: string;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
}

export interface Booking {
  id: string;
  venueId: string;
  venueName?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

