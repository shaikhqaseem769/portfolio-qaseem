import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
          background: 'linear-gradient(135deg, #0b1020 0%, #0f172a 50%, #0b1020 100%)',
          color: 'white',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 25%, rgba(6,182,212,0.35), transparent 40%), radial-gradient(circle at 85% 35%, rgba(99,102,241,0.35), transparent 40%), radial-gradient(circle at 50% 85%, rgba(236,72,153,0.25), transparent 40%)',
          }}
        />

        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>Sanjay Kumar</div>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 26, opacity: 0.85 }}>Building scalable backends • Node.js • AWS</div>

        <div style={{ position: 'absolute', bottom: 32, right: 64, opacity: 0.7, fontSize: 18 }}>
          @findmesektor
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 