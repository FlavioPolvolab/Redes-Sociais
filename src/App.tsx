import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import Dashboard from "./components/pages/dashboard";
import Profile from "./components/pages/profile";
import Users from "./components/pages/users";
import Settings from "./components/pages/settings";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import ContentSubmission from "./components/pages/content-submission";
import ContentApproval from "./components/pages/content-approval";
import VersionHistory from "./components/pages/version-history";
import { AuthProvider, useAuth } from "../supabase/auth";
import type { AuthContextType } from "../types/auth";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen, LoadingSpinner } from "./components/ui/loading-spinner";
import ContentDetails from "./components/pages/content-details";
import UserManagement from "./components/pages/user-management";

function PrivateRoute({ children, requiredPerfil }: { children: React.ReactNode; requiredPerfil?: string[] }) {
  const auth = useAuth();
  const { user, loading } = auth;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredPerfil && !requiredPerfil.includes(user.perfil)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, loading } = auth;

  if (loading) {
    return <LoadingScreen text="Carregando..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/dashboard" />
            </PrivateRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpForm />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/nova"
          element={
            <PrivateRoute requiredPerfil={["solicitante", "admin"]}>
              <ContentSubmission />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/aprovacao"
          element={
            <PrivateRoute requiredPerfil={["aprovador", "admin"]}>
              <ContentApproval />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/historico"
          element={
            <PrivateRoute>
              <VersionHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/:id"
          element={
            <PrivateRoute>
              <ContentDetails />
            </PrivateRoute>
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute requiredPerfil={["admin"]}>
              <UserManagement />
            </PrivateRoute>
          }
        />
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen text="Carregando aplicação..." />}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
