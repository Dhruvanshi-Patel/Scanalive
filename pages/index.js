import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, recordLoginAudit } from '../lib/supabaseClient';
import { getMockSession, setMockSession, clearMockSession, getMockLoginLogs, addMockLoginLog } from '../lib/mockAuth';
import LoginLogsTable from '../components/LoginLogsTable';
import TargetShowcaseModal from '../components/TargetShowcaseModal';
import SupabaseSetupModal from '../components/SupabaseSetupModal';
import { 
  Camera, ShieldCheck, LogOut, Sparkles, Lock, ArrowRight, UserCheck, 
  Database, Image as ImageIcon, AlertCircle, RefreshCw, Key, Shield, Layers 
} from 'lucide-react';

export default function WebARApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Audit Logs state
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Modal states
  const [showTargetShowcase, setShowTargetShowcase] = useState(false);
  const [showSupabaseSetup, setShowSupabaseSetup] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  // Load audit logs
  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    if (supabaseActive) {
      try {
        const { data, error } = await supabase
          .from('login_logs')
          .select('*')
          .order('logged_at', { ascending: false })
          .limit(50);
        
        if (!error && data) {
          setLogs(data);
        } else {
          // Fallback to local logs if RLS prevents reading other users or table hasn't been created yet
          setLogs(getMockLoginLogs());
        }
      } catch (err) {
        setLogs(getMockLoginLogs());
      }
    } else {
      setLogs(getMockLoginLogs());
    }
    setIsLoadingLogs(false);
  };

  useEffect(() => {
    // 1. Initial Session Check
    if (supabaseActive) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      // 2. Monitor user authentication handshakes automatically
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        
        // Audit Interception: Track successfully signed-in users in custom public.login_logs table
        if (event === 'SIGNED_IN' && session?.user) {
          await recordLoginAudit(session.user);
          fetchAuditLogs();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo Mode Session
      const localUser = getMockSession();
      setUser(localUser);
      setLogs(getMockLoginLogs());
    }
  }, [supabaseActive]);

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  // Auth Submit Processing
  const handleAuthProcessing = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (supabaseActive) {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Registration successful! Check email or log in directly.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Welcome back! Initializing secure dashboard...');
        }
      }
    } else {
      // Demo Mode Auth Simulation
      setTimeout(() => {
        const newUser = setMockSession(email);
        setUser(newUser);
        setLogs(getMockLoginLogs());
        setSuccessMessage('Successfully authenticated in Demo Mode!');
        setIsLoading(false);
      }, 600);
      return;
    }
    setIsLoading(false);
  };

  // Handle Logout
  const handleSignOut = async () => {
    if (supabaseActive) {
      await supabase.auth.signOut();
    } else {
      clearMockSession();
    }
    setUser(null);
    setArActive(false);
  };

  // GATEWAY CONTROLLER 1: Render Public Login/Sign-Up Gateway for Unauthenticated Visitors
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Top Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '480px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
              NEXT.JS + SUPABASE + MINDAR
            </span>
          </div>

          <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '8px' }}>
            No-QR Cloud WebAR Scanner
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            Secure Cloud-Authenticated WebAR Platform with Automated PostgreSQL Login Audit Tracking.
          </p>
        </div>

        {/* Auth Gateway Form Panel */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <Lock size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
              {isSignUp ? 'Create Cloud Account' : 'Sign In Portal Gateway'}
            </h2>
          </div>

          {!supabaseActive && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#fcd34d',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>Running in <strong>Demo Mode</strong>. You can sign in with any email to test!</span>
            </div>
          )}

          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#fda4af'
            }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#6ee7b7'
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAuthProcessing}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Account Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Account Security Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying Handshake...' : (isSignUp ? 'Register Account' : 'Enter Dashboard Portal')}
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isSignUp ? 'Already registered? Switch to Sign In' : "Don't have an account? Create one now"}
              </button>
            </div>
          </form>

          {/* Quick Setup Actions */}
          <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => setShowSupabaseSetup(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Database size={13} style={{ color: 'var(--accent-blue)' }} /> Configure Supabase Connection & SQL Table
            </button>
          </div>
        </div>

        <SupabaseSetupModal 
          isOpen={showSupabaseSetup} 
          onClose={() => setShowSupabaseSetup(false)} 
        />
      </div>
    );
  }

  // GATEWAY CONTROLLER 2: Render Protected Dashboard Control Hub for Validated Users
  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* FULLSCREEN AR CAMERA VIEWPORT MODE */}
      {arActive ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}>
          {/* Top Controls Header */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 100000,
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <button 
              onClick={() => setArActive(false)} 
              className="btn-primary"
              style={{
                pointerEvents: 'auto',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#fff',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '14px',
                boxShadow: '0 0 25px rgba(244, 63, 94, 0.4)'
              }}
            >
              ✕ Exit AR Lens Scanner
            </button>

            <button 
              onClick={() => setShowTargetShowcase(true)}
              className="btn-secondary"
              style={{
                pointerEvents: 'auto',
                padding: '10px 18px',
                borderRadius: '30px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: '600'
              }}
            >
              <ImageIcon size={16} /> View Target Print Cards
            </button>
          </div>

          {/* Standalone MindAR + A-Frame Camera WebAR Engine iframe */}
          <iframe 
            src="/ar-lens-engine.html" 
            allow="camera; microphone; display-capture" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
        </div>
      ) : null}

      {/* DASHBOARD PROFILE CONTROL HUB VIEW */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Navigation / Header Bar */}
        <header style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-glass)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070a12',
              boxShadow: 'var(--shadow-glow-cyan)'
            }}>
              <Camera size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                WebAR Scanner Dashboard
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Protected JWT Session • Centralized Audit Tracking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="glass-panel" style={{ padding: '8px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{user.email}</span>
            </div>

            <button onClick={handleSignOut} className="btn-secondary" style={{ color: '#fda4af' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        {/* Primary CTA Hero Section */}
        <div className="glass-panel glass-panel-interactive" style={{
          padding: '36px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.1)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="pulse-badge">
                <span className="pulse-dot" /> WebAR Engine Ready
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>MindAR v1.2.5 + A-Frame v1.5.0</span>
            </div>
            
            <h2 className="text-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
              No-QR Physical Print AR Recognition Lens
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Scan custom target prints across angles and device flash profiles without needing unique QR codes on the physical media.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => setArActive(true)} 
              className="btn-primary btn-emerald"
              style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '30px' }}
            >
              <Camera size={22} /> Access AR View Lens
            </button>

            <button 
              onClick={() => setShowTargetShowcase(true)}
              className="btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <ImageIcon size={16} /> Preview Sample Target Cards
            </button>
          </div>
        </div>

        {/* System Stats Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Authentication Provider</span>
              <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              {supabaseActive ? 'Supabase Auth API' : 'Demo Session Engine'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {supabaseActive ? 'JWT session verified in cookies' : 'Local state authentication'}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>PostgreSQL Audit Table</span>
              <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              public.login_logs
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {logs.length} logged handshake events recorded
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Target Recognition</span>
              <Layers size={18} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              MindAR Feature Map
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              targets.mind (.mind binary format)
            </div>
          </div>
        </div>

        {/* Login Audit Logs Table Component */}
        <LoginLogsTable 
          logs={logs} 
          onRefresh={fetchAuditLogs} 
          isLoading={isLoadingLogs} 
        />

        {/* Database Migration & Credentials Setup Modal */}
        <SupabaseSetupModal 
          isOpen={showSupabaseSetup} 
          onClose={() => setShowSupabaseSetup(false)} 
        />

        {/* Target Showcase Modal */}
        <TargetShowcaseModal 
          isOpen={showTargetShowcase} 
          onClose={() => setShowTargetShowcase(false)} 
          onOpenScanner={() => setArActive(true)}
        />
      </div>
    </div>
  );
}
