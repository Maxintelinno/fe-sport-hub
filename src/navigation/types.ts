import { Venue } from '../types';

export type CustomerStackParamList = {
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { 
        venueId: string; 
        courtId: string; 
        courtName: string; 
        date: string; 
        startTime: string; 
        endTime: string;
        pricePerHour: number;
    };
    Payment: { bookingId: string; venueName: string; totalPrice: number };
    PaymentSuccess: { bookingId: string; venueName: string; totalPrice: number; paymentNo: string };
    SportsInsights: undefined;
    InsightDetail: { insightId: string };
    Ads: undefined;
    AllPromotions: undefined;
};

export type OwnerStackParamList = {
    // Public Screens
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { 
        venueId: string; 
        courtId: string; 
        courtName: string; 
        date: string; 
        startTime: string; 
        endTime: string;
        pricePerHour: number;
    };
    Payment: { bookingId: string; venueName: string; totalPrice: number };
    PaymentSuccess: { bookingId: string; venueName: string; totalPrice: number; paymentNo: string };
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
