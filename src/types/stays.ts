// Airbnb — formes renvoyées par l'API (docs/API_CONTRACT.md §15).
// Dates de séjour "AAAA-MM-JJ", montants en centimes.

export type ListingType = "APARTMENT" | "HOUSE" | "STUDIO" | "ROOM" | "VILLA";
export type ListingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

export type Listing = {
  id: string;
  title: string;
  description: string | null;
  type: ListingType;
  status: ListingStatus;
  city: string;
  address: string | null;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  nightlyPrice: number;
  cleaningFee: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  photos: string[];
  houseRules: string | null;
  photoCount?: number;
};

export type ListingInput = Omit<Listing, "id" | "photoCount" | "description" | "address" | "houseRules"> & {
  description?: string;
  address?: string;
  houseRules?: string;
};

export type DateRange = { start: string; end: string };

export type PublicListing = Omit<Listing, "status" | "photoCount"> & { unavailable?: DateRange[] };

export type StayQuote = {
  nights: number;
  nightlyPrice: number;
  cleaningFee: number;
  subtotal: number;
  tax: number;
  total: number;
  available: boolean;
};

// Dates renvoyées en ISO (colonnes DATE) : "2026-11-05T00:00:00.000Z".
export type Booking = {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  customerName: string | null;
  customerPhone: string;
  customerEmail: string | null;
  note: string | null;
  listingId: string;
  listing?: { id: string; title: string; city: string };
  order?: { orderNumber: string; paymentStatus: string; total: number; tax: number };
};

export type ListingBlock = { id: string; startDate: string; endDate: string; reason: string | null };

export type BookingResult = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  booking: { id: string; checkIn: string; checkOut: string; nights: number; guests: number } | null;
};

export type StayStats = {
  publishedListings: number;
  inHouse: number;
  upcomingBookings: number;
  revenueThisMonth: number;
  occupancyNext30: number;
  arrivalsToday: Booking[];
  departuresToday: Booking[];
};
