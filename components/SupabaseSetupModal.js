import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ExternalLink, Key, ShieldCheck, FolderPlus } from 'lucide-react';

export default function SupabaseSetupModal({ isOpen, onClose, onSaveCredentials }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- 1. Create the tracking table
create table if not exists public.login_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  logged_at timestamptz default now() not null,
  user_agent text
);

-- 2. Create the shared media assets table for WebAR photos & videos
create table if not exists public.media_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  target_index integer default 0 not null,
  title text not null,
  media_url text not null,
  media_type text not null, -- 'video' or 'image'
  created_at timestamptz default now() not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.login_logs enable row level security;
alter table public.media_assets enable row level security;

-- 4. Security policies
create policy "Users view login logs" on public.login_logs for select using ( auth.uid() = user_id );
create policy "Insert login logs" on public.login_logs for insert with check ( true );

create policy "Public read media assets" on public.media_assets for select using ( true );
create policy "Authenticated insert media assets" on public.media_assets for insert with check ( true );

-- 5. Storage Bucket Note:
-- In your Supabase Dashboard -> Storage -> Create a new PUBLIC bucket named: ar-media`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (url && key) {
      localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
      localStorage.setItem('CUSTOM_SUPABASE_KEY', key.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (onSaveCredentials) onSaveCredentials();
        onClose();
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)'
          }}>
            <Database size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              Supabase Database & Storage Setup
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Schema script for login audit tracking and shared AR media storage
            </p>
          </div>
        </div>

        {/* SQL Script Box */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} /> 1. Execute SQL Script in Supabase Editor:
            </span>
            <button 
              onClick={handleCopySql} 
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
            >
              {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
              {copied ? 'Copied SQL!' : 'Copy SQL Script'}
            </button>
          </div>

          <pre className="font-mono" style={{
            background: '#070a12',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            color: '#38bdf8',
            fontSize: '12px',
            overflowX: 'auto',
            lineHeight: '1.5'
          }}>
            {sqlScript}
          </pre>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={16} style={{ color: 'var(--accent-cyan)' }} /> 2. Connect Your Live Supabase Credentials:
          </h4>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Supabase Project URL</label>
            <input 
              type="url" 
              placeholder="https://your-project-id.supabase.co" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field" 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Supabase Anon Public API Key</label>
            <input 
              type="text" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="input-field" 
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ fontSize: '13px', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Open Supabase Dashboard <ExternalLink size={13} />
            </a>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                {savedSuccess ? <Check size={16} /> : <ShieldCheck size={16} />}
                {savedSuccess ? 'Saved Credentials!' : 'Connect Supabase'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
