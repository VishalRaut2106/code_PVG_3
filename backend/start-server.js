// Simple server startup script with default environment variables
require('dotenv').config();

// Set environment variables with your real Supabase credentials
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://bodghiwoduxjzwbzggbx.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZGdoaXdvZHV4anp3YnpnZ2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDQ3MTEsImV4cCI6MjA3NDQ4MDcxMX0.nNVZNzI5lAAStQVoynwQqnzmjIK79zzoVd-Duc_zz0E';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZGdoaXdvZHV4anp3YnpnZ2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNDcxMSwiZXhwIjoyMDc0NDgwNzExfQ.58EXzmdFWHrVO4Bj-EY8mxcsD_4U8sKAyJwp7zhCh28';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.PORT = process.env.PORT || '4545';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'admin123';

console.log('🚀 Starting CodePVG Backend Server...');
console.log('⚠️  Note: Using default environment variables for development');
console.log('📝 To use Supabase, please set up your .env file with real credentials');
console.log('');

// Start the server
require('./server.js');
