import { Venue } from '../types';
import { MOCK_VENUES } from './mockVenues';

let ownerVenues: Venue[] = [];

export function getAllVenues(): Venue[] {
  return [...MOCK_VENUES, ...ownerVenues];
}

export function getVenuesByOwner(ownerId: string): Venue[] {
  return [...MOCK_VENUES, ...ownerVenues].filter((v) => v.owner_id === ownerId);
}

export function addVenue(venue: Omit<Venue, 'id'>): Venue {
  const newVenue: Venue = {
    ...venue,
    id: String(Date.now()),
    isActive: venue.isActive !== undefined ? venue.isActive : true,
  };
  ownerVenues.push(newVenue);
  return newVenue;
}

export function getVenueById(id: string): Venue | undefined {
  return getAllVenues().find((v) => v.id === id);
}

export function toggleVenueStatus(venueId: string): boolean {
  const venue = ownerVenues.find((v) => v.id === venueId);
  if (venue) {
    venue.isActive = venue.isActive === false ? true : false;
    return venue.isActive;
  }
  return false;
}
