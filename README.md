# FamiliarFaces

Consistent, long-term companionship between university student volunteers and older adults in care homes.
Typography: Fredoka (headings and UI) with Inter (body). Built with React, TypeScript, Vite, Tailwind CSS, and Lucide icons. All data is stored in the browser's local storage — no accounts, API keys, or databases needed.

## Publish on Netlify (easiest — no coding)

1. Go to **https://app.netlify.com/drop** and sign in (free).
2. Drag the **`dist`** folder from this project onto the page.
3. Netlify gives you a live link in a few seconds. Done.

The `dist` folder already includes the `_redirects` file, so links like `/student/find` work after refresh.

### Alternative: connect a GitHub repo
Push this folder to GitHub, then in Netlify choose **Add new site → Import an existing project**.
`netlify.toml` already sets the build command (`npm run build`) and publish folder (`dist`).

## Run locally

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm run build    # production build into dist/
```

## Demo walkthrough for judges (about 3 minutes)

Any email and password signs you in. Sign in as alex@familiarfaces.ca or sarah@familiarfaces.ca (any password), and switch between them from the top-right menu:
- **Alex Rivera** — Student Volunteer
- **Sarah Thompson** — Family Member (daughter of resident **Margaret**)

1. *(Optional)* **Get Started** → register a new student to show verification (VSC upload, training), 18+ check, interests, availability, and terms.
2. Sign in as **Alex** → **Find a Companion**. Residents are ranked by compatibility; Margaret is the top match.
3. **Request Companion** on Margaret → **Respond as Sarah** (switches accounts) → **Accept Companion**.
4. Switch back to Alex (top-right menu) → **Visits & Hours** → pick a suggested time → **Schedule**.
5. **Check In** to check in → **Check Out & Log Visit**. The dashboard commitment bar shows **1 of 2 visits — 50%**.
6. Switch to Sarah → **Visits & Approvals** → **Approve Hours**. Alex's approved hours update immediately.

After a visit, students can write a **Journal** entry (also offered at check-out): what they talked about, what their companion enjoyed, and their mood. Families read it under **Journal**.

Families can also search for volunteers: as Sarah, open **Find a Volunteer** → **Invite** a student. Use **Respond as Alex** (for Alex) or **Simulate Acceptance** (for the fictional volunteers).
7. **Account Settings → Reset App Data** to start over.

## Matching algorithm

`src/lib/matching.ts` — deterministic and explainable:
Shared Interests 30% · Preferred Companion Personality 25% · Schedule 20% · Shared Languages 15% · Visit Preferences 10%.
Missing information is scored neutrally, and medical details, mobility, and topics to avoid are never used.

## Honest limitations

This is a self-contained demonstration: sign-ins are not secure, VSC documents are never uploaded or verified,
and QR check-in records times but does not verify location. All people and residents are fictional.
