# Spark Fest 2026, demo app

A clickable demo of the student event platform. All four flows run in one app and share demo data.

## Demo logins

On the sign-in screen, enter one of these emails (or tap the matching "Demo logins" chip), press **Send code**, then type **any 6 digits**. Typing 000000 shows the wrong-code message.

| Email | Opens |
|---|---|
| student@mail.com | Student app: profile, checkout, QR pass, schedule, Q&A, certificates |
| volunteer@mail.com | Volunteer QR scanner |
| admin@mail.com | Master admin panel |
| influencer@mail.com | Ambassador dashboard |

Any other email, a phone number or "Continue with Google" opens the student app.

## A good demo run

1. **Student:** fill in the profile, then at checkout apply `RIYA10` (ambassador referral) or `SPARK20` and pay. Your pass and real QR appear.
2. In a **second tab**, sign in as **influencer@mail.com**. Your purchase shows up in Riya’s sign-ups.
3. Sign in as **volunteer@mail.com** and use "Demo: scan … pass" to check the student in. Try the same scan twice to see "Already redeemed", and the Perks station to see "Not your station".
4. As **admin@mail.com**: watch live scans and attendance, approve questions the student sent from Q&A, run the Lucky E-Dip stage screen, toggle volunteer stations and promo codes, then switch **Event is live** off to release certificates.
5. Back as the student, the Profile tab now lets you download a workshop certificate (for workshops saved to the schedule).

Data is stored in the browser (localStorage) and syncs across tabs in the same browser. "Reset demo data" on the student Profile tab restores the seed data.

## Placeholders to replace

The event name, dates, venue, prices (₹499 day pass, ₹799 creator pass), speakers and students are sample content.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Push this folder to a GitHub repo and import it in Vercel. Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). Or, with the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Not included (demo only)

No real backend, OTP delivery, payments or camera scanning. The QR codes are real and scannable. They encode the pass ID only, which a real backend would look up and validate.
