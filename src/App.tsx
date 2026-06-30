import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { NewsSection } from './components/NewsSection';
import { ChatbotWidget } from './components/ChatbotWidget';
import { SEO } from './components/SEO';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

const Staff = lazy(() => import('./pages/Staff').then(m => ({ default: m.Staff })));
const Documents = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })));
const Achievements = lazy(() => import('./pages/Achievements').then(m => ({ default: m.Achievements })));
const Sport = lazy(() => import('./pages/Sport').then(m => ({ default: m.Sport })));
const Activities = lazy(() => import('./pages/Activities').then(m => ({ default: m.Activities })));
const Admissions = lazy(() => import('./pages/Admissions').then(m => ({ default: m.Admissions })));
const Boarding = lazy(() => import('./pages/Boarding').then(m => ({ default: m.Boarding })));
const ExtraCurricular = lazy(() => import('./pages/ExtraCurricular').then(m => ({ default: m.ExtraCurricular })));
const StudentLogin = lazy(() => import('./pages/StudentLogin').then(m => ({ default: m.StudentLogin })));
const StudentPortal = lazy(() => import('./pages/StudentPortal').then(m => ({ default: m.StudentPortal })));

// Admin imports
const AdminLogin = lazy(() => import('./admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const ProtectedRoute = lazy(() => import('./admin/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const NewsEditor = lazy(() => import('./admin/editors/NewsEditor').then(m => ({ default: m.NewsEditor })));
const AboutEditor = lazy(() => import('./admin/editors/AboutEditor').then(m => ({ default: m.AboutEditor })));
const AchievementsEditor = lazy(() => import('./admin/editors/AchievementsEditor').then(m => ({ default: m.AchievementsEditor })));
const DocumentsEditor = lazy(() => import('./admin/editors/DocumentsEditor').then(m => ({ default: m.DocumentsEditor })));
const ExtraCurricularEditor = lazy(() => import('./admin/editors/ExtraCurricularEditor').then(m => ({ default: m.ExtraCurricularEditor })));
const ApplicationsEditor = lazy(() => import('./admin/editors/ApplicationsEditor').then(m => ({ default: m.ApplicationsEditor })));
const ContactEditor = lazy(() => import('./admin/editors/ContactEditor').then(m => ({ default: m.ContactEditor })));
const StudentDocsEditor = lazy(() => import('./admin/editors/StudentDocsEditor').then(m => ({ default: m.StudentDocsEditor })));

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-school-green rounded-full animate-spin" />
  </div>
);

const HomePage = () => (
  <>
    <SEO
      title="Mount Hargreaves Senior Secondary School | Matatiele, Eastern Cape"
      description="Mount Hargreaves Senior Secondary School is a public boarding school in Matatiele, Eastern Cape, offering Grades 8–12 under the CAPS curriculum. 94.5% matric pass rate. Apply now for 2027."
      path="/"
    />
    <Hero />
    <NewsSection />
    <Home />
  </>
);

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PageShell><HomePage /></PageShell>} />
          <Route path="/about" element={<PageShell><About /></PageShell>} />
          <Route path="/staff" element={<PageShell><Staff /></PageShell>} />
          <Route path="/documents" element={<PageShell><Documents /></PageShell>} />
          <Route path="/achievements" element={<PageShell><Achievements /></PageShell>} />
          <Route path="/sport" element={<PageShell><Sport /></PageShell>} />
          <Route path="/activities" element={<PageShell><Activities /></PageShell>} />
          <Route path="/extra-curricular" element={<PageShell><ExtraCurricular /></PageShell>} />
          <Route path="/admissions" element={<PageShell><Admissions /></PageShell>} />
          <Route path="/boarding" element={<PageShell><Boarding /></PageShell>} />
          <Route path="/contact" element={<PageShell><Contact /></PageShell>} />

          {/* Student portal routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student" element={<StudentPortal />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<NewsEditor />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="achievements" element={<AchievementsEditor />} />
            <Route path="documents" element={<DocumentsEditor />} />
            <Route path="extra-curricular" element={<ExtraCurricularEditor />} />
            <Route path="applications" element={<ApplicationsEditor />} />
            <Route path="student-documents" element={<StudentDocsEditor />} />
            <Route path="contact" element={<ContactEditor />} />
          </Route>
        </Routes>
      </Suspense>

      <ChatbotWidget />
    </Router>
  );
}
