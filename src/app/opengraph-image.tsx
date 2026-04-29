import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Apex Agents — Autonomous AI Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #030712 0%, #0f0320 50%, #030712 100%)',
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #9333ea, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '900', color: 'white',
          }}>A</div>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>Apex Agents</span>
        </div>
        <div style={{
          fontSize: '68px', fontWeight: '900', color: 'white',
          textAlign: 'center', lineHeight: 1.1, marginBottom: '20px',
        }}>
          Your Business.
        </div>
        <div style={{
          fontSize: '68px', fontWeight: '900', textAlign: 'center',
          lineHeight: 1.1, marginBottom: '28px',
          background: 'linear-gradient(90deg, #a855f7, #ec4899)',
          backgroundClip: 'text', color: 'transparent',
        }}>
          On Autopilot.
        </div>
        <div style={{ fontSize: '22px', color: '#9ca3af', textAlign: 'center', maxWidth: '720px', lineHeight: 1.5 }}>
          AI-powered revenue system for local businesses — scout leads, score prospects, send outreach automatically.
        </div>
        <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
          <div style={{
            padding: '10px 24px', borderRadius: '999px',
            background: 'rgba(147,51,234,0.2)', border: '1px solid rgba(147,51,234,0.5)',
            color: '#c084fc', fontSize: '16px', fontWeight: '600',
          }}>● Revenue Engine Live</div>
          <div style={{
            padding: '10px 24px', borderRadius: '999px',
            background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)',
            color: '#f9a8d4', fontSize: '16px', fontWeight: '600',
          }}>5 Active Agents</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
