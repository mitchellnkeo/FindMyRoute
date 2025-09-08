# FindMyRoute (Working Title)

FindMyRoute is a mobile application designed to help runners discover safe, customizable routes in their area. The app focuses on providing routes tailored to runner preferences, with optional integration to Strava for personalized recommendations.

---

## 🚀 Purpose
Unlike typical fitness trackers, RunRoute is not meant to log every workout. Instead, it’s a **route discovery tool** that prioritizes safety, flexibility, and personalization — whether you want to explore new running paths, train for an event, or just find a scenic jog.

---

## ✨ MVP Features
1. **User Authentication & Profiles**
   - Firebase authentication (email/password, Google/Apple sign-in).
   - Optional Strava account linking for pulling run stats.
   - Manual input of run stats for users who don’t want Strava integration.

2. **Route Discovery**
   - Search for running routes in the user’s local area.
   - Filter routes by distance, difficulty, elevation gain, and surface type.
   - Map-based route visualization with details (distance, estimated duration).

3. **Route Filtering & Exploration**
   - Option to browse *all available routes* in the area with filters.
   - Save favorite routes to profile.

4. **Scalability & Good Practices**
   - TypeScript + React Native for a cross-platform mobile app.
   - Firebase for authentication, database, and hosting.
   - Modular and reusable components with unit testing (Jest).
   - CI/CD pipeline for automated builds and testing (e.g., GitHub Actions + Firebase App Distribution).

---

## 📈 Stretch Features (Post-MVP Roadmap)

### 🔥 Priority Stretch Features
1. **AI/ML Personalized Recommendations**
   - Use Strava-linked stats (or manually entered stats) to generate tailored route suggestions.
   - AI learns from user’s pace, mileage, and preferences (e.g., scenic vs. efficient).
   - Training plan integration (e.g., marathon prep, 5K beginner program).

2. **Advanced Route Filters**
   - Filters for terrain type (pavement, trail, mixed).
   - Safety-aware routes (avoid highways, unsafe areas).
   - Scenic points of interest (parks, waterfronts, city landmarks).
   - Weather-adjusted recommendations (e.g., shaded routes on hot days).
   - Accessible parking lot/street parking
   - Bathrooms available on route
   - Water stations

---

### 🛠 Secondary Stretch Features
- **Community & Social**
  - Share and discover community-created routes.
  - Like, comment, and save others’ routes.
  - Local leaderboards for popular routes.

- **Gamification**
  - Badges for milestones.
  - Route challenges (monthly/weekly goals).
  - Streak tracking.

- **Offline Mode**
  - Download routes to phone for offline navigation.
  - Basic turn-by-turn instructions.

- **Wearable & Platform Integrations**
  - Sync with Apple Watch, Garmin, Fitbit.
  - Export routes as GPX or to Strava.

- **Safety & Context Layers**
  - Safety score overlay based on street lighting, traffic, crime data.
  - Notifications for unsafe conditions on chosen routes.

---

## 🧑‍💻 Tech Stack
- **Frontend**: React Native + Expo + TypeScript + NativeWind
- **Backend**: Firebase (Auth, Firestore, Hosting, Functions)  
- **Mapping & Routing**: OpenStreetMap + OSRM (or GraphHopper)  
- **AI/ML**: Python microservice (FastAPI) or Firebase ML (for initial experiments)  
- **CI/CD**: GitHub Actions + Firebase App Distribution

---

## ⚙️ Development Flow
1. Set up Firebase project and link to the app.  
2. Scaffold React Native + Expo project with TypeScript.  
3. Implement authentication + profile system.  
4. Add map integration for route discovery.  
5. Add route filtering system.  
6. Expand with Strava integration for optional stats sync.  
7. Deploy with CI/CD pipeline.  
8. Stretch goals: AI/ML + advanced filters → community/social → gamification → offline mode.

---

## 🧪 Testing
- **Unit Tests**: Jest + React Native Testing Library for components.
- **Integration Tests**: End-to-end testing with Detox.
- **Continuous Testing**: Integrated into GitHub Actions pipeline.

---

## 💸 Budget Constraints
- Firebase Free Tier (Authentication, Firestore, Hosting).
- OpenStreetMap (free, community-supported).
- OSRM/GraphHopper self-hosted routing engine.
- Max budget: **< $100/mo** — app designed to run on free/low-cost tiers as long as possible.

---

## 🔮 Future Vision
RunRoute aims to scale to thousands of users by ensuring code reusability, scalable infrastructure, and modular features. The long-term vision is to be the **go-to platform for runners seeking safe, personalized, and adventurous running experiences**.

