# SwipeStay PRD - Product Requirements Document

## Context

SwipeStay is a Tinder-inspired hotel discovery app that transforms the traditional hotel search into an engaging, swipe-based experience. Targeting leisure travelers (millennials/Gen Z), it presents hotel results as a card deck that users swipe through, shortlist up to 10 hotels, and compare side-by-side before beginning a booking. The app is branded as **SwipeStay by easyGDS** and integrates with the easyGDS Hotels API v2 for hotel inventory, availability, and pricing.

**Problem:** Hotel search is boring. Users are overwhelmed by grid listings of 200+ results. Decision fatigue leads to abandoned searches. The visual, one-at-a-time card model forces focus, makes discovery fun, and drives faster decisions.

**MVP Scope:** Search > Swipe > Compare > Room/Rate Selection > Checkout mockup. Anonymous users, no accounts, no AI assistant (Phase 2).

---

## 1. User Flow

```
[Search Form] → [Card Swipe Deck] → [Compare Grid] ↔ [Room/Rate Selection] → [Checkout Mockup]
      ↑                                                       ↕
  [AI Assistant Mockup - Phase 2]              (select rooms per hotel,
                                                return to compare with
                                                room choice reflected)
```

**Navigation model:** The Compare and Room/Rate Selection screens have a **bidirectional relationship**. Users can:
- Tap a hotel in Compare → go to Room/Rate Selection for that hotel
- Select a room → return to Compare with the selected room/rate now shown for that hotel
- Repeat for other hotels in the shortlist
- Once satisfied with their hotel+room combination, confirm → proceed to Checkout

### 1.1 Search Form (`/`)
- **Destination input** with autocomplete (powered by easyGDS Places API)
- **Check-in / Check-out** date picker
- **Guests & Rooms** selector (adults, children with ages, multiple rooms)
- **Preferences** as tappable chips (e.g., "Near Metro", "Boutique", "Spa", "Pool")
- **Additional notes** textarea for specific requests
- Primary CTA: **"Search Hotels"** button
- Secondary: **"AI Assistant"** tab toggle → navigates to static mockup screen
- Secondary: **"Discover Nearby"** section with map placeholder

### 1.2 Card Swipe Deck (`/results`)
- Hotels displayed as a stacked card deck (only 3 cards rendered in DOM at once)
- **Progressive loading**: first 10-15 hotels loaded initially, more fetched silently as user approaches end of current batch
- **Shortlist indicator** showing `X / 10` slots filled (e.g., "3 / 10")

#### Card Design (Image Face)
- Full-bleed hotel image with gradient overlay for text readability
- **Top-left**: Badge system ("Rare Find", star rating)
- **Bottom overlay**: Hotel name, location, distance to center
- **Bottom-right**: Price badge (per night in primary blue)
- **Bottom-left**: Review score + rating text (e.g., "8.5 Superb")

#### Card Design (Map Face)
- Interactive map showing hotel location with pin
- Nearby landmarks labeled
- Hotel info box on map (name, price)
- Zoom controls (+/-) and current location button
- Drag handle at top for swipe-back gesture cue

#### Gesture Model
| Gesture | Action |
|---------|--------|
| **Swipe Up** on card | Flip card to Map view (3D rotate animation) |
| **Swipe Down** on card (map showing) | Flip back to Image view |
| **Swipe Left** | Navigate to next hotel (browse, does not dismiss) |
| **Swipe Right** | Navigate to previous hotel (go back) |
| **Tap "Dismiss" button** | Remove hotel from deck, advance to next |
| **Tap "Shortlist" button** | Add hotel to shortlist (up to 10), advance to next |
| **Tap "Compare" button** | Navigate to Compare view with current shortlist |

> **Design note on swipe vs. Tinder model:** The user explicitly wants left/right as neutral navigation (browse forward/back) with action buttons for add/dismiss. This differs from Tinder's "every card demands a decision" model. This is intentional - hotel browsing benefits from the ability to revisit cards before committing. The action buttons provide clear, intentional decision points.

