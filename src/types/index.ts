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
  price_per_hour?: number;
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

export interface Court {
  id: string;
  field_id: string;
  name: string;
  price_per_hour: number;
  capacity?: number;
  court_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookedSlot {
  start_time: string;
  end_time: string;
  status: string;
}

export interface CourtAvailability {
  court_id: string;
  court_name: string;
  price_per_hour: number;
  booked_slots: BookedSlot[];
}

export interface FieldAvailability {
  field_id: string;
  date: string;
  open_time: string;
  close_time: string;
  courts: CourtAvailability[];
}

export interface BookingItem {
  id: string;
  booking_id: string;
  field_id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  total_amount: number;
  status: string;
}

export interface Booking {
  id: string;
  booking_no: string;
  user_id: string;
  field_id: string;
  booking_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  note?: string;
  created_at: string;
  updated_at: string;
  items: BookingItem[];
  // Legacy compatibility
  venueId?: string;
  venueName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  totalPrice?: number;
}

