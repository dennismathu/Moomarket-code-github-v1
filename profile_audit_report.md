# Audit Report: Buyer and Seller Profile Features

I have conducted a comprehensive audit of the buyer and seller profile features, including the profile editing pages, dashboards, and onboarding flows. Below is a detailed list of identified issues, categorized by their impact on the system.

## 🔴 High Priority: Technical & Data Integrity

### 1. Non-Atomic Profile Updates
In `ProfilePage.tsx` and `SellerOnboarding.tsx`, updates to the `users` table and the `seller_profiles` table are handled as separate, sequential API calls from the client.
- **Risk**: If the first call succeeds and the second fails (e.g., network drop, 400 error), the user profile becomes inconsistent (e.g., a user marked as a 'seller' but without a corresponding `seller_profile` record).
- **Recommendation**: Wrap these in a Supabase RPC function to ensure atomicity, or at least implement better client-side rollback logic.

### 2. Hardcoded Analytics & Metrics
The `SellerDashboard.tsx` displays several "live" statistics that are currently hardcoded strings rather than real data.
- **Lines 271, 294**: "Total Views" (1,248) and "Buyer Inquiries" (12) are static.
- **Lines 598-608**: "Market Insights" (Demand Rank, Price Benchmark) are hardcoded.
- **Risk**: These mislead the user and provide no actual value for tracking farm performance.

### 3. Fragile State Synchronization
The application uses `window.dispatchEvent(new CustomEvent('refreshNotifications'))` to trigger updates in other components (e.g., in `BuyerDashboard.tsx:41` and `SellerDashboard.tsx:191`).
- **Risk**: This is a "hacky" way to manage state in React. It becomes difficult to track data flow as the app grows and can lead to race conditions where the UI doesn't refresh as expected.
- **Recommendation**: Use a Shared Context or a state management library (like TanStack Query) to handle cross-component data invalidation.

---

## 🟡 Medium Priority: Functional & UX Gaps

### 4. Missing Inspection Controls for Buyers
While sellers can confirm or reschedule visits, the `BuyerDashboard.tsx` provides no way for a buyer to cancel a request or propose a new time once a seller has rescheduled.
- **Risk**: Buyers may feel "trapped" in a scheduled visit, leading to no-shows for farmers.

### 5. Lack of Input Validation
The `ProfilePage.tsx` and `SellerOnboarding.tsx` accept phone numbers without format validation.
- **Observed**: It defaults to `+254` but allows any string.
- **Risk**: Invalid phone numbers prevent sellers from contacting buyers, breaking the core "Contact Seller" loop.

### 6. Static Time Strings
In `BuyerDashboard.tsx` (Line 216), Cow listings show a static "Added 2 days ago" string.
- **Risk**: Every listing looks the same age, which reduces the "freshness" appeal of the marketplace.
- **Recommendation**: Use `date-fns` or native `Intl.RelativeTimeFormat` based on the `created_at` timestamp.

---

## 🔵 Low Priority: Code Quality & Maintenance

### 7. Duplicate API Calls
In `SellerDashboard.tsx` (Lines 79-80), `fetchSavedListings()` is called twice consecutively in the `useEffect` hook.
- **Impact**: Unnecessary network overhead and occasional "double-loading" flickers in the UI.

### 8. Generic Placeholders
The application relies heavily on `/placeholder-cow.jpg` (e.g., `BuyerDashboard.tsx:201`, `SellerDashboard.tsx:405`).
- **Impact**: If a user hasn't uploaded a photo yet, the dashboard looks "broken" or unpolished.
- **Recommendation**: Use a more elegant CSS-based placeholder or a diverse set of illustrative avatars.

### 9. Component Bloat
`SellerDashboard.tsx` is nearly **1,000 lines long**. It manages listing feeds, inspection requests, analytics, profile strength, and multiple complex modals all in one file.
- **Impact**: Extremely difficult to test and maintain.
- **Recommendation**: Refactor into smaller sub-components (e.g., `ListingCard`, `InspectionList`, `AnalyticsSidebar`).

---

### Summary Checklist for Implementation
- [ ] Create `update_full_profile` RPC function for atomic updates.
- [ ] Replace hardcoded stats in `SellerDashboard` with `supabase.rpc` or aggregated queries.
- [ ] Implement "Cancel Request" functionality for buyers.
- [ ] Add Regex validation for Kenyan phone numbers (`^(?:254|\+254|0)?(7|1)(?:(?:[0-9][0-9])|(?:0[0-8]))[0-9]{6}$`).
- [ ] Refactor `SellerDashboard` into a directory of sub-components.
