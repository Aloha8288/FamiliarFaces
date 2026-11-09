# FamiliarFaces

A web app that provides relief for families and opportunities to students who want to give back to their community. 

For families affected by dementia, maintaining connections can be a difficult part of the process. Watching someone you love gradually lose their memory is an emotionally draining experience. There are many aspects of daily life that can get in the way of any free time someone has to visit a family member. In these situations, full-time caregivers are expensive, and nursing home volunteering isn’t always reliable. This is why we built FamiliarFaces.


##
## Table of Contents

- [Why Choose FamiliarFaces?](#why-choose-familiarfaces)
- [Our Features](#our-features)
- [How Our App Works](#how-our-app-works)
- [Compatibility Scoring](#compatibility-scoring)
- [How To Access Or Run It](#how-to-access-or-run-it)
- [Demo Walkthrough](#demo-walkthrough)
- [Tech Information](#tech-information)
- [Project Structure](#project-structure)
- [Limitations](#limitations)
- [Future Work](#future-work)
- [Supporting Materials](#supporting-materials)
- [Credits](#credits)


##
## Why Choose FamiliarFaces?

Traditional volunteering programs for elderly care exist, but they’re built around shifts rather than relationships: a volunteer comes for an hour, and next week it might be someone completely different. FamiliarFaces directly matches loved ones to student volunteers through our algorithm based on interests, compatibility, and availability, so that a familiar face keeps coming back. Families choose who visits, can follow along through a shared visit journal, and they approve every volunteer hour. 


##
## Our Features

### Signing in and making an account
- Create an account or sign in with an email and password
- If creating an account, you then choose a role of either **Student Volunteer** or **Family Member / Guardian**
- If returning to the app, you would be sent straight to the dashboard
##
### Onboarding for students
A 3-step process:

#### Step 1: Volunteer verification
- Student needs to upload a Vulnerable Sector Check file and complete a six lesson orientation that covers dementia awareness and safety, communication, privacy, and boundaries
#### Step 2: Creating a profile
- Student enters their full name, email, phone number, date of birth, school, program, school  year, and an optional profile photo
- They then fill out their interests, personality traits, and language skills
- Finally, they fill out their availability on a weekly schedule, customizing the times of day they are free, the number of visits per week, and the length of each visit they would prefer
#### Step 3: Terms and conditions
- Student must read the terms and conditions provided and check off the agreement box

##
### Onboarding for families
- User will need to fill out their contact details, and then the basic information of their loved one
- They then will fill out their interests, companion preferences, communication preferences, mobility, visit times, and topics that should be avoided

##
### Finding a companion or volunteer
- Families browse the dashboard for volunteers that are ranked by compatibility
- Shared interests and availability are shown
- Families can invite volunteers that they are interested in
- Volunteers browse the dashboard for patients in the same way
- They can send interest requests which go to the family for approval
- Invitations and requests can be then accepted, starting a Companion Commitment

##
### Companion commitment
- Once a volunteer is committed to a patient, they are now companions
- A commitment card will show the match, the date the match happened, the weekly visit goals, the number of visits completed that week, what day the next visit is, the total number of visits, and the number of approved hours
- Past visits will be stored in visit history

##
### How visits, check-ins, and hours work
- Visits get scheduled based on suggested times related to both people's availability
- When volunteers check in, they start a visit timer
- When volunteers check out, they gain access to the visit log and have a record of this meeting
- Once a visit is complete, families have the option to then approve, dispute, or add a note to the volunteers visit. 
##
### Visit journaling
- Using the visit log, students can make notes of what they talked about in their meeting sessions after it takes place
- They can record how the patient seemed and what they enjoyed
- This allows them to maintain a record of things to keep in mind for future sessions
- Families also gain access to this
##
### Maintaining privacy
- When the family adds the topics to avoid section to their loved ones profile, students do not get access to this right away
- They gain access once the family has accepted them as a companion
- The private notes a family makes are only visible to that family.
- Any medical details will never be used in calculating the compatibility score

##
## How Our App Works
```
Student:  Sign up → Verify (VSC + training) → Build profile → Find a Companion
          → Request → Accepted → Schedule → Check in / out → Journal → Hours approved
 
Family:   Sign up → Create loved one's profile → Find a Volunteer or review requests
          → Accept → Follow visits & journal → Approve hours
```
##
## Compatibility Scoring
Every match up receives a score from 0 to 100 depending on how compatible they are. 
- Shared interests are worth 30%
- Preferred companion personalities are worth 25%
- Scheduling is worth 20%
- Shared languages are worth 15%
- Visit preferences are worth 10%
- Any missing information receives a neutral score of 60%, so that unfinished profiles are not automatically flagged as bad matches
- Scoring code can be found in `src/lib/matching.ts`

##
## How To Access Or Run It
### Open the live demo 
 
Go to **[aloha8288.github.io/FamiliarFaces](https://aloha8288.github.io/FamiliarFaces/)** in a browser, on a computer or a phone. No install or account setup is needed: any email and password creates an account.

##
### Deployment
 
The live site is published with GitHub Pages using the workflow in `.github/workflows/`. Each push to the main branch rebuilds and republishes the site.

##
## Demo Walkthrough
There are no premade accounts. Any email and password creates one.
 
1. **Create Account** → **Student Volunteer** → complete verification, your profile, and the terms.
2. **Find a Companion**: Margaret is shown first. Click **Request Companion**.
3. On **My Commitment**, click **Simulate Acceptance**. The Companion Commitment begins.
4. **Visits & Hours** → pick a suggested time → **Schedule**, then **Check In**, fill in the journal, and **Check Out & Log Visit**. The commitment bar shows **1 of 2 visits (50%)**.
5. In the Completed list, click **Simulate Approval** to approve the hours.
6. Sign out, create an account as **Family Member / Guardian**, and set up a loved one. **Find a Volunteer** → **Invite** → **Simulate Acceptance**.
7. **Account Settings → Reset App Data** starts everything over.

##
## Tech Information

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Icons | Lucide |
| Fonts | Fredoka (headings) and Inter (body), via Fontsource |
| Data | Browser `localStorage` (no backend or API keys) |
| Hosting | GitHub Pages |

##
## Project Structure
```
src/
├── App.tsx            # Routes and sign-in / onboarding checks
├── main.tsx           # App entry point
├── index.css          # Colour theme and base styles
├── components/        # Shared pieces: sidebar, cards, buttons, journal, schedule editor
├── lib/
│   ├── matching.ts    # Compatibility scoring
│   ├── store.tsx      # App data and actions, saved in the browser
│   ├── residents.ts   # Fictional resident profiles
│   ├── seed.ts        # Starting data and fictional volunteers
│   └── ...            # Types, options lists, date and time helpers
└── pages/
    ├── student/       # Student screens
    ├── family/        # Family screens
    └── ...            # Sign-in, role choice, settings, support
```

##
## Limitations
FamiliarFaces was built in one hackathon weekend as a demo, so some parts are simulated:
- Sign in is not secure
- VSC uploads are not verified, so no background check is actually being done
- Simulate buttons are stand ins for the other side, so the patients and volunteers are not real and acceptances are simulated
- Data is kept on one device

##
## Future Work
- A real app instead of a web app
- Collaborate with nursing homes
- Become affiliated with the University of Alberta, as a club, in order to have valid and approved volunteer hours
- A real backend with secure accounts and data shared across device
- QR or location-based check-in at the front desk of nursing homes

##
## Supporting Materials

| Material | Link |
|----------|------|
| 🌐 Demo link | [aloha8288.github.io/FamiliarFaces](https://aloha8288.github.io/FamiliarFaces/) |
| 📊 Presentation slides | [View slides](https://canva.link/a1fc907wcg1ij14) |
| 💻 Source code | [github.com/Aloha8288/FamiliarFaces](https://github.com/Aloha8288/FamiliarFaces) |
| 📹 Demo video | [View video](https://www.youtube.com/watch?v=LUbTO9jyi-c&feature=youtu.be) |

##
## Credits
### Team
Addison Van Oostrom

Adria Ybema

Lainey Choma

Madeleine Wilson

Mariya Fedorova
##
### Open-Source Tools
 
- [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), and [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [React Router](https://reactrouter.com) for navigation
- [Lucide](https://lucide.dev) icons
- [Fredoka](https://fonts.google.com/specimen/Fredoka) and [Inter](https://rsms.me/inter/) fonts, via [Fontsource](https://fontsource.org)
- Hosted on [GitHub Pages](https://pages.github.com)
##
### Development Assistance
 
Code was written with help from Claude (Anthropic), an AI assistant, during the hackathon.
## 
### Content
 
All residents, volunteers, and families in the app are fictional. The complete app will be functional for real families to use.
