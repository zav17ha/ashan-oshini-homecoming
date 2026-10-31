# Ashan & Oshini · Homecoming e-invitation (Next.js)

Homecoming · Friday 18 December 2026 · 7:00 PM · Senuri Grand Castello, Divulapitiya

This is a **separate project** from the wedding invitation. Deploy it as its own Vercel project, so it gets its own address, for example `ashan-oshini-homecoming.vercel.app`.

An animated homecoming invitation with a personal link for every guest, an RSVP form, and a private page for reading replies.

| Address | What it is |
|---|---|
| `/` | The invitation, addressed to "Our Beloved Guest" |
| `/i/<code>` | A guest's personal invitation. The code holds their name. |
| `/generator` | **Private.** Make guest links and send them on WhatsApp. |
| `/responses` | **Private, needs a password.** Every RSVP: who's coming, how many, their notes, and who hasn't replied. |

When you share a guest link on WhatsApp, the preview shows a picture of the two of you with that guest's name in gold.

## 1 · Put it online with Vercel

1. Create a **new** GitHub repository, for example `ashan-oshini-homecoming` (keep the wedding one as it is).
2. Upload everything in this folder to the repository ("Add file → Upload files").
3. Go to vercel.com, sign in with GitHub, choose **Add New → Project**, import the repository, and choose **Deploy**.
4. You get an address like `https://ashan-oshini-homecoming.vercel.app`.

## 2 · Turn on RSVPs (needed before you send invitations)

RSVP replies are saved in a small free database.

1. In this Vercel project, open the **Storage** tab and connect a database: **Upstash for Redis** (free plan).
   You can create a new one, or connect the same database the wedding uses: homecoming replies are stored separately, so the two lists never mix.
2. Open **Settings → Environment Variables** and add:
   - Name: `ADMIN_PASSWORD`
   - Value: a password only the two of you know (it can be the same as the wedding one)
3. Open **Deployments**, then on the latest deployment choose **⋯ → Redeploy** so the new settings take effect.
4. Test it: open your invitation, send a reply, then open `/responses` and enter your password. Use **Remove** to delete the test reply.

If a guest replies before the database is connected, they see a message asking them to contact you on WhatsApp, so no reply is lost without them knowing.

## 3 · Send the invitations
1. Open `https://YOUR-ADDRESS/generator`.
2. Paste guest names, one per line, and choose **Create links**.
3. For each guest you can **Copy link**, send by **WhatsApp** (opens WhatsApp with your message and their link), or **Preview** it.

The guest list is saved in that browser only. Open `/responses` on the **same** phone or computer to see who hasn't replied yet.

## Change details
- Names, date, time, venue and phone numbers: `lib/wedding.ts`
- Collage photos: `components/Collage.tsx`
- Photos: `public/images/`
- Colours: the top of `app/globals.css`

## Own domain (optional)
If you add a domain like `ashanandoshini.com` in Vercel → Settings → Domains, also add the environment variable
`NEXT_PUBLIC_SITE_URL` = `https://ashanandoshini.com` and redeploy, so the WhatsApp previews use it.

## Run it on your computer (optional)
```bash
npm install
```
```bash
ADMIN_PASSWORD=choose-one npm run dev
```
Then open http://localhost:3000. Without the database, replies are saved to `.data/rsvps.json` on your computer.
