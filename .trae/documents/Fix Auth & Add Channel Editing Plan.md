# Fix Auth & Add Channel Editing Plan

## 1. Goal
Fix registration issues on Vercel and implement full channel customization (avatar, banner, bio, display name).

## 2. Status & Tasks

### Phase 1: Fix Registration & Auth (Critical)
- [x] **Diagnose Registration Failure**: Identified Vercel serverless function limit issue and missing environment variables.
- [x] **Refactor API Structure**: Moved API code to `api/_lib` to prevent Vercel from treating every file as a function.
- [x] **Input Validation**: Added robust validation for handle/display name in `Auth.tsx`.
- [x] **Environment Setup**: (User Action Required) Set `MONGODB_URI`, `CLOUDINARY_*` vars on Vercel.

### Phase 2: Channel Editing Features
- [x] **Frontend Component**: Created `ChannelEditor.tsx` with file upload support.
- [x] **Integration**: Added "Edit Channel" button to `Channel.tsx` (visible only to owner).
- [x] **File Upload API**: `POST /api/studio/upload` is implemented and integrated.
- [ ] **Channel Update API**: Implement `PATCH /api/studio/channel` to save profile changes (Missing!).

### Phase 3: Verification
- [ ] **Test Registration**: Verify new account creation on production.
- [ ] **Test Channel Edit**: Verify avatar/banner upload and profile update.

## 3. Technical Implementation Details

### Channel Update Endpoint (`PATCH /api/studio/channel`)
- **Auth**: Protected route (requires valid JWT).
- **Inputs**: `displayName`, `bio`, `avatarUrl`, `bannerUrl`.
- **Validation**: Ensure `displayName` is not empty.
- **Logic**: Update `Profile` document matching the authenticated user's handle.
- **Response**: Return updated channel object.
