import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const title = 'Sanjay Kumar'
  const subtitle = 'Senior Backend Engineer'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 64,
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1020 100%)',
          color: 'white',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(6,182,212,0.35), transparent 40%), radial-gradient(circle at 50% 80%, rgba(168,85,247,0.25), transparent 40%)',
          }}
        />

        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1, zIndex: 1 }}>
          {title}
        </div>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 28, opacity: 0.85, zIndex: 1 }}>{subtitle}</div>
        <div style={{ height: 24 }} />
        <div style={{ display: 'flex', gap: 12, zIndex: 1 }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 18,
            }}
          >
            Node.js
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 18,
            }}
          >
            NestJS
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 18,
            }}
          >
            PostgreSQL
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 18,
            }}
          >
            AWS
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, right: 64, opacity: 0.7, fontSize: 18 }}>
          sanjay-portfolio.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 