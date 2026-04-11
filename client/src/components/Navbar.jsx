import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─── Icons ──────────────────────────────────────────────────── */
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

/* ─── Nav items config ───────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Home",     to: "/",        protected: false },
  // { label: "Research", to: "/research",protected: true  },
  { label: "Drafting", to: "/draft",protected: true  },
];

/* ─── Auth gate toast ────────────────────────────────────────── */
function AuthToast({ show, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <div
      className="fixed top-[84px] left-1/2 -translate-x-1/2 z-[200] transition-all duration-300"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translate(-50%, 0)" : "translate(-50%, -12px)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg"
        style={{
          background: "rgba(14,15,16,0.92)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(176,138,62,0.2)", color: "#c9a45a" }}>
          <UserIcon />
        </span>
        Please sign up to access this feature
        <Link
          to="/signup"
          className="no-underline px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors duration-200"
          style={{ background: "#b08a3e", color: "#fff" }}
          onClick={onClose}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */
export default function Navbar({ activePage = "Home" }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  /*
    Mock auth state — replace with real auth context later.
    For now, reads from localStorage so it persists across page reloads.
    Set localStorage.setItem("nyaya_user", JSON.stringify({ name: "Anila" })) in console to test.
  */
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nyaya_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!user;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (item, e) => {
    // if (item.protected && !isLoggedIn) {
    //   e.preventDefault();
    //   setShowToast(true);
    //   setMobileOpen(false);
    // } else {
      setMobileOpen(false);
    // }
  };

  const handleLogout = () => {
    localStorage.removeItem("nyaya_user");
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-[72px] transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
        style={{
          background: scrolled ? "rgba(245,242,235,0.92)" : "rgba(245,242,235,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "0.5px solid rgba(14,15,16,0.10)",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#0e0f10]"
            style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#0e0f10" }}
          >
            न
          </div>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, color: "#0e0f10", letterSpacing: "-0.3px" }}>
            Nyaya AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.to}
              onClick={e => handleNavClick(item, e)}
              className="no-underline transition-colors duration-200"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                fontWeight: activePage === item.label ? 600 : 500,
                color: activePage === item.label ? "#1a5c60" : "#4a4b4f",
                borderBottom: activePage === item.label ? "2px solid #1a5c60" : "2px solid transparent",
                paddingBottom: 4,
              }}
              onMouseEnter={e => { if (activePage !== item.label) e.currentTarget.style.color = "#0e0f10"; }}
              onMouseLeave={e => { if (activePage !== item.label) e.currentTarget.style.color = "#4a4b4f"; }}
            >
              {item.label}
            </Link>
          ))}

          {/* Auth area */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(216,236,236,0.4)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#1a5c60", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#0e0f10" }}>
                  Hello, {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[12px] font-medium cursor-pointer transition-colors duration-200"
                style={{ all: "unset", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.06em", textTransform: "uppercase" }}
                onMouseEnter={e => e.currentTarget.style.color = "#e53e3e"}
                onMouseLeave={e => e.currentTarget.style.color = "#9a9ba0"}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link to="/auth"
                className="text-[13px] font-medium no-underline px-5 py-2.5 rounded-lg border transition-all duration-200"
                style={{ fontFamily: "'DM Sans',sans-serif", color: "#0e0f10", borderColor: "rgba(14,15,16,0.18)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(14,15,16,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(14,15,16,0.18)"}
              >
                Sign in
              </Link>
              <Link to="/signup"
                className="text-[13px] font-medium no-underline px-5 py-2.5 rounded-lg transition-all duration-200"
                style={{ fontFamily: "'DM Sans',sans-serif", background: "#0e0f10", color: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a5c60"}
                onMouseLeave={e => e.currentTarget.style.background = "#0e0f10"}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          style={{ color: "#0e0f10", background: "transparent", border: "none" }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 animate-[fadeIn_0.2s_ease]"
               style={{ background: "rgba(14,15,16,0.4)", backdropFilter: "blur(4px)" }} />
          <div
            className="absolute top-0 right-0 h-full w-[300px] p-8 flex flex-col gap-5 animate-[fadeIn_0.25s_ease]"
            style={{ background: "#f5f2eb", boxShadow: "-8px 0 32px rgba(14,15,16,0.12)" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="self-end w-8 h-8 flex items-center justify-center cursor-pointer"
              style={{ color: "#0e0f10", background: "transparent", border: "none" }}
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon />
            </button>

            {/* User greeting in mobile */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(216,236,236,0.3)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#1a5c60", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "#0e0f10", fontFamily: "'DM Sans',sans-serif" }}>
                    Hello, {user.name}
                  </p>
                  <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>Dashboard</p>
                </div>
              </div>
            )}

            {NAV_ITEMS.map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={e => handleNavClick(item, e)}
                className="text-[15px] font-medium no-underline flex items-center justify-between"
                style={{
                  color: activePage === item.label ? "#1a5c60" : "#0e0f10",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {item.label}
                {item.protected && !isLoggedIn && (
                  <span className="px-2 py-0.5 rounded text-[9px]"
                        style={{ fontFamily: "'DM Mono',monospace", background: "rgba(176,138,62,0.12)", color: "#b08a3e", letterSpacing: "0.06em" }}>
                    LOGIN
                  </span>
                )}
              </Link>
            ))}

            <div className="border-t pt-5 mt-auto flex flex-col gap-3" style={{ borderColor: "rgba(14,15,16,0.12)" }}>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-center text-[14px] font-medium px-5 py-2.5 rounded-lg cursor-pointer transition-colors duration-200"
                  style={{ all: "unset", cursor: "pointer", textAlign: "center", display: "block", width: "100%", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, padding: "10px 20px", borderRadius: 10, border: "0.5px solid rgba(229,62,62,0.3)", color: "#e53e3e", background: "rgba(229,62,62,0.05)" }}
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link to="/auth"
                    className="text-center text-[14px] font-medium no-underline px-5 py-2.5 rounded-lg border"
                    style={{ fontFamily: "'DM Sans',sans-serif", color: "#0e0f10", borderColor: "rgba(14,15,16,0.22)" }}>
                    Sign in
                  </Link>
                  <Link to="/signup"
                    className="text-center text-[14px] font-medium no-underline px-5 py-2.5 rounded-lg"
                    style={{ fontFamily: "'DM Sans',sans-serif", background: "#0e0f10", color: "#fff" }}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth toast */}
      <AuthToast show={showToast} onClose={() => setShowToast(false)} />
    </>
  );
}
