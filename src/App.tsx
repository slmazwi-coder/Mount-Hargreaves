import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { NewsSection } from './components/NewsSection';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Documents } from './pages/Documents';
import { Achievements } from './pages/Achievements';
import { ExtraCurricular } from './pages/ExtraCurricular';
import { Admissions } from './pages/Admissions';
import { Boarding } from './pages/Boarding';
import { Contact } from './pages/Contact';

// Admin imports
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/Dashboard';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { NewsEditor } from './admin/editors/NewsEditor';
import { AboutEditor } from './admin/editors/AboutEditor';
import { AchievementsEditor } from './admin/editors/AchievementsEditor';
import { DocumentsEditor } from './admin/editors/DocumentsEditor';
import { ExtraCurricularEditor } from './admin/editors/ExtraCurricularEditor';
import { ApplicationsEditor } from './admin/editors/ApplicationsEditor';
import { ContactEditor } from './admin/editors/ContactEditor';

const HomePage = () => (
  <>
    <Hero />
    <NewsSection />
    <Home />
  </>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><main className="flex-grow"><HomePage /></main><Footer /></>} />
        <Route path="/about" element={<><Navbar /><main className="flex-grow"><About /></main><Footer /></>} />
        <Route path="/documents" element={<><Navbar /><main className="flex-grow"><Documents /></main><Footer /></>} />
        <Route path="/achievements" element={<><Navbar /><main className="flex-grow"><Achievements /></main><Footer /></>} />
        <Route path="/extra-curricular" element={<><Navbar /><main className="flex-grow"><ExtraCurricular /></main><Footer /></>} />
        <Route path="/admissions" element={<><Navbar /><main className="flex-grow"><Admissions /></main><Footer /></>} />
        <Route path="/boarding" element={<><Navbar /><main className="flex-grow"><Boarding /></main><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><main className="flex-grow"><Contact /></main><Footer /></>} />

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
          <Route path="contact" element={<ContactEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}
