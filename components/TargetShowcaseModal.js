import React from 'react';
import { X, Camera, ExternalLink, Download, Sparkles, AlertCircle } from 'lucide-react';

export default function TargetShowcaseModal({ isOpen, onClose, onOpenScanner }) {
  if (!isOpen) return null;

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
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 0 50px rgba(0, 242, 254, 0.2)'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0,242,254,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            border: '1px solid rgba(0,242,254,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              Physical AR Target Prints
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No QR Codes Required — MindAR feature matching visual identification
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: '#e0f2fe', lineHeight: '1.5' }}>
            <strong>How to test WebAR image tracking:</strong>
            <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
              <li>Open this sample target on your smartphone screen, or display it on a second monitor/printed paper.</li>
              <li>Click <strong>"Launch WebAR Camera Scanner"</strong> below.</li>
              <li>Point your camera at the card image below to unlock the 3D WebAR holographic video overlay!</li>
            </ol>
          </div>
        </div>

        {/* Target Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '16px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', border: '2px dashed var(--accent-cyan)' }}>
              {/* Dynamic Rendered Sample Target Canvas / Image */}
              <img 
                src="/targets/sample-target-1.png" 
                alt="Target Print 1" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0f172a' }}
                onError={(e) => {
                  // Fallback visual target generator on error
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px radial #00f2fe', background: 'radial-gradient(circle, rgba(0,242,254,0.4) 0%, rgba(59,130,246,0.1) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Sparkles size={28} style={{ color: '#00f2fe' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '1px', color: '#00f2fe' }}>MINDAR TARGET #1</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>High-Feature Print Map</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Target Print 01</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Feature Map: targets.mind</p>
              </div>
              <a 
                href="/targets/sample-target-1.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <ExternalLink size={13} /> View
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} className="btn-secondary">
            Close Showcase
          </button>
          <button 
            onClick={() => {
              onClose();
              if (onOpenScanner) onOpenScanner();
            }} 
            className="btn-primary"
          >
            <Camera size={18} /> Launch WebAR Camera Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
