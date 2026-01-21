I have diagnosed the issues causing the empty home page and authentication failures. The root causes are a lack of robust error handling when environment variables (like `MONGODB_URI` and `RESEND_API_KEY`) are missing, and a "Local Mode" database adapter that is incompatible with Vercel's read-only environment and missing key methods like `countDocuments`.

Here is the plan to fix these issues:

### 1. Fix Database Connection & Seeding
- **`api/_lib/lib/db.ts`**: Enforce `MONGODB_URI` requirement in production. If missing, throw a clear error instead of falling back to a broken "Local Mode".
- **`api/_lib/lib/local-db-adapter.ts`**: 
    - Add missing `countDocuments` method to prevent crashes during seeding.
    - Wrap file write operations in `try-catch` blocks. This ensures that on Vercel (where the filesystem is read-only), the app doesn't crash on write attempts (like logging in or registering), allowing read-only features to still work if a local database file exists.
- **`api/_lib/lib/seed.ts`**: Improve error handling to ensure seeding failures are reported and don't silently leave the database empty.

### 2. Fix Authentication & Registration
- **`api/_lib/routes/auth.ts`**: Update the verification code logic to **always** return the development code (`devCode`) in the API response if the email fails to send (e.g., due to missing `RESEND_API_KEY`). This ensures users can still register even without a configured email provider.
- **`src/pages/Auth.tsx`**: 
    - Update the UI to display the `devCode` from the API response so users can copy-paste it to verify their email.
    - Improve error message display to give users clear feedback if registration or login fails (e.g., "Database connection failed").

### 3. Fix Video Fetching
- **`api/_lib/routes/videos.ts`**: Add a check to attempt immediate seeding if the video list is empty, ensuring the home page is populated with sample content if the database is fresh.

### 4. Verification
- I will verify the fixes by checking the code logic and ensuring the fallback mechanisms (like `devCode` and read-only safety) are correctly implemented.
