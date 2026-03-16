import { Venue } from '../types';

export type CustomerStackParamList = {
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { venueId: string; date: string; startTime: string; endTime: string };
    Payment: { bookingId: string; venueName: string; totalPrice: number };
    SportsInsights: undefined;
    InsightDetail: { insightId: string };
    Ads: undefined;
    AllPromotions: undefined;
};

export type OwnerStackParamList = {
    // Public Screens
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { venueId: string; date: string; startTime: string; endTime: string };
    Payment: { bookingId: string; venueName: string; totalPrice: number };
    SportsInsights: undefined;
    // Owner Management
    MyVenues: undefined;
    AddVenue: undefined;
    AddCourts: { fieldId: string; fieldName: string };
    EditVenue: { venue: Venue };
    VenueBookings: { venueId: string };
    Profile: undefined;
    RevenueDetail: undefined;
};
