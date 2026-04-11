# placard — TODO

**Type:** AI Wardrobe Assistant (Full-Stack Web App)  
**Stack:** React 19, Vite, TypeScript, Firebase, Gemini API, Tailwind CSS v4  
**Status:** ~80% complete (core features built; missing tests and polish)

---

## Actions To Take

- [ ] **Add `VITE_GEMINI_API_KEY` to `.env.example`** — Document the Gemini API key requirement alongside Firebase config variables; update README setup section accordingly
- [ ] **Add unit and integration tests** — Set up Vitest for React components and Firebase integration tests; target 60%+ coverage starting with AI Stylist and outfit creation flows
- [ ] **Complete and merge the WIP redesign** — Finish the outstanding redesign branch; verify all UI components (AI Stylist, Bulk Upload, background removal) render and function correctly before merging to main
- [ ] **Implement comprehensive error handling** — Add React error boundaries for AI and Firebase call failures; display user-friendly toast notifications for all error states
- [ ] **Add loading states and optimistic updates** — Implement skeleton loaders for wardrobe items; add optimistic outfit creation for snappy UX; improve real-time Firestore sync feedback
