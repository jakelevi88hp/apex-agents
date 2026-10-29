import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Apex Agents: Land more commercial accounts near your shop';
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
          Land more commercial
        </div>
        <div style={{
          fontSize: '68px', fontWeight: '900', textAlign: 'center',
          lineHeight: 1.1, marginBottom: '28px',
          background: 'linear-gradient(90deg, #a855f7, #ec4899)',
          backgroundClip: 'text', color: 'transparent',
        }}>
          accounts near your shop.
        </div>
        <div style={{ fontSize: '22px', color: '#9ca3af', textAlign: 'center', maxWidth: '840px', lineHeight: 1.5 }}>
          Apex finds property managers, fleets, and facilities nearby, scores them, and writes the outreach. You approve every message before it sends.
        </div>
        <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
          <div style={{
            padding: '10px 24px', borderRadius: '999px',
            background: 'rgba(147,51,234,0.2)', border: '1px solid rgba(147,51,234,0.5)',
            color: '#c084fc', fontSize: '16px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc' }} />
            3-day free trial, no card needed.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
