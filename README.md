# KaviosPix — Frontend 📸

> Your memories, beautifully organized.

A photo management web app built with React, Redux Toolkit, and Tailwind CSS. Think Google Photos, but built by one person who learned a lot about cookies along the way.

**Backend Repo:** [KaviosPix Backend](https://github.com/Rakeshneopane/kaviosPix-backend)

---

## Login

This app uses **Google OAuth** for authentication.
Click **"Continue with Google"** and sign in with any Google account to access the app.

---

## Demo


**Live App:** [KaviosPix](https://image-app-frontend-mu.vercel.app) <br>
🎥 **Loom Walkthrough:** [Watch Here](https://www.loom.com/share/495070d7ed004cb2a41547d0b2c2fdaa)

---

## API Reference

This is the frontend repository. For full API documentation, including all routes and sample responses, see the [Backend Repository](https://github.com/Rakeshneopane/kaviosPix-backend).

---

## The Honest Story

I started this project thinking the backend would be the hard part.

I was wrong.

The backend took about a week. The frontend took six weeks. Not because React is hard — but because the frontend is where all the invisible problems live.

The cookie that works on localhost but disappears in production. The Redux state resets because Google OAuth triggers a full-page reload — not client-side navigation; a real browser reload resets everything. The hook placed after an early return silently does nothing because React's rules of hooks are not suggestions.

**The bug that cost me four days:**

The first login worked perfectly. The user appeared on the dashboard. Everything looked fine. Then I refreshed the page.

Gone. Redux empty. Redirected to login. Every single time.

I spent two days convinced it was CORS. Changed sameSite settings. Rewrote the auth middleware. Added `withCredentials` everywhere. Nothing worked.

The actual problem? Two bugs stacked on top of each other.

**Bug 1 — Redux resets on full page reload.**  
When Google redirects back to my app, that's a full browser reload — not client-side navigation. The Redux store starts fresh. `GoogleCallbackPage` was the only place I dispatched `fetchUser`. So it worked once. Never again on refresh.

Fix: Move `fetchUser` into `ProtectedRoute`. Every time a protected page loads, if the store is empty, fetch the user. The httpOnly cookie is still in the browser — `/me` works — user comes back.

**Bug 2 — Hook after early return.**  
My `ProtectedRoute` returned early before reaching the `useEffect`. React never got to the hook. `fetchUser` was never dispatched.

```jsx
// this never runs
if (status === "loading") return <div>Loading...</div>;
useEffect(() => dispatch(fetchUser()), []); // ← React never reaches this
```

Fix: hooks are always above early returns. Always.

Four days. Two bugs. One lesson I will never forget: ** HTTP-only cookies persist across reloads. Redux does not.**

---

## Features

- 🔐 **Google OAuth2** — No passwords. No password reset flows. Just Google.
- 📁 **Album Management** — Create, edit, delete. Share with other users by email.
- 📤 **Bulk Image Upload** — Multiple images at once, with tags, people, and favorite marking
- 🖼️ **Image Gallery** — Search by name or tag, sort by date or favorites
- ❤️ **Favorites Tab** — Because some photos deserve their own tab
- 💬 **Comments** — Per image, with live updates
- 📥 **Download** — One click, your image, your device
- 👥 **Permission Control** — Shared users can view but not upload, delete, or share
- 🔄 **Silent Token Refresh** — Axios interceptor handles JWT expiry. Users never see a 401.
- 📱 **Responsive** — Mobile and desktop

---

## Tech Stack

| Thing | Why |
|-------|-----|
| React 18 | UI |
| Redux Toolkit | State management — slices keep things organized |
| React Router v6 | Client-side routing |
| Tailwind CSS | Fast styling without context switching |
| shadcn/ui | Consistent components without fighting a design system |
| Axios + Interceptors | HTTP client with silent token refresh on 401 |
| Vite | Fast builds, fast HMR (mostly — Windows has opinions about filename casing) |
| Sonner | Toast notifications that don't get in the way |
| Lucide React | Icons |

---

## Project Structure

```
src/
├── assets/              # Static images
├── components/
│   ├── albums/          # AlbumCard, AlbumDetailsPage, AlbumSection, AlbumsPage, EditAlbumDialog, FeaturedAlbum
│   ├── images/          # ImageCard, ImageGallery, ImageModal, ImageUploader, FavoriteImages
│   ├── modals/          # UploadModal, CreateAlbumModal
│   ├── navbar/          # Navbar with logout dialog
│   ├── Footer/          # Footer
│   └── ui/              # shadcn/ui components
├── lib/                 # shadcn utilities
├── pages/               # DashBoardPage, GoogleCallbackPage, LoginPage
├── routes/              # ProtectedRoute
├── store/
│   ├── slices/
│   │   ├── albumSlice.js   # album CRUD + clearAlbumStatus
│   │   ├── authSlice.js    # user auth state (fetchUser, logoutUser)
│   │   └── imageSlice.js   # image CRUD + favorites + comments
│   └── store.js
└── utils/
    └── axiosInstance.js    # Axios with silent refresh interceptor
```

---

## The Auth Flow (Because It Matters)

```
User clicks "Continue with Google"
  → window.location.href = backend/auth/google  (full page leave)
  → Google consent screen
  → Google redirects to backend/auth/google/callback
  → Backend sets two HttpOnly cookies:
      jwt_token     (15 min access token)
      refresh_token (7-day refresh token)
  → Backend redirects to frontend/v1/profile/google
  → GoogleCallbackPage: navigate("/dashboard")
  → ProtectedRoute: userStatus === "idle" → dispatch(fetchUser())
  → Cookie sent automatically → /auth/me returns user → Redux populated
  → Dashboard renders
```

**On token expiry:**
```
Request → 401
  → Axios interceptor catches it
  → POST /auth/refresh (refresh_token cookie sent automatically)
  → New jwt_token cookie set
  → Original request retried
  → User sees nothing
```

**On refresh token expiry:**
```
POST /auth/refresh → 401
  → window.location.href = "/login"
  → User logs in again
```

---

## Key Decisions (And Why)

**Why Redux Toolkit over Context?**  
Album and image state is shared across multiple pages. Context would mean prop drilling or deeply nested providers. RTK slices kept things clean and predictable.

**Why shadcn/ui?**  
It's not a dependency — it's copied components you own. No version conflicts, no breaking changes from upstream, full control over styling.

**Why Axios interceptors for token refresh?**  
The alternative is checking token expiry in every component or every thunk. The interceptor handles it in one place. Every request benefits automatically.

**Why `clearAlbumStatus` on album detail unmount?**  
Without it, navigating back to the dashboard shows stale album data. The reset forces a fresh fetch when the dashboard mounts again.

---

## Running Locally

```bash
git clone https://github.com/Rakeshneopane/image-App-frontend.git
cd image-App-frontend
npm install
```

Create `.env`:
```env
VITE_BASE_URL=http://localhost:5000
```

```bash
npm run dev
```

You'll also need the backend running locally. See the [backend repo](https://github.com/Rakeshneopane/imageApp-backend).

---

## Deployment & CI/CD

Deployed on **Vercel** with implicit CI/CD:

- Push to `main` → Vercel auto-builds and deploys
- Build fails → deployment blocked, previous version stays live
- Environment variables managed via Vercel dashboard

No manual deployment steps. `git push` is the deployment command.

The backend follows the same pattern on **Render** — push to `main`, auto-deploys.

For a production setup, the next step would be GitHub Actions running tests before Vercel deploys — so broken code never reaches production even if it builds. That's on the roadmap.

---

## What I'd Do Differently

- **Commit after every feature** — One big commit per session means harder rollbacks and messier history.
- **Write tests alongside the code** — Retrofitting tests is painful. Starting with tests would have caught the hooks-after-return bug immediately.
- **TypeScript** — PropTypes errors are caught at runtime. TypeScript catches them at build time.
- **Album cover images** — Dashboard thumbnails are placeholders. A `coverImage` field on the album model would fix this cleanly.

---

## What I Learned

This project was started on April 29 and finished in June 2026. Longer than expected. But the things I debugged — OAuth redirects, cookie behavior across origins, Redux state persistence, React's rules of hooks, Windows filename case sensitivity breaking Linux builds — I will never forget those.

The time it took is the time it took. The next project will go faster.

---

## Contact

**Rakesh Neopane**

[![GitHub](https://img.shields.io/badge/GitHub-Rakeshneopane-181717?style=for-the-badge&logo=github)](https://github.com/Rakeshneopane)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rakesh%20Neopane-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/rakesh-neopane)

- 📧 Email: rakeshkumarneopane@gmail.com
- 📧 Alternate Email: lucasneopane123@gmail.com
---

*If you've ever spent four days on a bug that turned out to be a hook placed after an early return — this repo is for you.* ⭐
