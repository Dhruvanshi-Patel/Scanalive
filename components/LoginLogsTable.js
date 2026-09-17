import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Laptop, Clock, Search, RefreshCw, Globe } from 'lucide-react';

export default function LoginLogsTable({ logs = [], onRefresh, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getDeviceBadge = (userAgent = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) {
      return (
        <span className="pulse-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <Smartphone size={12} /> iPhone Safari
        </span>
      );
    }
    if (ua.includes('android')) {
      return (
        <span className="pulse-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <Smartphone size={12} /> Android Web
        </span>
      );
    }
    if (ua.includes('macintosh') || ua.includes('mac os')) {
      return (
        <span className="pulse-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <Laptop size={12} /> macOS Web
        </span>
      );
    }
    if (ua.includes('windows')) {
      return (
        <span className="pulse-badge" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#38bdf8', borderColor: 'rgba(0, 242, 254, 0.3)' }}>
          <Laptop size={12} /> Windows Web
        </span>
      );
    }
    return (
      <span className="pulse-badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', borderColor: 'rgba(148, 163, 184, 0.3)' }}>
        <Globe size={12} /> Mobile Web
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user_agent && log.user_agent.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
              🔒 Automated Login Audit History
            </h3>
            <span className="pulse-badge">
              <span className="pulse-dot" /> Live DB Sync
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Handshake logs in <code style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>public.login_logs</code> PostgreSQL table.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', maxWidth: '320px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Search by email, UUID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field" 
              style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', width: '100%' }}
            />
          </div>

          {onRefresh && (
            <button onClick={onRefresh} className="btn-secondary" style={{ padding: '8px 12px', minHeight: '38px' }} title="Refresh Audit Log Table">
              <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Log Event ID</th>
              <th>Account Email</th>
              <th>User UUID (FK auth.users)</th>
              <th>Device Profile Signature</th>
              <th>Login Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No login records match your search.' : 'No login audit records found yet.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => {
                const dateStr = log.logged_at ? new Date(log.logged_at).toLocaleString() : 'Just now';
                return (
                  <tr key={log.id || index}>
                    <td className="font-mono" style={{ color: 'var(--accent-cyan)', fontSize: '12px' }}>
                      {log.id ? String(log.id).substring(0, 8) + '...' : `log_${index + 1}`}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {log.email}
                    </td>
                    <td className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {log.user_id ? String(log.user_id).substring(0, 13) + '...' : 'usr_anon'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>{getDeviceBadge(log.user_agent)}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.user_agent || 'Client Web Browser'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Clock size={13} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{dateStr}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)', flexWrap: 'wrap', gap: '8px' }}>
        <span>Showing {filteredLogs.length} audit entry log records</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: '#34d399' }} />
          <span>Row Level Security (RLS) Enforced</span>
        </div>
      </div>
    </div>
  );
}
