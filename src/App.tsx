import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Home = lazy(() => import("@/pages/Home"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const Watch = lazy(() => import("@/pages/Watch"));
const Channel = lazy(() => import("@/pages/Channel"));
const Studio = lazy(() => import("@/pages/Studio"));
const Auth = lazy(() => import("@/pages/Auth"));
const ChannelSetup = lazy(() => import("@/pages/onboarding/ChannelSetup"));
const Developer = lazy(() => import("@/pages/Developer"));

// Admin
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminVideos = lazy(() => import("@/pages/admin/Videos"));
const AdminComments = lazy(() => import("@/pages/admin/Comments"));

// Games
const Prsi = lazy(() => import("@/pages/games/Prsi"));
const Ludo = lazy(() => import("@/pages/games/Ludo"));
const Chess = lazy(() => import("@/pages/games/Chess"));

import { Header } from "@/components/Header";
import { MobileMenu } from "@/components/MobileMenu";
import { useAuthStore } from "@/store/auth";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { WelcomeModal } from "@/components/WelcomeModal";

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-text">
      <Header onOpenMobileMenu={() => setMobileNavOpen(true)} />

      <div className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </div>

      <MobileMenu isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}

export default function App() {
  const { init } = useAuthStore();

  // Keep-Alive Ping to prevent Render sleep
  useEffect(() => {
    const ping = () => fetch('/api/health').catch(() => null);
    const interval = setInterval(ping, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <LoadingBar />
          <WelcomeModal />
          
          <Routes>
            {/* Developer Route (No Layout) */}
            <Route path="/developer" element={
              <Suspense fallback={<div className="bg-black h-screen text-green-500 p-4">Loading System...</div>}>
                <Developer />
              </Suspense>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <Suspense fallback={<div className="bg-black h-screen text-white p-4">Loading Admin...</div>}>
                <AdminLayout />
              </Suspense>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="comments" element={<AdminComments />} />
            </Route>

            {/* Main App Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route path="/channel/:handle" element={<Channel />} />
              <Route path="/studio/*" element={<Studio />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding/setup" element={<ChannelSetup />} />
              
              {/* Games */}
              <Route path="/games/prsi" element={<Prsi />} />
              <Route path="/games/ludo" element={<Ludo />} />
              <Route path="/games/chess" element={<Chess />} />
            </Route>
          </Routes>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
