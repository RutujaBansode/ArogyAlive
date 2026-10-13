# Arogya Live — Frontend

A healthcare access platform (frontend-only) built for a final-year B.Tech project. Guides patients through:

**Health Problem → Suitable Specialization → Nearby Hospital → Doctor Availability → Bed Availability → Appointment**

with multilingual voice/text input and emergency assistance.

## Tech Stack
React 18 • Vite • React Router 6 • Axios • Bootstrap 5 • Lucide React • Context API

## Getting Started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/     Reusable UI components (Navbar, HospitalCard, BedAvailability, VoiceAssistant, ...)
  context/        AuthContext, ThemeContext, AssistantContext
  data/           mockData.js — centralized mock/demo data
  hooks/          useSpeechRecognition — Web Speech API wrapper
  pages/          One file per route (Home, FindCare, Doctors, HospitalDetails, DoctorProfile,
                  Appointment, Emergency, Login, Register, and the four dashboards)
  services/       api.js + one service module per domain (hospitals, doctors, appointments,
                  emergency, beds, auth) — currently backed by mock data with simulated
                  network delay, structured so each can be swapped for a real Axios call to
                  the Spring Boot backend later (see the TODO(backend) comments in each file).
```

## Connecting the Real Backend Later

Every service module (`src/services/*.js`) already funnels through `src/services/api.js`,
which holds a configured Axios instance (`baseURL`, auth header interceptor). To switch a
service from mock data to the real API:

1. Set `VITE_API_BASE_URL` in a `.env` file to your Spring Boot server's URL.
2. In the relevant service file, replace the mock-data logic with an Axios call, e.g.
   `export function getAllHospitals() { return api.get('/hospitals').then(r => r.data); }`
3. No component code should need to change — they only call the service functions.

## Demo Login

The login page accepts any email/password and lets you pick a role (Patient, Doctor,
Receptionist, Admin) to preview each dashboard — this is mock authentication only.

## Notes

- Voice input uses the browser's Web Speech API (`SpeechRecognition` /
  `webkitSpeechRecognition`), which is currently best supported in Chromium-based browsers.
  The UI degrades gracefully (mic button disabled with an explanatory note) where it's
  unavailable.
- All hospital/doctor/bed/appointment data lives in `src/data/mockData.js` — edit it directly
  to change the demo dataset.
