import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Gauge } from "lucide-react";
import logoMService from "@/assets/LOGO_SIN_FONDO.png";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-email": "El correo electrónico no es válido.",
  "auth/user-not-found": "No existe una cuenta con este correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
  "auth/network-request-failed": "Error de red. Verifica tu conexión.",
};

interface LoginProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      await onLogin?.(email, password);
    } catch (err: any) {
      const code: string = err?.code ?? "";
      setError(FIREBASE_ERRORS[code] ?? "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        backgroundColor: "hsl(220 20% 97%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Mobile header (oculto en desktop) ── */}
      <div
        className="login-mobile-header"
        style={{
          display: "none",
          background:
            "linear-gradient(155deg, hsl(215 85% 18%) 0%, hsl(215 85% 28%) 50%, hsl(210 90% 38%) 100%)",
          padding: "20px 24px 18px",
          alignItems: "center",
          gap: "12px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Franja naranja superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "3px",
            background: "linear-gradient(90deg, hsl(35 95% 55%), hsl(25 95% 50%))",
          }}
        />
        <img
          src={logoMService}
          alt="M Service Chile"
          style={{ width: "46px", height: "46px", objectFit: "contain", flexShrink: 0 }}
        />
        <div>
          <div
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: "17px",
              letterSpacing: "-0.3px",
            }}
          >
            M Service
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "11px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Inspecciones
          </div>
        </div>
      </div>

      {/* ── Contenedor principal ── */}
      <div
        className="login-body"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
        }}
      >
        {/* ── Panel izquierdo (solo desktop) ── */}
        <div
          className="login-left"
          style={{
            flex: "0 0 45%",
            background:
              "linear-gradient(155deg, hsl(215 85% 18%) 0%, hsl(215 85% 28%) 50%, hsl(210 90% 38%) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 56px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decoraciones geométricas */}
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", bottom: "60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
          {/* Franja naranja lateral */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "linear-gradient(180deg, hsl(35 95% 55%), hsl(25 95% 50%))" }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "64px" }}>
            <img
              src={logoMService}
              alt="M Service Chile"
              style={{ width: "64px", height: "64px", objectFit: "contain" }}
            />
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px" }}>M Service</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>Inspecciones</div>
            </div>
          </div>

          {/* Título */}
          <div style={{ marginBottom: "48px" }}>
            <h1 style={{ color: "white", fontSize: "38px", fontWeight: "700", lineHeight: "1.15", letterSpacing: "-0.8px", marginBottom: "16px" }}>
              Inspecciones
              <span style={{ color: "hsl(35 95% 65%)" }}>M Service.</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: "1.6", fontFamily: "system-ui, sans-serif", fontWeight: "400", maxWidth: "300px" }}>
              Plataforma de inspección y diagnóstico para técnicos M Service.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: ShieldCheck, text: "Informes en PDF con firma digital" },
              { icon: Gauge, text: "Control de kilometraje y mantenimiento" },
              { icon: Lock, text: "Acceso exclusivo para técnicos" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontFamily: "system-ui, sans-serif" }}>
                <Icon size={14} color="hsl(35 95% 65%)" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho (formulario) ── */}
        <div
          className="login-right"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            {/* Encabezado del formulario */}
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: "700", color: "hsl(222 47% 11%)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
                Iniciar sesión
              </h2>
              <p style={{ color: "hsl(215 16% 47%)", fontSize: "14px", fontFamily: "system-ui, sans-serif" }}>
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "hsl(222 47% 11%)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.2px" }}>
                  Correo electrónico
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="hsl(215 16% 57%)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tecnico@mservice.cl"
                    autoComplete="email"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px 12px 40px",
                      fontSize: "14px",
                      fontFamily: "system-ui, sans-serif",
                      color: "hsl(222 47% 11%)",
                      backgroundColor: "white",
                      border: error ? "1.5px solid hsl(0 84% 60%)" : "1.5px solid hsl(214 31% 91%)",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(215 85% 40%)"; }}
                    onBlur={(e) => { e.target.style.borderColor = error ? "hsl(0 84% 60%)" : "hsl(214 31% 91%)"; }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "hsl(222 47% 11%)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.2px" }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    style={{ fontSize: "12px", color: "hsl(215 85% 35%)", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="hsl(215 16% 57%)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 42px 12px 40px",
                      fontSize: "14px",
                      fontFamily: "system-ui, sans-serif",
                      color: "hsl(222 47% 11%)",
                      backgroundColor: "white",
                      border: error ? "1.5px solid hsl(0 84% 60%)" : "1.5px solid hsl(214 31% 91%)",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(215 85% 40%)"; }}
                    onBlur={(e) => { e.target.style.borderColor = error ? "hsl(0 84% 60%)" : "hsl(214 31% 91%)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", color: "hsl(215 16% 57%)", display: "flex" }}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: "10px 14px", backgroundColor: "hsl(0 84% 97%)", border: "1px solid hsl(0 84% 85%)", borderRadius: "8px", color: "hsl(0 70% 40%)", fontSize: "13px", fontFamily: "system-ui, sans-serif" }}>
                  {error}
                </div>
              )}

              {/* Botón submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "4px",
                  padding: "13px",
                  background: loading ? "hsl(215 85% 45%)" : "linear-gradient(135deg, hsl(215 85% 25%), hsl(210 90% 38%))",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                  fontFamily: "system-ui, sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.1px",
                  boxShadow: loading ? "none" : "0 4px 20px -4px hsl(215 85% 25% / 0.45)",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.8 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Verificando...
                  </>
                ) : (
                  "Ingresar al sistema"
                )}
              </button>
            </form>

            {/* Footer */}
            <p style={{ marginTop: "32px", textAlign: "center", fontSize: "12px", color: "hsl(215 16% 60%)", fontFamily: "system-ui, sans-serif", lineHeight: "1.5" }}>
              Acceso restringido a técnicos autorizados.
              <br />Para solicitudes de acceso, contacta al administrador.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Desktop (>768px) ── */
        .login-body { flex-direction: row; }
        .login-left { display: flex !important; }
        .login-mobile-header { display: none !important; }
        .login-right { padding: 48px; align-items: center; }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .login-body { flex-direction: column; }
          .login-left { display: none !important; }
          .login-mobile-header { display: flex !important; }
          .login-right {
            padding: 32px 24px 40px !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;