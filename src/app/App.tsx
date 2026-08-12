import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LazyMotion, domAnimation } from "motion/react";
import { HomePage } from "./pages/HomePage";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { StructuredData } from "./components/StructuredData";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Every component in this app now imports `m` (aliased as `motion`) from
// 'motion/react' instead of the full `motion` component — `m` only carries
// the render logic, not the whole animation/gesture feature set, and relies
// on this LazyMotion provider to supply features at runtime. This is the
// framer-motion-documented way to shrink the eager 'motion' bundle: the
// 'motion' chunk was 119 KB decoded (part of ~490 KB of JS parsed/executed
// on every homepage load) and was a major Time-to-Interactive / Total
// Blocking Time contributor even after the admin-bundle fix, since parsing
// and executing the full `motion` component factory for every HTML tag
// happens regardless of network payload. Switching every consumer
// (including the two admin-only editor pages, which still render under
// this same provider once lazy-loaded) to `m` let Rollup tree-shake that
// factory code away entirely, cutting the chunk to ~75 KB decoded.
// domAnimation covers everything anything in the app actually uses
// (animate/exit/whileHover/whileTap/whileInView) — nothing uses drag or
// layout animations, so domMax isn't needed anywhere.

// Admin: lazy-load entire auth+supabase+editor tree so it never lands in the public bundle
const AdminRoute = lazy(() => import("./pages/admin/AdminRoute"));

// Lazy load pages that aren't immediately needed
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const StoriesPage = lazy(() => import("./pages/StoriesPage").then((m) => ({ default: m.StoriesPage })));
const GrantsPage = lazy(() => import("./pages/GrantsPage").then((m) => ({ default: m.GrantsPage })));
const DonatePage = lazy(() => import("./pages/DonatePage").then((m) => ({ default: m.DonatePage })));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage").then((m) => ({ default: m.ThankYouPage })));
const BlogIndexPage = lazy(() => import("./pages/BlogIndexPage").then((m) => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })));
const BlogCategoryPage = lazy(() =>
  import("./pages/BlogCategoryPage").then((m) => ({ default: m.BlogCategoryPage }))
);

// ✅ simplest possible lazy import for default-exported component
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const PrivacyPolicyPage = lazy(() =>
  import("./pages/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfUsePage = lazy(() =>
  import("./pages/TermsOfUsePage").then((m) => ({ default: m.TermsOfUsePage }))
);

// Lazy load components that aren't critical for initial render
const UrgencyTopBanner = lazy(() =>
  import("./components/UrgencyTopBanner").then((m) => ({ default: m.UrgencyTopBanner }))
);

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LazyMotion features={domAnimation}>
      <div className="min-h-screen flex flex-col bg-background">
        <StructuredData />
        <Navigation />
        <main className="flex-grow" role="main" aria-label="Main content">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Main routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/thankyou" element={<ThankYouPage />} />
                  <Route path="/stories" element={<StoriesPage />} />
                  <Route path="/grants" element={<GrantsPage />} />

                  {/* Auth callback route */}
                  <Route path="/auth-callback" element={<AuthCallback />} />

                  {/* Admin route: lazy-loads AuthProvider + Supabase only when accessed */}
                  <Route path="/blog/editor" element={<AdminRoute />} />

                  {/* Blog routes */}
                  <Route path="/blog" element={<BlogIndexPage />} />
                  <Route path="/blog/category/:categorySlug" element={<BlogCategoryPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />

                  {/* Legal routes */}
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfUsePage />} />

                  {/* Legacy redirects */}
                  <Route path="/articles/*" element={<Navigate to="/blog" replace />} />
                  <Route path="/admin/blog" element={<Navigate to="/blog/editor" replace />} />
                  <Route path="/publish" element={<Navigate to="/blog/editor" replace />} />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <Suspense fallback={null}>
            <UrgencyTopBanner />
          </Suspense>
        </div>
      </LazyMotion>
    </BrowserRouter>
  );
}