#### Pulsing Gesture Cues
- "Swipe for Map" with up-arrow animation on image face
- "Swipe Down for Photo" with down-arrow animation on map face
- Cues fade after first successful gesture (per session)

#### Action Buttons (Bottom Bar)
Three floating action buttons below the card:
1. **Dismiss** (X icon) - removes hotel from deck
2. **Shortlist** (heart/check icon) - adds to comparison shortlist
3. **Compare** (compare_arrows icon) - opens comparison view

When shortlist is full (10/10), the shortlist button becomes disabled with visual feedback.

### 1.3 Compare View (`/compare`)
- **Header**: Back button + "Compare (X hotels)" title
- **Optional mini-map** at top showing all shortlisted hotels as pins with price labels
- **Horizontal scrollable grid** showing up to 10 hotels side-by-side
- **Sticky left column** with attribute labels

#### Comparison Attributes
| Row | Data |
|-----|------|
| Hotel Image | Photo thumbnail with favorite heart toggle |
| Rate | Price per night |
| Stars | Visual star rating (1-5) |
| Reviews | Score + rating text |
| Board | Breakfast, room only, all-inclusive, etc. |
| Room Type | King, Twin, Suite (with bed icons) |
| Refund Policy | Free cancel / Non-refundable |
| Distance | Distance to city center |

- **Selected hotel** highlighted with blue ring accent
- **Room selection indicator**: Once a room is selected for a hotel, the comparison card shows the selected room name and rate instead of just the lead price
- **Bottom CTA bar**: "Select Room" when no room chosen for focused hotel, or "Book [Hotel Name] - $Price" when room is selected
- Tapping a hotel card or "Select Room" navigates to Room/Rate Selection for that hotel
- Tapping "Book" (when room is selected) navigates to Checkout
- Users can remove hotels from the comparison grid (swipe up on column or X button)
- **Disclaimer footer**: Subtle text below the grid: "Prices shown are indicative and subject to availability. Final pricing confirmed at checkout."

### 1.4 Room/Rate Selection (`/compare/:hotelId/rooms`)

This is the detailed room and rate view for a single hotel from the shortlist. It's the bridge between comparison browsing and booking commitment.

#### Header
- **Back button** → returns to Compare view (preserving room selection state)
- Hotel name + star rating
- Check-in/out dates as context reminder

#### Hotel Summary (collapsed)
- Hotel image thumbnail, name, location
- Expandable section for full description, amenities, and policies

#### Room List
Each available room displayed as an expandable card:
- **Room name** (e.g., "Deluxe King Room")
- **Room image** (if available from API)
- **Key details at a glance**: bed type icons, max occupancy, room size (sqm)
- **Room amenities** as small chips (WiFi, minibar, safe, TV, AC)

#### Rate Options (within each room)
Each room can have multiple rate plans, shown as selectable options:
- **Rate name** (e.g., "Best Available Rate")
- **Board type** with icon (room only, breakfast, half board, full board, all-inclusive)
- **Price**: total stay + per night breakdown
- **Price breakdown** expandable: base rate, taxes, fees, discounts, nightly rates
- **Cancellation policy** with color coding:
  - Green badge: "Free cancellation until [date]"
  - Amber badge: "Partial refund until [date]"
  - Red badge: "Non-refundable" (with savings indicator, e.g., "Save 15%")
- **Payment options**: "Pay now" / "Pay at hotel" badges
- **Inclusions** as tags (Breakfast, WiFi, Airport Pickup, etc.)
- **Restrictions**: min/max stay if applicable
- **Available rooms count**: "Only 3 rooms left" urgency indicator when low

#### Selection & Navigation
- **"Select This Room"** button on each rate option
- Selecting a room stores the hotel_id + room_id + rate_id in the shortlist store
- After selection: auto-navigates back to Compare view where the selected room/rate is now reflected in that hotel's column
- User can tap another hotel in Compare to select its room, then return again
- **"Confirm & Book"** CTA appears in Compare when at least one hotel has a room selected → navigates to Checkout

