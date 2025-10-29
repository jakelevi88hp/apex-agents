import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    // Call Python AGI system to get status
    const status = await getAGIStatus();

    return NextResponse.json(status);
  } catch (error) {
    console.error('AGI status error:', error);
    return NextResponse.json(
      { 
        available: false,
        error: 'Failed to get AGI status' 
      },
      { status: 500 }
    );
  }
}

async function getAGIStatus(): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'src/lib/agi/status.py');
    
    const python = spawn('python3', [pythonScript]);
    
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python stderr:', stderr);
        resolve({ available: false, error: 'AGI system not available' });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        resolve({ available: false, error: 'Invalid response from AGI system' });
      }
    });

    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      resolve({ available: false, error: 'Python not available' });
    });
  });
}

