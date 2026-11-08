import type { CollectionName, Settings } from "@/lib/types";

export type FieldType = "text" | "textarea" | "date" | "number" | "bool" | "image" | "media" | "list" | "mediaList";

export type Field = { key: string; label: string; type: FieldType; hint?: string; required?: boolean };

export type Section = {
  id: CollectionName;
  label: string;
  singular: string;
  description: string;
  titleKey: string;
  imageKey?: string;
  subtitleKey?: string;
  fields: Field[];
  readOnly?: boolean;
};

export const sections: Section[] = [
  {
    id: "events",
    label: "Events",
    singular: "event",
    description: "Posts shown in the Events section. The one marked Featured appears large.",
    titleKey: "title",
    imageKey: "image",
    subtitleKey: "date",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "text", hint: "e.g. 7:00 PM – 9:00 PM" },
      { key: "location", label: "Location", type: "text" },
      { key: "image", label: "Cover photo / poster / video", type: "media" },
      { key: "gallery", label: "Event photos & videos (gallery)", type: "mediaList" },
      { key: "featured", label: "Featured (show big in Events)", type: "bool" },
      { key: "special", label: "Special showcase (own full-width section)", type: "bool" },
      { key: "route", label: "Route / programme (one stop per line, optional)", type: "list" },
    ],
  },
  {
    id: "videos",
    label: "Videos",
    singular: "video",
    description: "Uploaded MP4s and YouTube links autoplay (muted, with a sound button). Instagram reel links open the reel.",
    titleKey: "title",
    imageKey: "poster",
    subtitleKey: "category",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "url", label: "Video (upload, YouTube or Instagram link)", type: "media", required: true },
      { key: "poster", label: "Thumbnail (optional)", type: "image" },
      { key: "category", label: "Category", type: "text", hint: "Shringar, Aarti, Bhajan, Festival…" },
      { key: "featured", label: "Featured", type: "bool" },
    ],
  },
  {
    id: "shringar",
    label: "Darshan",
    singular: "shringar",
    description: "Each shringar darshan. The one with the latest date is shown as “Darshan of the Day” with its video and photo collage.",
    titleKey: "title",
    imageKey: "image",
    subtitleKey: "date",
    fields: [
      { key: "title", label: "Roop / title", type: "text", required: true, hint: "Mahakal Roop, Maa Durga Roop…" },
      { key: "deity", label: "Deity", type: "text", hint: "Mahadev, Mata Rani, Hanuman Ji…" },
      { key: "occasion", label: "Occasion", type: "text", hint: "Navratri Day 3, Somvar, Mahashivratri…" },
      { key: "date", label: "Date", type: "date", required: true, hint: "The latest date becomes Darshan of the Day" },
      { key: "image", label: "Main photo", type: "image", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "video", label: "Video (autoplays muted) — upload MP4 or YouTube link", type: "media" },
      { key: "gallery", label: "More photos (collage)", type: "mediaList" },
    ],
  },
  {
    id: "highlights",
    label: "Highlights",
    singular: "highlight",
    description: "Instagram-style story circles (Bhasm Aarti, Shivratri…). Add photos or videos to each.",
    titleKey: "title",
    imageKey: "cover",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "cover", label: "Cover photo", type: "image", required: true },
      { key: "media", label: "Story photos / videos", type: "mediaList" },
    ],
  },
  {
    id: "trips",
    label: "Yatra",
    singular: "yatra",
    description: "Trips shown on the Yatra map. Latitude/longitude draw the line from the mandir.",
    titleKey: "title",
    imageKey: "cover",
    subtitleKey: "place",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "place", label: "Place", type: "text", hint: "Ujjain, Madhya Pradesh" },
      { key: "date", label: "Date", type: "date" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "cover", label: "Cover photo", type: "image" },
      { key: "gallery", label: "Photos / videos", type: "mediaList" },
      { key: "spots", label: "Places visited (one per line)", type: "list" },
      { key: "lat", label: "Latitude", type: "number", hint: "Ujjain 23.1828" },
      { key: "lng", label: "Longitude", type: "number", hint: "Ujjain 75.7682" },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    singular: "photo",
    description: "Photos and short videos in the gallery, filterable by category.",
    titleKey: "title",
    imageKey: "src",
    subtitleKey: "category",
    fields: [
      { key: "title", label: "Caption", type: "text" },
      { key: "src", label: "Photo / video", type: "media", required: true },
      { key: "category", label: "Category", type: "text", hint: "Shiv Shringar, Mata Rani, Festivals…" },
    ],
  },
  {
    id: "schedule",
    label: "Timings",
    singular: "timing",
    description: "The daily programme timeline.",
    titleKey: "title",
    subtitleKey: "time",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "time", label: "Time", type: "text", required: true, hint: "9:00 PM" },
      { key: "day", label: "Day", type: "text", hint: "Daily, Somvar, Mangalvar…" },
      { key: "description", label: "Description", type: "text" },
    ],
  },
  {
    id: "messages",
    label: "Messages",
    singular: "message",
    description: "Contact form messages and seva / program requests (also emailed via Resend).",
    titleKey: "name",
    subtitleKey: "createdAt",
    readOnly: true,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
    ],
  },
];

export const settingsFields: { group: string; fields: (Field & { key: keyof Settings })[] }[] = [
  {
    group: "Contact & social",
    fields: [
      { key: "whatsapp", label: "WhatsApp number (with country code)", type: "text", hint: "917982624533" },
      { key: "phone", label: "Phone (display)", type: "text" },
      { key: "email", label: "Email (contact form messages go here)", type: "text" },
      { key: "instagram", label: "Instagram URL", type: "text" },
      { key: "youtube", label: "YouTube URL", type: "text" },
    ],
  },
  {
    group: "Hero",
    fields: [
      { key: "heroVideo", label: "Hero background video (upload MP4 or YouTube link)", type: "media" },
      { key: "heroImages", label: "Hero slideshow photos (used when no video)", type: "mediaList" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "heroSubtitle", label: "Intro text", type: "textarea" },
      { key: "darshanTime", label: "Shringar darshan time", type: "text" },
      { key: "aartiTime", label: "Shayan aarti time", type: "text" },
      { key: "announcement", label: "Scrolling announcements (one per line)", type: "list" },
    ],
  },
  {
    group: "Donation / Support the Seva",
    fields: [
      { key: "upiId", label: "UPI ID", type: "text", hint: "e.g. shivshringar@upi — leave empty to show only the WhatsApp button" },
      { key: "upiName", label: "UPI payee name", type: "text" },
      { key: "upiQr", label: "UPI QR code image", type: "image" },
      { key: "bankDetails", label: "Bank details (optional)", type: "textarea", hint: "Account name, number, IFSC — one per line" },
      { key: "donationNote", label: "Message shown on the donation card", type: "textarea" },
    ],
  },
  {
    group: "Mandir & samiti",
    fields: [
      { key: "samitiName", label: "Samiti name", type: "text" },
      { key: "templeName", label: "Mandir name", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "aboutText", label: "About text", type: "textarea" },
      { key: "mapLat", label: "Mandir latitude", type: "number" },
      { key: "mapLng", label: "Mandir longitude", type: "number" },
      { key: "mapUrl", label: "Google Maps link (for directions)", type: "text" },
    ],
  },
];