#### Legal & Disclaimers
- **Rate terms**: Cancellation policy details shown inline with each rate (not hidden behind a click)
- **Price transparency**: "Taxes included" or "Taxes not included" clearly marked per rate
- Small print below rate options: "Rate subject to availability. Cancellation terms apply as stated."

### 1.5 Checkout Mockup (`/checkout`)
- Static mockup screen showing:
  - Selected hotel summary (image, name, star rating, dates)
  - Selected room & rate summary (room name, board type, price)
  - Guest details form (non-functional: name, email, phone, special requests)
  - Price breakdown (base rate, taxes, fees, total)
  - **T&Cs checkbox** (non-functional): "I agree to the Terms & Conditions and Privacy Policy" with linked text
  - **Cancellation policy summary** for the selected rate, prominently displayed
  - **Payment section** (non-functional): card input mockup
  - "Complete Booking" button (non-functional, shows "Coming Soon" toast/modal)
- **Footer disclaimer**: "By proceeding you agree to the booking terms. Prices are in [currency]. Cancellation policy applies as stated above."
- Purpose: demonstrates the intended end-to-end flow for stakeholders

### 1.6 AI Assistant Mockup (`/assistant`)
- Static screen matching the `search_panel_llm.html` mockup
- Chat bubble from AI with welcome message
- Suggested prompt chips (non-functional)
- Text input with mic button (non-functional)
- Banner: "AI-powered search coming soon"

---

## 2. Technical Architecture

### 2.1 Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Preact + Preact Signals | 3.5KB gzipped (12x smaller than React), same ecosystem via preact/compat, Signals bypass VDOM for 60fps animations |
| **Styling** | Tailwind CSS v4 | Matches mockups exactly, @tailwindcss/vite plugin, Plus Jakarta Sans font |
| **Gestures** | @use-gesture/react | Axis-locked directional swipes, velocity tracking, works via preact/compat |
| **Animations** | @react-spring/web | Spring-physics card animations (flip, slide, snap-back), interpolation for rotation/opacity |
| **Icons** | Material Symbols Outlined | Matches mockup icon system |
| **Routing** | wouter (or preact-router) | ~1KB client-side router |
| **Build** | Vite + @preact/preset-vite | Fast dev server, optimized production builds |
| **Backend** | Cloudflare Pages Functions | API proxy to easyGDS, same deployment as frontend, zero CORS in production |
| **Auth Cache** | Cloudflare KV | Store easyGDS JWT token globally (not per-PoP) |
| **Data Cache** | Cloudflare Cache API | Cache places (24h) and availability (5min), never cache rates |
| **Deployment** | Cloudflare Pages | Single `wrangler pages deploy` for frontend + API |

### 2.2 Why Preact over React
- **Bundle size**: 3.5KB vs 45KB gzipped - critical for mobile-first
- **Same API**: preact/compat provides full React hooks API
- **Ecosystem access**: @use-gesture and react-spring work through compat layer
- **Signals**: Fine-grained reactivity that updates DOM directly, bypassing VDOM reconciliation during 60fps drag animations
- **Cloudflare Pages**: First-class Vite + Preact support

### 2.3 Backend (Cloudflare Pages Functions)

The frontend never communicates with easyGDS directly. All API calls go through Pages Functions that act as a proxy, keeping credentials server-side.

#### API Routes

| Frontend calls | Pages Function | Proxies to easyGDS |
|---------------|----------------|---------------------|
| `GET /api/places?search_text=...` | `functions/api/places.ts` | `GET /api/places` |
| `POST /api/hotels/search` | `functions/api/hotels/search.ts` | `POST /api/v2/products/hotels/availabilities` |
| `POST /api/hotels/rates` | `functions/api/hotels/rates.ts` | `POST /api/v2/products/hotels/availabilities/rates` |

