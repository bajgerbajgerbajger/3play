import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

// Games
const Prsi = lazy(() => import("@/pages/games/Prsi"));
const Ludo = lazy(() => import("@/pages/games/Ludo"));
const Chess = lazy(() => import("@/pages/games/Chess"));

import { Header } from "@/components/Header";
import { MobileMenu } from "@/components/MobileMenu";
import { useAuthStore } from "@/store/auth";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function App() {
  const { init } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          <div className="min-h-dvh flex flex-col bg-bg text-text">
            <Header onOpenMobileMenu={() => setMobileNavOpen(true)} />

            <div className="flex-1 flex flex-col">
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              }>
                <Routes>
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
                </Routes>
              </Suspense>
            </div>

            <MobileMenu isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
