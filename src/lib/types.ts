export type Settings = {
  siteName: string;
  samitiName: string;
  templeName: string;
  address: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideo: string;
  heroImages: string[];
  darshanTime: string;
  aartiTime: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  youtube: string;
  announcement: string[];
  aboutText: string;
  mapLat: number;
  mapLng: number;
  mapUrl: string;
  upiId: string;
  upiName: string;
  upiQr: string;
  bankDetails: string;
  donationNote: string;
};

type Base = { id: string; createdAt: string };

export type EventItem = Base & {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  /** Extra photos / videos shown in the event's gallery. */
  gallery: string[];
  featured: boolean;
  /** Shown as a full-width showcase (e.g. Shobha Yatra, Amarnath). */
  special?: boolean;
  /** Optional procession route / programme, one stop per line. */
  route?: string[];
};

export type VideoItem = Base & {
  title: string;
  url: string;
  poster: string;
  category: string;
  featured: boolean;
};

export type ShringarItem = Base & {
  title: string;
  deity: string;
  occasion: string;
  date: string;
  image: string;
  description: string;
  /** Extra photos shown as a collage. */
  gallery?: string[];
  /** Optional video that autoplays (muted) in Darshan of the Day. */
  video?: string;
};

export type HighlightItem = Base & {
  title: string;
  cover: string;
  media: string[];
};

export type TripItem = Base & {
  title: string;
  place: string;
  date: string;
  description: string;
  cover: string;
  gallery: string[];
  spots: string[];
  lat: number;
  lng: number;
};

export type GalleryItem = Base & {
  title: string;
  src: string;
  category: string;
};

export type ScheduleItem = Base & {
  title: string;
  time: string;
  day: string;
  description: string;
};

export type MessageItem = Base & {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Set when the message came from the "Request a Seva" form. */
  type?: string;
  preferredDate?: string;
};

export type Collections = {
  events: EventItem;
  videos: VideoItem;
  shringar: ShringarItem;
  highlights: HighlightItem;
  trips: TripItem;
  gallery: GalleryItem;
  schedule: ScheduleItem;
  messages: MessageItem;
};

export type CollectionName = keyof Collections;

export const COLLECTIONS: CollectionName[] = [
  "events",
  "videos",
  "shringar",
  "highlights",
  "trips",
  "gallery",
  "schedule",
  "messages",
];

export type SiteData = {
  settings: Settings;
  events: EventItem[];
  videos: VideoItem[];
  shringar: ShringarItem[];
  highlights: HighlightItem[];
  trips: TripItem[];
  gallery: GalleryItem[];
  schedule: ScheduleItem[];
};