#### JWT Token Management
- easyGDS credentials stored as Worker secrets (`EASYGDS_EMAIL`, `EASYGDS_PASSWORD`)
- JWT cached in Cloudflare KV namespace `EASYGDS_AUTH`
- Token refreshed when within 5 minutes of expiry or on 401 response
- All token logic is server-side only

#### Caching Strategy
| Data | Cache | TTL | Rationale |
|------|-------|-----|-----------|
| Places | Cache API | 24 hours | Cities don't move |
| Hotel availability | Cache API | 5 minutes | Tolerable staleness for browsing |
| Room rates | Never cached | - | Pricing must be real-time |

### 2.4 Project Structure

```
swipestay/
├── package.json
├── wrangler.toml                    # Cloudflare Pages + KV config
├── vite.config.ts                   # Preact + Tailwind
├── tailwind.config.ts               # Design tokens from mockups
├── tsconfig.json
├── .dev.vars                        # Local dev secrets (gitignored)
│
├── public/
│   └── favicon.svg
│
├── src/                             # Frontend (Preact)
│   ├── index.html
│   ├── main.tsx
│   ├── app.tsx                      # Root + router
│   ├── index.css                    # Tailwind directives
│   │
│   ├── components/
│   │   ├── layout/                  # AppShell, Header, BottomNav
│   │   ├── search/                  # SearchForm, DestinationInput, DatePicker, GuestSelector
│   │   ├── deck/                    # CardDeck, HotelCard, MapFace, ActionButtons
│   │   ├── compare/                 # CompareView, CompareGrid, CompareMap, BookingBar
│   │   ├── rooms/                   # RoomSelection, RoomCard, RateOption, PolicyBadge
│   │   ├── checkout/                # CheckoutMockup
│   │   └── ai/                      # AiAssistantMockup
│   │
│   ├── hooks/                       # useCardDeck, useSwipeGesture, useFlipGesture, useShortlist, useRoomSelection
│   ├── stores/                      # Preact Signals: searchStore, deckStore, shortlistStore, roomSelectionStore
│   ├── api/                         # Fetch client: places, hotels, rates
│   ├── types/                       # TypeScript interfaces for Hotel, Room, Rate, Search, API
│   └── lib/                         # Constants, formatters
│
├── functions/                       # Cloudflare Pages Functions
│   └── api/
│       ├── _middleware.ts           # CORS + error handling
│       ├── places.ts
│       └── hotels/
│           ├── search.ts
│           └── rates.ts
│
└── lib/                             # Shared code (Workers + types)
    └── easygds/
        ├── auth.ts                  # JWT acquisition + KV caching
        ├── client.ts                # easyGDS HTTP client
        └── types.ts                 # easyGDS API response types
```

### 2.5 State Management (Preact Signals)

Four global stores as plain module exports (no providers):

- **searchStore** - destination, dates, guests, currency, preferences
- **deckStore** - hotel results array, current card index, search_id, loading state, prefetch trigger (auto-fetch when 5 cards from end)
- **shortlistStore** - shortlisted hotels (max 10), auto-synced to localStorage via `effect()`
- **roomSelectionStore** - maps hotel_id → { room_id, rate_id, room_name, rate_name, pricing } for hotels where the user has selected a room. Updated when user selects a room in the Room/Rate Selection screen. Read by Compare view to show selected room info per hotel.

### 2.6 Performance Budget

| Metric | Target |
|--------|--------|
| Total JS bundle (gzipped) | < 30KB |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2.5s |
| Card swipe frame rate | 60fps |
| Cards in DOM | Max 3 at any time |
| Lighthouse Performance | > 90 |

---

## 3. Design System

> **Design philosophy:** The mockups are directional guides, not pixel-perfect templates. Implementation should be more liberal with color, style, and personality. The app should feel vibrant, playful, and premium - befitting a leisure travel experience for millennials/Gen Z. Use the mockup layouts as structural references but elevate the visual energy with richer gradients, bolder accent colors, micro-animations, and personality in the UI copy.

