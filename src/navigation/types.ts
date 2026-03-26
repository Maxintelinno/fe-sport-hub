import { Venue } from '../types';

export type CustomerStackParamList = {
    VenueList: undefined;
    VenueDetail: { venueId: string };
    BookingForm: { 
        venueId: string; 
        courtId: string; 
        courtName: string; 
        date: string; 
        selectedSlots: { start: string, end: string, label: string }[];
        pricePerHour: number;
    };
    Payment: { bookingId: string; venueName: string; totalPrice: number; bookingNo: string };
    PaymentSuccess: { bookingId: string; venueName: string; totalPrice: number; paymentNo: string; bookingNo: string };
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
        selectedSlots: { start: string, end: string, label: string }[];
        pricePerHour: number;
    };
    Payment: { bookingId: string; venueName: string; totalPrice: number; bookingNo: string };
    PaymentSuccess: { bookingId: string; venueName: string; totalPrice: number; paymentNo: string; bookingNo: string };
    SportsInsights: undefined;
    InsightDetail: { insightId: string };
    Ads: undefined;
    AllPromotions: undefined;
    OwnerHome: undefined;
    // Owner Management
    MyVenues: undefined;
    AddVenue: undefined;
    AddCourts: { fieldId: string; fieldName: string };
    EditVenue: { venue: Venue };
    VenueBookings: { venueId: string };
    Profile: undefined;
    BankAccounts: undefined;
    AddBankAccount: undefined;
    EditBankAccount: { account: any };
    Withdraw: undefined;
    WithdrawSuccess: { amount: number; netAmount: number; bankName: string; accountNumber: string };
    RevenueDetail: undefined;
    UpgradePlan: undefined;
    UpgradePayment: { planName: string; price: number };
    UpgradeSuccess: { planName: string; paymentNo: string };
    ConfirmTrial: undefined;
    TrialSuccess: { expiryDate: string };
};
