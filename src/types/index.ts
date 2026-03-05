export type UserRole = 'customer' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  district?: string;
  province?: string;
  sportType: string;
  pricePerHour: number;
  ownerId: string;
  openingTime: string; // "08:00"
  closingTime: string; // "22:00"

  // Images
  imageUrl?: string; // legacy single image
  imageUrls?: string[]; // multiple images (local URI or remote URL)

  // Owner-only state (mock store)
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

