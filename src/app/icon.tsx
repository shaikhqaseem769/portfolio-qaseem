import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          border:         '1px solid #FF0000',
        }}
      >
        <div
          style={{
            fontSize:      18,
            fontWeight:    800,
            color:         '#FF0000',
            letterSpacing: -0.5,
            fontFamily:    'monospace',
          }}
        >
          SK
        </div>
      </div>
    ),
    size,
  );
}
