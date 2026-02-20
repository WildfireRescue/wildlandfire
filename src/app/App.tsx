import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { StructuredData } from "./components/StructuredData";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "../contexts/AuthContext";

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
const BlogEditorPage = lazy(() =>
  import("./pages/admin/BlogEditorPage").then((m) => ({ default: m.BlogEditorPage }))
);

// ✅ Use the deterministic callback component that exchanges the code and redirects
const AuthCallback = lazy(() => import("./pages/AuthCallback").then((m) => ({ default: m.default })));

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

// Wildland Fire Recovery Fund - Main Application Component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

                  {/* ✅ Auth callback (must exist for magic link PKCE exchange) */}
                  <Route path="/auth-callback" element={<AuthCallback />} />

                  {/* Blog routes - more specific routes first */}
                  <Route path="/blog/editor" element={<BlogEditorPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}