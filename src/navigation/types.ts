export type CustomerStackParamList = {
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { venueId: string; date: string; startTime: string; endTime: string };
    Payment: { bookingId: string; venueName: string; totalPrice: number };
    SportsInsights: undefined;
    Ads: undefined;
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
    VenueBookings: { venueId: string };
    Profile: undefined;
    RevenueDetail: undefined;
};
