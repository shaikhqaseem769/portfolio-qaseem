import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     '#000000',
          borderRadius:   24,
          border:         '4px solid #FF0000',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Red glow blob behind text */}
        <div style={{
          position:   'absolute',
          width:      120,
          height:     120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,0,0.25) 0%, transparent 70%)',
        }} />

        {/* Top-right chamfer accent */}
        <div style={{
          position:   'absolute',
          top:        0,
          right:      0,
          width:      40,
          height:     40,
          background: '#FF0000',
          clipPath:   'polygon(100% 0, 0 0, 100% 100%)',
        }} />

        {/* Bottom-left chamfer accent */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          width:      24,
          height:     24,
          background: 'rgba(255,0,0,0.4)',
          clipPath:   'polygon(0 100%, 0 0, 100% 100%)',
        }} />

        <div
          style={{
            fontSize:      80,
            fontWeight:    800,
            color:         '#FF0000',
            letterSpacing: -3,
            fontFamily:    'monospace',
            position:      'relative',
            zIndex:        1,
            textShadow:    '0 0 30px rgba(255,0,0,0.6)',
          }}
        >
          SK
        </div>
      </div>
    ),
    size,
  );
}
