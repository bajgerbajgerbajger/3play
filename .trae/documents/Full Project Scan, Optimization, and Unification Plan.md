I will perform a comprehensive scan and update of the project to improve performance, fix potential issues, and ensure cross-platform readiness.

### **1. Performance Optimization ("Make it Fast")**
*   **Lazy Loading Routes**: Currently, all pages (`Home`, `Watch`, `Studio`, etc.) are loaded at once. I will refactor `App.tsx` to use `React.lazy` and `Suspense`. This will significantly reduce the initial load time.
*   **Advanced Code Splitting**: Update `vite.config.ts` to implement smarter chunk splitting. Instead of one giant `vendor` file, I will separate core libraries (React, ReactDOM) from UI libraries (Framer Motion, Lucide) to improve caching.
*   **Asset Optimization**: Verify image loading strategies and ensure the PWA manifest is correctly configured for offline capabilities.

### **2. Codebase "Full Scan" & Cleanup**
*   **Mobile Architecture Consolidation**: The project currently has both a Capacitor setup (root `android`/`ios`) and a separate `mobile/` (React Native/Expo) folder. To ensure a "super profi" unified platform, I will deprecate the separate `mobile/` folder and focus on the Capacitor approach. This ensures 100% feature parity between Web, Android, and iOS.
*   **Error Handling**: Implement a global **Error Boundary** component to catch crashes gracefully and prevent the "white screen of death", giving the app a more professional feel.
*   **Type Safety**: I will review `tsconfig.json` to ensure strict mode is effectively utilized for robust code.

### **3. Feature & "Missings" Check**
*   **Review Upload & Subscription**: I will examine the `UploadPanel` and `Subscription` logic to ensure they are fully wired up.
*   **UI Polish**: Check for missing loading states or empty states in key areas like the Channel page or Video lists.

### **Execution Steps**
1.  **Refactor `App.tsx`**: Implement Lazy Loading for all major routes.
2.  **Create `components/ErrorBoundary.tsx`**: Add global error handling.
3.  **Update `vite.config.ts`**: Apply advanced build optimizations.
4.  **Archive `mobile/`**: Rename to `_mobile_deprecated` to clear up the project structure.
5.  **Verify `package.json`**: Ensure scripts are ready for cross-platform builds.
