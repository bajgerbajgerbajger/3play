# 3Play Page Design Specification (Desktop-first)

## Global Styles (Design System)
- **Layout grid**: 12-column CSS Grid; max-width 1200–1320px; 24px gutters; content centered.
- **Breakpoints**: Desktop ≥1200, Tablet 768–1199, Mobile ≤767 (stack sections, reduce density).
- **Spacing scale**: 4, 8, 12, 16, 24, 32, 48, 64.
- **Radius**: 12 (cards), 10 (inputs), 999 (pills).
- **Typography**: Inter/system; H1 32/40, H2 24/32, H3 18/28, Body 14/22, Caption 12/18.
- **Colors (tokens)**:
  - Background: #0B0D12, Surface: #111827, Surface-2: #0F172A
  - Text: #E5E7EB, Muted: #9CA3AF
  - Accent (Brand): #7C3AED; Accent-hover: #6D28D9
  - Border: rgba(255,255,255,0.08)
  - Focus ring: 2px #A78BFA
- **Components**:
  - Buttons: Primary (accent), Secondary (surface), Ghost; all with loading + disabled.
  - Inputs: label + helper + error; clear focus state; enter submits in Auth.
  - Cards: thumbnail + meta; hover elevates (shadow + slight translate).
  - Feedback: inline error blocks, toasts for save/publish.
- **Accessibility**: visible focus, keyboardable menus, alt text on thumbnails, player controls reachable.

## Branding / Logo System
- **Logo lockups**: icon-only, wordmark-only, stacked (icon over wordmark), horizontal (icon + wordmark).
- **Clearspace**: at least 1× icon width around all lockups.
- **Minimum sizes**: icon 20px; horizontal lockup 120px wide.
- **Colorways**: full-color (accent icon + white text), monochrome (white), inverted (dark for light bg).
- **Usage**: header left, Auth card top, Open Graph image watermark, favicon/app icon.

---

## Page: Home
### Meta Information
- Title: “3Play — Watch and share videos”
- Description: “Discover videos and creators on 3Play.”
- Open Graph: og:title, og:description, og:image (brand OG), og:type=website

### Layout
- Hybrid: sticky top nav (Flexbox) + content grid (CSS Grid).

### Page Structure
1. **Top Navigation (sticky)**
   - Left: logo lockup (click → Home)
   - Center: search input (desktop full width; tablet condensed)
   - Right: Auth CTA (Sign in) or Avatar menu (Channel, Studio, Sign out)
2. **Feed Controls**
   - Tabs/segmented control: Latest / Popular (optional if configured)
3. **Discovery Feed**
   - Card grid: 4 cols desktop, 2 cols tablet, 1 col mobile
   - Each card: thumbnail, duration badge, title (2 lines), channel link, meta line

### Interaction States
- Loading: skeleton cards; error: retry block.

---

## Page: Watch
### Meta Information
- Title: “{Video Title} — 3Play”
- Description: first 140 chars of description
- Open Graph: og:type=video.other, og:image=thumbnail, og:title

### Layout
- Two-column desktop: player+details (left, ~8 cols) and Up Next (right, ~4 cols). Stacks on mobile.

### Page Structure
1. **Player Section**
   - Responsive 16:9 container; controls: play/pause, seek, volume, fullscreen
   - States: loading spinner; unavailable message
2. **Video Details**
   - Title, channel chip (avatar + name), publish date
   - Description: collapsed (3–5 lines) with “Show more”
3. **Up Next**
   - Vertical list cards with smaller thumbnails and titles

---

## Page: Channel
### Meta Information
- Title: “{Channel Name} — 3Play”
- Description: channel bio or default
- Open Graph: og:type=profile, og:image=banner/avatar

### Layout
- Stacked sections with a banner header; content uses the same 12-col grid.

### Page Structure
1. **Channel Header**
   - Banner (cover), avatar, name/handle, bio
2. **Channel Video List**
   - Grid/list toggle (optional) but keep default grid
   - Sort: Latest / Popular (optional if available)

---

## Page: Studio (Creator)
### Meta Information
- Title: “Studio — 3Play”
- Description: “Upload and manage your videos.”

### Layout
- Dashboard: left sidebar (sticky) + main panel.

### Page Structure
1. **Access Gate**
   - If not authenticated: show signed-out state and primary button → Auth (with return URL)
2. **Sidebar**
   - Nav items: Upload, Videos (library)
3. **Upload Panel**
   - Drag-and-drop uploader, file constraints, progress bar
   - Thumbnail uploader (image) + preview
4. **Video Library**
   - Table/list: thumbnail, title, status, visibility, updated
   - Row actions: Edit, Publish/Unpublish
5. **Video Editor (drawer or page section)**
   - Inputs: title, description, visibility; Save button; validation + toast

---

## Page: Auth
### Meta Information
- Title: “Sign in — 3Play”
- Description: “Access your 3Play account.”

### Layout
- Centered auth card on calm background; optional brand pattern.

### Page Structure
1. **Auth Card**
   - Logo at top
   - Tabs: Sign in / Sign up
   - Fields: email, password; submit button; inline errors
2. **Password Reset**
   - Link from Sign in; email capture; confirmation state
3. **Post-auth Redirect**
   - After success: return to Studio or the previous intended route
