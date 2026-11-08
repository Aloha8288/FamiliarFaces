import { MemoryRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from './lib/store';
import type { Role } from './lib/types';
import { ToastProvider } from './components/ui';
import { AppShell } from './components/AppShell';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import RoleSelect from './pages/RoleSelect';
import StudentOnboarding from './pages/student/StudentOnboarding';
import FamilyOnboarding from './pages/family/FamilyOnboarding';
import StudentDashboard from './pages/student/StudentDashboard';
import FindCompanion from './pages/student/FindCompanion';
import ResidentDetail from './pages/student/ResidentDetail';
import MyCommitment from './pages/student/MyCommitment';
import VisitsHours from './pages/student/VisitsHours';
import StudentProfilePage from './pages/student/StudentProfilePage';
import FamilyDashboard from './pages/family/FamilyDashboard';
import LovedOneProfile from './pages/family/LovedOneProfile';
import CompanionRequests from './pages/family/CompanionRequests';
import FindVolunteer from './pages/family/FindVolunteer';
import FamilyJournal from './pages/family/Journal';
import StudentJournal from './pages/student/Journal';
import VisitsApprovals from './pages/family/VisitsApprovals';
import Support from './pages/Support';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// The single-file preview build keeps routes in memory; Netlify uses clean URLs.
const Router = MemoryRouter;

const homeFor = (role: Role | null) => (role === 'family' ? '/family' : '/student');

function RequireApp({ role }: { role?: Role }) {
  const { user, peekNextPath } = useStore();
  if (!user) return <Navigate to={peekNextPath() ?? '/signin'} replace />;
  if (!user.role) return <Navigate to="/welcome" replace />;
  if (!user.onboarded) return <Navigate to={`/onboarding/${user.role}`} replace />;
  if (role && user.role !== role) {
    const next = peekNextPath();
    return <Navigate to={next && next.startsWith(homeFor(user.role)) ? next : homeFor(user.role)} replace />;
  }
  return <Outlet />;
}

function RequireOnboarding({ role, children }: { role: Role; children: ReactNode }) {
  const { user, peekNextPath } = useStore();
  if (!user) return <Navigate to={peekNextPath() ?? '/signin'} replace />;
  if (!user.role) return <Navigate to="/welcome" replace />;
  if (user.role !== role) return <Navigate to={`/onboarding/${user.role}`} replace />;
  if (user.onboarded) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}

function RequireNoRole({ children }: { children: ReactNode }) {
  const { user, peekNextPath } = useStore();
  if (!user) return <Navigate to={peekNextPath() ?? '/signin'} replace />;
  if (user.role) return <Navigate to={user.onboarded ? homeFor(user.role) : `/onboarding/${user.role}`} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Auth mode="signin" />} />
            <Route path="/about" element={<Landing />} />
            <Route path="/signin" element={<Auth mode="signin" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/welcome" element={<RequireNoRole><RoleSelect /></RequireNoRole>} />
            <Route path="/onboarding/student" element={<RequireOnboarding role="student"><StudentOnboarding /></RequireOnboarding>} />
            <Route path="/onboarding/family" element={<RequireOnboarding role="family"><FamilyOnboarding /></RequireOnboarding>} />

            <Route element={<RequireApp />}>
              <Route element={<AppShell />}>
                <Route element={<RequireApp role="student" />}>
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/find" element={<FindCompanion />} />
                  <Route path="/student/residents/:id" element={<ResidentDetail />} />
                  <Route path="/student/commitment" element={<MyCommitment />} />
                  <Route path="/student/visits" element={<VisitsHours />} />
                  <Route path="/student/journal" element={<StudentJournal />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                  <Route path="/student/support" element={<Support />} />
                </Route>
                <Route element={<RequireApp role="family" />}>
                  <Route path="/family" element={<FamilyDashboard />} />
                  <Route path="/family/loved-one" element={<LovedOneProfile />} />
                  <Route path="/family/find" element={<FindVolunteer />} />
                  <Route path="/family/requests" element={<CompanionRequests />} />
                  <Route path="/family/visits" element={<VisitsApprovals />} />
                  <Route path="/family/journal" element={<FamilyJournal />} />
                  <Route path="/family/support" element={<Support />} />
                </Route>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </StoreProvider>
  );
}