### 3.1 Colors (base palette - expand liberally)
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#203C94` | Buttons, highlights, badges, icons |
| `primary-light` | `#4A6BCC` | Hover states, gradients |
| `background-light` | `#F5F8FF` | App background |
| `overlay-dark` | `#101922` | Image gradient overlays (text readability on photos) |
| `accent-amber` | `#FCD34D` | Star ratings, premium badges |
| `accent-emerald` | `#10B981` | Positive states (Free Cancel, shortlisted) |
| `accent-rose` | `#F43F5E` | Favorite/heart, dismiss actions |
| `accent-violet` | `#8B5CF6` | AI assistant, special badges |
| `accent-orange` | `#F97316` | Urgency ("Only 3 left!"), price alerts |

Use gradients, color washes, and tinted overlays generously. The palette should feel alive and inviting - not flat corporate UI.

**Light theme only.** No dark mode. The app uses a clean, bright aesthetic with the light background (#F5F8FF) as the foundation. Dark colors (`#101922`) are used only for text contrast and image gradient overlays, never as backgrounds.

### 3.2 Typography
- **Font**: Plus Jakarta Sans (Google Fonts, variable weights 200-800)
- **Headers**: Bold, sizes 3xl/2xl/lg
- **Body**: Regular/Medium, sizes base/sm
- **Labels**: Semibold uppercase, 10-11px

### 3.3 Components
- **Border radius**: 1rem default, 2rem lg, 3rem xl (rounded, organic feel)
- **Shadows**: Brand-tinted (`rgba(32, 60, 148, 0.1)`), upward shadow for floating elements
- **Buttons**: Active `scale-[0.98]` for tactile feedback, hover `scale-110` on icons
- **Cards**: Rounded 2.5rem corners, aspect-ratio 4/3 for images

### 3.4 Mobile Viewport Constraint
```html
<!-- AppShell wraps entire app -->
<div class="mx-auto w-full max-w-[430px] h-[100dvh] overflow-hidden relative bg-background-light">
```
Centered on desktop, fills screen on mobile. Uses `dvh` for dynamic viewport height (handles mobile browser chrome).

---

## 4. API Integration Details

### 4.1 easyGDS API Flow

```
[1] POST /api/v2/auth → JWT token (cached in KV)
[2] GET /api/places?search_text=Paris → place_id
[3] POST /api/v2/products/hotels/availabilities → search_id + hotel[]
[4] POST /api/v2/products/hotels/availabilities/rates → rooms[] + rates[]
```

### 4.2 Data Available Per Hotel

**From availability search (step 3)** - used for card display:
- hotel_id, name, star_rating, lead_price (amount, currency, per_night), available_rooms, address (city, country)

**From rates lookup (step 4)** - used for comparison & checkout:
- Full description, coordinates, amenities[], images[], policies (check-in/out times, children, pets)
- rooms[]: room_id, room_name, description, max_occupancy, bed_types, room_size, amenities, images
- rates[]: rate_id, rate_name, board_type, pricing (total, per_night, taxes, breakdown, nightly_rates), cancellation_policy, payment_options, inclusions, restrictions

### 4.3 When to Fetch What

| Screen | API Call | Trigger |
|--------|----------|---------|
| Search form (destination input) | Places lookup | On input (debounced 300ms) |
| Card deck load | Hotel availability | On search submit |
| Card deck prefetch | Hotel availability | When 5 cards from end of current batch |
| Compare view entry | Room rates | For each shortlisted hotel (parallel requests) |
| Room/Rate Selection | Room rates | On entry if not already cached for that hotel |
| Checkout mockup | None | Uses cached rates data from room selection |

### 4.4 Error Handling

| Error | User Experience |
|-------|----------------|
| No results | "No hotels found" card with suggestion to adjust dates/destination |
| API timeout (30s) | Loading skeleton → "Taking longer than expected" → retry button |
| Rate limit (429) | "Too many searches, please wait a moment" toast |
| Network error | "You appear to be offline" banner with retry |
| Search session expired (422) | Auto re-search silently |

---

## 5. Key Interactions & Animations

### 5.1 Card Swipe (Left/Right - Browse)
- Card follows finger with slight rotation (mapped to drag distance)
- Card behind scales up subtly as top card moves away
- On release: spring snap-back if < 40% width dragged, otherwise slide out and bring next card
- Right swipe goes to previous card (only if one exists)

### 5.2 Card Flip (Up/Down - Image ↔ Map)
- Axis-locked: once vertical drag detected, horizontal is disabled for that gesture
- 3D rotateX animation (card flips along horizontal axis)
- Image face shows hotel photo + overlaid info
- Map face shows location map + hotel pin
- Pulsing gesture cue with directional arrow

### 5.3 Shortlist Add Animation
- Card briefly pulses with green checkmark overlay
- Shortlist counter animates increment (e.g., "3/10" → "4/10" with scale bounce)
- Card exits with a subtle upward motion

### 5.4 Dismiss Animation
- Card fades and shrinks slightly as it exits
- "X" icon flashes briefly on card
- Next card springs into position

### 5.5 Compare Grid Entry
- Cards animate in from right, staggered by 50ms each
- Horizontal scroll snaps to columns

---

## 6. Non-Functional Requirements

### 6.1 Browser Support
- iOS Safari 15+ (primary)
- Chrome Mobile 100+ (primary)
- Desktop Chrome/Firefox/Safari (secondary - mobile viewport frame)

### 6.2 Accessibility
- Touch targets minimum 44x44px
- High contrast text on image overlays (WCAG AA)
- Screen reader labels on action buttons
- Reduced motion: respect `prefers-reduced-motion` (disable spring animations, use instant transitions)

### 6.3 Offline Behavior
- No offline mode in MVP
- Graceful degradation: show last-loaded card deck if network drops mid-browse
- Clear "offline" indicator

---

## 7. Out of Scope (Phase 2+)

- User accounts & authentication
- AI Assistant (natural language search powered by LLM)
- Full booking flow with payment
- Push notifications
- Saved searches & bookings history
- Social sharing
- Price alerts
- Multi-language support
- Dark mode (light theme only by design)

---

## 8. Reference Files

| File | Purpose |
|------|---------|
| `stitch_swipestay/search_panel_form.html` | Search form mockup - form fields, layout, preferences chips |
| `stitch_swipestay/search_panel_llm.html` | AI assistant mockup - chat UI for Phase 2 placeholder |
| `stitch_swipestay/swipe_panel_image.html` | Card image face mockup - layout, overlays, badges, action buttons |
| `stitch_swipestay/swipe_panel_map.html` | Card map face mockup - map view, pins, landmarks, info box |
| `stitch_swipestay/compare_panel.html` | Comparison grid mockup - horizontal scroll, attributes, booking CTA |
| `easyGDS Hotels.postman_collection.json` | Full API contract - 4 endpoints, auth, data schemas |

---

## 9. Implementation Plan

### Phase 1: Foundation (scaffold + design system)
1. Initialize project: Vite + Preact + Tailwind + TypeScript + Wrangler
2. Configure Tailwind with design tokens from mockups
3. Build AppShell (mobile viewport frame, routing)
4. Set up Cloudflare Pages Functions structure

### Phase 2: Backend (API proxy)
5. Implement easyGDS auth with KV token caching
6. Build Places proxy endpoint with Cache API
7. Build Hotel availability proxy endpoint
8. Build Room rates proxy endpoint

### Phase 3: Search
9. Build SearchForm with destination autocomplete
10. Build DatePicker, GuestSelector, PreferenceChips components
11. Wire search submission to API and navigate to deck view

### Phase 4: Card Deck (core experience)
12. Build CardDeck container with spring-based card stack
13. Build HotelCard (image face) matching mockup
14. Build MapFace (map view) with flip gesture
15. Implement left/right swipe navigation between cards
16. Build ActionButtons (dismiss, shortlist, compare)
17. Implement progressive deck loading (prefetch at 5 cards remaining)
18. Build shortlist store with localStorage sync and X/10 indicator

### Phase 5: Compare View
19. Build CompareView with horizontal scrollable grid
20. Build CompareGrid with all attribute rows (showing lead price initially, selected room/rate when available)
21. Fetch room rates for shortlisted hotels on compare entry (parallel)
22. Build BookingBar with dynamic CTA ("Select Room" / "Book [Hotel]")
23. Wire navigation to Room/Rate Selection per hotel

### Phase 6: Room/Rate Selection
24. Build RoomSelection page with hotel summary header
25. Build RoomCard component (expandable, with room details, images, amenities)
26. Build RateOption component (board type, pricing breakdown, cancellation policy badges, payment options, inclusions)
27. Build PolicyBadge component (green/amber/red cancellation indicators)
28. Build roomSelectionStore with hotel→room→rate mapping
29. Wire "Select This Room" to store selection and auto-navigate back to Compare
30. Update CompareGrid to reflect selected room/rate per hotel

### Phase 7: Checkout & Legal
31. Build CheckoutMockup with hotel+room summary, guest form, price breakdown
32. Add T&Cs checkbox and linked Terms & Conditions / Privacy Policy text
33. Add cancellation policy summary prominently in checkout
34. Add disclaimers at appropriate touchpoints:
    - Compare: "Prices indicative, subject to availability"
    - Room Selection: "Rate subject to availability. Cancellation terms apply as stated"
    - Checkout: Full T&Cs agreement, cancellation recap, currency note
35. Ensure disclaimers are present but non-intrusive (small text, muted colors, never blocking the flow)

### Phase 8: Polish
36. Build AiAssistantMockup placeholder screen
37. Add loading skeletons and error states
38. Add gesture cue animations (pulsing arrows)
39. Add reduced motion support
40. Performance audit (bundle size, Lighthouse)
41. Deploy to Cloudflare Pages

---

## 10. Verification Plan

1. **Search flow**: Enter a destination, verify autocomplete dropdown populates from Places API, select dates and guests, submit search
2. **Card deck**: Verify hotels load as card stack, swipe up/down flips between image and map, swipe left/right navigates through cards, action buttons work
3. **Progressive loading**: Swipe through 10+ cards, verify new batch loads seamlessly without interruption
4. **Shortlist**: Add hotels via shortlist button, verify counter updates (X/10), verify max 10 limit enforced
5. **Compare**: Navigate to compare view, verify all shortlisted hotels appear in horizontal grid with correct data, verify room rates are fetched
6. **Room selection flow**: Tap hotel in Compare → Room/Rate Selection loads with all rooms and rates → select a room → returns to Compare with room info reflected in that hotel's column
7. **Multi-hotel room selection**: Select rooms for 2-3 different hotels in sequence (Compare → Rooms → back → tap another hotel → Rooms → back), verify each selection persists
8. **Checkout flow**: With a room selected, tap "Book" in Compare → Checkout mockup renders with correct hotel, room, rate, and price breakdown
9. **Legal/disclaimers**: Verify disclaimers appear in Compare footer, Room Selection rate terms, and Checkout T&Cs — all present but not intrusive
10. **Mobile viewport**: Test on actual mobile device AND desktop browser - verify fixed mobile frame on desktop
11. **Performance**: Run Lighthouse audit, verify < 30KB JS bundle, verify 60fps card swipes via Chrome DevTools Performance tab
12. **Error handling**: Test with network throttling, verify graceful degradation and error messages
13. **Deploy**: Verify `wrangler pages deploy` succeeds and the live URL functions end-to-end
