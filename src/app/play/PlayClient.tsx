"use client";

import { useEffect, useState } from "react";

export default function PlayClient({ uuid }: { uuid: string | null }) {
  const [media, setMedia] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const url = `/api/daily${uuid ? `?u=${uuid}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setMedia(data);
        setTimeout(() => setIsLoaded(true), 100);
      })
      .catch((e) => setMedia({ error: String(e) }));
  }, [uuid]);

  if (!media) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px 60px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#8b5a3c',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            Chargement...
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
          }
        `}</style>
      </div>
    );
  }

  if (media.error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 245, 235, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(220, 100, 80, 0.3)'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#c53030',
            fontWeight: 600
          }}>
            {media.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        animation: 'backgroundFloat 20s ease-in-out infinite'
      }} />

      {/* Floating sparkles overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.6
      }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, transparent 70%)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite, floatSparkle ${8 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
              boxShadow: '0 0 10px rgba(255, 220, 150, 0.8)'
            }}
          />
        ))}
      </div>

      <main style={{
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '680px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 245, 0.92) 100%)',
          backdropFilter: 'blur(30px)',
          borderRadius: '32px',
          padding: '32px',
          boxShadow: '0 30px 90px rgba(139, 90, 60, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 10px 40px rgba(255, 200, 150, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          position: 'relative',
          animation: 'floatCard 6s ease-in-out infinite',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #ff9a76, #ffc371, #ffb35c, #ffc371, #ff9a76)',
            backgroundSize: '200% 100%',
            borderRadius: '32px 32px 0 0',
            animation: 'slideGradient 4s linear infinite',
            boxShadow: '0 0 20px rgba(255, 195, 113, 0.5)'
          }} />

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #8b5a3c 0%, #d4a574 50%, #ffc371 75%, #d4a574 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            textAlign: 'center',
            lineHeight: '1.2',
            animation: 'shimmer 3s ease-in-out infinite, floatText 4s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 8px rgba(139, 90, 60, 0.2))',
            flexShrink: 0
          }}>
            {media.title ?? "Message du jour"}
          </h1>

          {media.image_url && (
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(139, 90, 60, 0.25)',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src={media.image_url}
                style={{ width: "100%", display: 'block', height: 'auto' }}
                alt=""
              />
            </div>
          )}

          {media.video_url && (
            <div style={{
              aspectRatio: "16/9",
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(139, 90, 60, 0.25)',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              flexShrink: 0
            }}>
              <iframe
                src={media.video_url}
                style={{ width: "100%", height: "100%", border: 'none' }}
                allow="autoplay; encrypted-media"
              />
            </div>
          )}

          {media.audio_url && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 243, 230, 0.9) 0%, rgba(255, 250, 245, 0.7) 100%)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(139, 90, 60, 0.15) inset, 0 0 0 1px rgba(255, 200, 150, 0.4)',
              border: '2px solid rgba(255, 200, 150, 0.3)',
              flexShrink: 0
            }}>
              <div style={{
                marginBottom: '16px'
              }}>
                <audio
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    borderRadius: '12px',
                    outline: 'none',
                    filter: 'drop-shadow(0 4px 12px rgba(139, 90, 60, 0.2))'
                  }}
                >
                  <source src={media.audio_url} />
                </audio>
              </div>

              <a
                href={media.audio_url}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ff9a76 0%, #ffc371 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 8px 24px rgba(255, 154, 118, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 154, 118, 0.5), 0 6px 16px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 154, 118, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Télécharger l'audio
              </a>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes backgroundFloat {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes floatSparkle {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(-5px, -20px);
          }
          75% {
            transform: translate(-10px, -10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes floatText {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes slideGradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-8px) rotate(0.5deg);
          }
          66% {
            transform: translateY(-4px) rotate(-0.5deg);
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 12px !important;
          }
          main > div {
            padding: 20px 16px !important;
            max-height: calc(100vh - 24px) !important;
          }
          h1 {
            font-size: 22px !important;
            margin-bottom: 16px !important;
          }
        }

        /* Custom scrollbar styling */
        main > div::-webkit-scrollbar {
          width: 8px;
        }
        main > div::-webkit-scrollbar-track {
          background: rgba(255, 243, 230, 0.3);
          border-radius: 10px;
        }
        main > div::-webkit-scrollbar-thumb {
          background: rgba(255, 154, 118, 0.5);
          border-radius: 10px;
        }
        main > div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 154, 118, 0.7);
        }
      `}</style>
    </>
  );
}
