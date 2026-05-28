import { spawn } from 'child_process';
import * as path from 'path';

let serverProcess: any = null;

export async function startNextServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const frontendDir = path.join(__dirname, '..', 'frontend');
    
    // Spawn npx next start on port 3000
    serverProcess = spawn('npx', ['next', 'start', '-p', '3000'], {
      cwd: frontendDir,
      shell: true,
    });

    serverProcess.stdout.on('data', (data: any) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        resolve('http://localhost:3000');
      }
    });

    serverProcess.stderr.on('data', (data: any) => {
      console.error(`Next Server Error: ${data}`);
    });

    serverProcess.on('error', (err: any) => {
      reject(err);
    });

    // Timeout fallback
    setTimeout(() => {
      resolve('http://localhost:3000');
    }, 5000);
  });
}

export function stopNextServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}
