import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Function to start server
const startServer = async () => {
  const serverPort = await findAvailablePort(5000);
  console.log(`Starting server on port ${serverPort}`);
  
  const server = spawn('node', ['server/index.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: serverPort.toString() },
    stdio: 'inherit'
  });
  
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  return { server, port: serverPort };
};

// Function to start Vite dev server
const startVite = async (serverPort) => {
  console.log(`Starting Vite dev server...`);
  
  const vite = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    env: { ...process.env, VITE_API_PORT: serverPort.toString() },
    stdio: 'inherit'
  });
  
  vite.on('error', (error) => {
    console.error('Vite error:', error);
  });
  
  vite.on('exit', (code) => {
    console.log(`Vite exited with code ${code}`);
  });
  
  return vite;
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting development environment...');
    
    // Start server first
    const { server, port } = await startServer();
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Vite dev server
    const vite = await startVite(port);
    
    // Handle process termination
    const cleanup = () => {
      console.log('\n🛑 Shutting down development environment...');
      server.kill();
      vite.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    console.log(`✅ Development environment started successfully!`);
    console.log(`📡 Server running on port ${port}`);
    console.log(`🌐 Vite dev server starting...`);
    console.log(`Press Ctrl+C to stop all services`);
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
};

main();
