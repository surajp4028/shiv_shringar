# Shiv Shringar Sewa Samiti — Website

Prachin Hanuman Mandir, East Azad Nagar, Delhi 110051.
Next.js 16 + Aceternity UI + Resend + MySQL (Aiven).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Config is in `.env.local` (see `.env.example`).

## Admin

- URL: `/admin` (login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`)
- **Settings**: WhatsApp number, phone, email (contact form goes here), Instagram/YouTube, hero video, timings, announcements, mandir details.
- **Events, Videos, Darshan, Highlights, Yatra, Gallery, Timings**: add / edit / delete.
- **Messages**: contact form submissions (also emailed through Resend).

## Media

- Uploads from admin are saved in `public/uploads/images` and `public/uploads/videos`, served at `/files/...` (works after build too, with video range support).
- Video links: uploaded **MP4** or **YouTube** links autoplay muted with a sound button. **Instagram** reel links show a thumbnail and open the reel (Instagram doesn't allow autoplay embeds).
- Seed photos from Instagram are in `public/media/instagram`.

## Data

- MySQL tables `ss_settings` and `ss_items` are created and seeded automatically on first request (`src/lib/store.ts`, seed content in `src/data/seed.ts`).
- If MySQL can't be reached, the site falls back to `data/store.json`.
- Resend: with the `onboarding@resend.dev` sender, Resend only delivers to your own Resend account email. Verify a domain in Resend to send to any address.
