import { useState } from 'react';
import { supabase } from './lib/supabase';

const C = {
  primary: "#33543E", primarySoft: "#E6EFE9",
  bg: "#F7F7F4", card: "#FFFFFF", surface: "#EEEFEB",
  text: "#1E261F", textSec: "#5A6E5E", textMuted: "#92A596",
  border: "#D8DFD8", borderLight: "#E8ECE6",
  btn: "#5B21B6",
  raiGrad: "linear-gradient(145deg, #1E261F 0%, #33543E 55%, #558B68 100%)",
};

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        // Update profile with company
        if (company) {
          await supabase.from('profiles').update({ company, full_name: fullName }).eq('id', data.user.id);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit', system-ui, sans-serif", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ background: C.raiGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em" }}>Retayned.</div>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 8 }}>
            {mode === 'signin' ? 'Welcome back.' : 'Start retaining your clients.'}
          </p>
        </div>

        {/* Form */}
        <div style={{ background: C.card, borderRadius: 14, padding: "28px 24px", border: "1px solid " + C.border }}>
          {mode === 'signup' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Full name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Adam Lawrence" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="TopMercury" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
              </div>
            </>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
          </div>

          {error && <p style={{ fontSize: 13, color: "#C4432B", marginBottom: 14 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", background: C.btn, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 16 }}>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} style={{ color: C.primary, fontWeight: 600, cursor: "pointer" }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
