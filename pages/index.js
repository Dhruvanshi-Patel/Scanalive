import { useState, useEffect } from 'react';
import TargetShowcaseModal from '../components/TargetShowcaseModal';
import { optimizeTargetPhotoForAR } from '../lib/imageContrastOptimizer';
import { getGlobalARPairings, registerGlobalARPairing } from '../lib/arRegistry';
import { 
  Camera, Sparkles, Upload, Video, Image as ImageIcon, Copy, Check, 
  Share2, ArrowRight, Play, RefreshCw, Layers, ShieldCheck, Sun, Zap 
} from 'lucide-react';

export default function WebARApp() {
  const [arActive, setArActive] = useState(false);
  
  // Photo & Video Pairing State
  const [targetImage, setTargetImage] = useState(null);
  const [targetImagePreview, setTargetImagePreview] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Global Catalog
  const [globalCatalog, setGlobalCatalog] = useState([]);
  const [activeArMedia, setActiveArMedia] = useState(null);

  // Modals & Notifications
  const [showTargetShowcase, setShowTargetShowcase] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Central Global AR Catalog
  const loadCatalog = async () => {
    const pairings = await getGlobalARPairings();
    setGlobalCatalog(pairings);
    if (pairings && pairings.length > 0 && !activeArMedia) {
      setActiveArMedia(pairings[0]);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Handle Target Photo Selection with Automated Feature Contrast Optimizer
  const handleTargetPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsOptimizing(true);
      setTargetImage(file);
      // Run automated feature contrast enhancer for flares and blurs
      const optimized = await optimizeTargetPhotoForAR(file);
      setTargetImagePreview(optimized.previewUrl || URL.createObjectURL(file));
      setIsOptimizing(false);
    }
  };

  // Handle Video / Overlay Selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setCustomVideoUrl(url);
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Register Pair & Launch Scanner
  const handleRegisterAndLaunchAR = async () => {
    const finalVideoUrl = videoPreview || customVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const finalPhotoUrl = targetImagePreview || '/targets/sample-target-1.png';
    const finalTitle = customTitle || 'Augmented Video Overlay';

    const newPair = {
      photoUrl: finalPhotoUrl,
      videoUrl: finalVideoUrl,
      title: finalTitle
    };

    const updatedCatalog = await registerGlobalARPairing(newPair);
    setGlobalCatalog(updatedCatalog);
    setActiveArMedia(newPair);

    if (typeof window !== 'undefined') {
      localStorage.setItem('ACTIVE_AR_MEDIA', JSON.stringify({
        media_url: finalVideoUrl,
        media_type: 'video',
        title: finalTitle
      }));
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setArActive(true);
    }, 600);
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* FULLSCREEN AR CAMERA VIEWPORT */}
      {arActive ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}>
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
              ✕ Exit AR Scanner
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
              <ImageIcon size={16} /> Printable Target Cards
            </button>
          </div>

          <iframe 
            src={`/ar-lens-engine.html${activeArMedia ? `?videoUrl=${encodeURIComponent(activeArMedia.video_url || activeArMedia.media_url)}&title=${encodeURIComponent(activeArMedia.title)}` : ''}`} 
            allow="camera; microphone; display-capture" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
        </div>
      ) : null}

      {/* CLEAN MAIN WEBSITE VIEW */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Simple Brand Navbar */}
        <header style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-glass)',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
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
              <h1 className="text-gradient" style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }}>
                No-QR WebAR Studio
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Global AR Photo Scanner • Optimized for Lens Flares, Glare & Motion Blur
              </p>
            </div>
          </div>

          <button 
            onClick={() => setArActive(true)} 
            className="btn-primary btn-emerald"
            style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '30px' }}
          >
            <Camera size={18} /> Open Camera Scanner
          </button>
        </header>

        {/* TWO PRIMARY STUDIO OPTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          {/* OPTION 1: SCAN PHOTO PRINT */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)'
                }}>
                  <Camera size={24} />
                </div>

                <span className="pulse-badge">
                  <Zap size={12} /> Auto-Recognition Active
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                1. Scan Photo Print
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Point your phone camera at any registered target photo print. The system automatically recognizes the photo under harsh lighting, lens flares, and motion blurs!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => setArActive(true)}
                className="btn-primary btn-emerald"
                style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '14px' }}
              >
                <Camera size={20} /> Open Camera Scanner
              </button>

              <button 
                onClick={() => setShowTargetShowcase(true)}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ImageIcon size={16} /> View Printable Sample Target Cards
              </button>
            </div>
          </div>

          {/* OPTION 2: UPLOAD & PAIR PHOTO + VIDEO */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '32px',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <Upload size={24} />
              </div>

              <span className="pulse-badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                <Sun size={12} /> Flares & Blur Enhanced
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
              2. Upload Photo & Video Pair
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Pair a <strong>Target Photo</strong> with a <strong>Video</strong>. Anyone scanning the photo will see your video play automatically!
            </p>

            {/* Target Photo Upload */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  📸 TARGET PHOTO (Picture to scan)
                </label>
                {isOptimizing && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={11} className="spin-anim" /> Enhancing feature contrast...
                  </span>
                )}
              </div>

              <div style={{
                border: '1.5px dashed rgba(0, 242, 254, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input type="file" accept="image/*" onChange={handleTargetPhotoChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                {targetImagePreview ? (
                  <img src={targetImagePreview} alt="Target" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <ImageIcon size={20} />
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    {targetImage ? targetImage.name : 'Select or Drop Target Photo'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-sharpens for glare & blur resilience</div>
                </div>
              </div>
            </div>

            {/* Video Overlay Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                🎬 OVERLAY VIDEO (Video to play when scanned)
              </label>
              <div style={{
                border: '1.5px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input type="file" accept="video/*" onChange={handleVideoChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                {videoPreview ? (
                  <video src={videoPreview} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Video size={20} />
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    {videoFile ? videoFile.name : 'Select or Drop Video File'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MP4, WEBM video file</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRegisterAndLaunchAR}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '14px' }}
            >
              {saveSuccess ? <Check size={18} /> : <Play size={18} />}
              {saveSuccess ? 'Saved to Global Catalog!' : 'Save Pair & Open Scanner'}
            </button>
          </div>
        </div>

        {/* REGISTERED GLOBAL CATALOG SECTION */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                Global AR Catalog ({globalCatalog.length} Photo-Video Pairings)
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Anyone visiting the website scans these photos to play paired videos!
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {globalCatalog.map((item, idx) => (
              <div key={item.id || idx} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title || item.target_name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Target Photo: {item.target_name || 'Registered Target'}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActiveArMedia(item);
                    setArActive(true);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', minHeight: '34px', flexShrink: 0 }}
                >
                  <Camera size={13} style={{ color: 'var(--accent-cyan)' }} /> Test Scan
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Sample Targets Modal */}
        <TargetShowcaseModal 
          isOpen={showTargetShowcase} 
          onClose={() => setShowTargetShowcase(false)} 
          onOpenScanner={() => setArActive(true)}
        />
      </div>
    </div>
  );
}
