import { useState, useEffect } from 'react';
import TargetShowcaseModal from '../components/TargetShowcaseModal';
import { 
  Camera, Sparkles, Upload, Video, Image as ImageIcon, Copy, Check, 
  Share2, ArrowRight, Play, RefreshCw, Layers, Sparkle, Film
} from 'lucide-react';

export default function WebARApp() {
  const [arActive, setArActive] = useState(false);
  
  // Photo & Video Pairing State
  const [targetImage, setTargetImage] = useState(null);
  const [targetImagePreview, setTargetImagePreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Active Shared AR State
  const [activeArMedia, setActiveArMedia] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [showTargetShowcase, setShowTargetShowcase] = useState(false);

  // Check URL parameters for shared links (recipients opening shared WebAR links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const videoUrl = urlParams.get('videoUrl') || urlParams.get('mediaUrl');
      const photoUrl = urlParams.get('photoUrl');
      const title = urlParams.get('title');

      if (videoUrl) {
        const sharedObj = {
          media_url: videoUrl,
          media_type: 'video',
          photo_url: photoUrl || '',
          title: title || 'Shared AR Video Overlay'
        };
        setActiveArMedia(sharedObj);
        localStorage.setItem('ACTIVE_AR_MEDIA', JSON.stringify(sharedObj));
        // Auto-launch WebAR scanner for shared link recipients
        setArActive(true);
      }
    }
  }, []);

  // Handle Target Photo Selection
  const handleTargetPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetImage(file);
      setTargetImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Video / Overlay Selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Launch WebAR Scanner with paired target & video
  const handleLaunchAR = (mediaObj = null) => {
    let mediaToUse = mediaObj;

    if (!mediaToUse) {
      const finalVideoUrl = videoPreview || customVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      mediaToUse = {
        media_url: finalVideoUrl,
        media_type: 'video',
        photo_url: targetImagePreview || '',
        title: customTitle || 'Custom AR Video Overlay'
      };
    }

    setActiveArMedia(mediaToUse);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ACTIVE_AR_MEDIA', JSON.stringify(mediaToUse));
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/?videoUrl=${encodeURIComponent(mediaToUse.media_url)}&title=${encodeURIComponent(mediaToUse.title)}`;
      setShareLink(generatedLink);
    }
    setArActive(true);
  };

  const handleCopyLink = () => {
    if (!shareLink && typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const linkToCopy = `${baseUrl}/?videoUrl=${encodeURIComponent(activeArMedia?.media_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}&title=${encodeURIComponent(customTitle || 'AR Video')}`;
      navigator.clipboard.writeText(linkToCopy);
    } else {
      navigator.clipboard.writeText(shareLink);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* FULLSCREEN AR CAMERA VIEWPORT */}
      {arActive ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}>
          {/* Header Controls */}
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
              <ImageIcon size={16} /> Sample Printable Target Cards
            </button>
          </div>

          {/* Standalone WebAR MindAR Camera Engine */}
          <iframe 
            src={`/ar-lens-engine.html${activeArMedia ? `?mediaUrl=${encodeURIComponent(activeArMedia.media_url)}&mediaType=video&title=${encodeURIComponent(activeArMedia.title)}` : ''}`} 
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
                WebAR Scanner Studio
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No QR Codes Needed — Scan Physical Photos & Play Augmented Videos
              </p>
            </div>
          </div>

          <button 
            onClick={() => handleLaunchAR()} 
            className="btn-primary btn-emerald"
            style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '30px' }}
          >
            <Camera size={18} /> Open AR Scanner Camera
          </button>
        </header>

        {/* TWO MAIN STUDIO OPTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          {/* OPTION 1: SCAN PHYSICAL PHOTO */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
          }}>
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: '18px'
              }}>
                <Camera size={24} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                1. Scan Photo Print
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Point your phone camera at any physical photo or printed target card to trigger the AR video overlay automatically without QR codes.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleLaunchAR()}
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

          {/* OPTION 2: UPLOAD PHOTO & VIDEO TO PAIR */}
          <div className="glass-panel glass-panel-interactive" style={{
            padding: '32px',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              marginBottom: '18px'
            }}>
              <Upload size={24} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
              2. Upload Photo & Video Pair
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Select a <strong>Target Photo</strong> and pair it with a <strong>Video</strong> that will play when the photo gets scanned.
            </p>

            {/* Target Photo Uploader */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                📸 TARGET PHOTO (The picture to scan)
              </label>
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG photo to scan</div>
                </div>
              </div>
            </div>

            {/* Video Overlay Uploader */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                🎬 OVERLAY VIDEO (The video to play when scanned)
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MP4, WEBM video overlay</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleLaunchAR()}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '14px' }}
            >
              <Play size={18} /> Launch AR & Save Paired Video
            </button>
          </div>
        </div>

        {/* SHAREABLE WEBAR LINK CARD */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Share2 size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                Shareable WebAR Link
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Send this link to anyone — when opened on their phone, scanning the target photo will play your video!
            </p>
          </div>

          <button 
            onClick={handleCopyLink}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '14px', borderRadius: '12px' }}
          >
            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            {copiedLink ? 'Copied Shareable Link!' : 'Copy Shareable Link'}
          </button>
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
