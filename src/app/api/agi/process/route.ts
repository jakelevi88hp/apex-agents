import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Call Python AGI system
    const result = await processWithAGI(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AGI processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process input through AGI system' },
      { status: 500 }
    );
  }
}

async function processWithAGI(input: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'src/lib/agi/process.py');
    
    const python = spawn('python3', [pythonScript, JSON.stringify({ input })]);
    
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
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        reject(new Error('Invalid JSON response from AGI system'));
      }
    });

    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(error);
    });
  });
}

