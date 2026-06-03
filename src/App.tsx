import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Login } from "@/components/Login";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, status } = useAuth();

  // Mientras Firebase verifica la sesión, no renderizar nada
  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "hsl(220 20% 97%)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid hsl(215 85% 25% / 0.2)",
            borderTopColor: "hsl(215 85% 25%)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Si no hay sesión, mostrar Login
  if (status === "unauthenticated") {
    return (
      <Login
        onLogin={async (email, password) => {
          await signInWithEmailAndPassword(auth, email, password);
          // onAuthStateChanged en useAuth actualizará el estado automáticamente
        }}
      />
    );
  }

  // Sesión activa → app normal
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;