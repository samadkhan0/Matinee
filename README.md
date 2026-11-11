# Matinee

A private watch-party room for YouTube: synced playback, live chat, shared emoji reactions, presence, and host controls.

**Stack:** React + Vite, Tailwind v4, React Router, Framer Motion, Firebase (Auth, Firestore, Realtime Database, Hosting).

## 1. Firebase setup
1. Create a project at console.firebase.google.com and add a **Web app**.
2. **Authentication** → enable *Email/Password* and *Google*.
3. **Firestore Database** → create in production mode.
4. **Realtime Database** → create (needed for presence). Copy its URL.
5. Copy `.env.example` to `.env` and fill in the values from Project settings.

## 2. Run locally
```bash
npm install
npm run dev
```

## 3. Deploy
```bash
npm install -g firebase-tools
firebase login
firebase init        # reuse the existing firebase.json; pick your project
npm run build
firebase deploy --only firestore:rules,database,hosting
```
Deploy the rules before you invite anyone. They are what keeps rooms private.

## How sync works
`rooms/{code}/meta/playback` is the single source of truth: `{videoId, state, position, updatedAt, updatedBy}`.
While playing, the live position is `position + (serverNow - updatedAt)`. Server time comes from RTDB's clock offset, so wrong system clocks don't matter. Clients hard-seek when drift passes 1.5s.

## Notes
- Volume is local on purpose (nobody wants someone else changing their speakers).
- Optional: add a Firestore TTL policy on `reactions.expireAt` to auto-clean reaction docs.
- Browsers block autoplay with sound until a click, which is why joining starts with the "Take your seat" curtain.
