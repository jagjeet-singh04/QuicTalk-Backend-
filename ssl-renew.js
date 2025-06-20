import https from 'https';
import { config } from 'dotenv';

config();

const renewSSL = () => {
  console.log('Checking SSL certificate...');
  
  // Replace with your domain
  const options = {
    hostname: 'quic-talk-backend.vercel.app',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`SSL check status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('SSL certificate is valid');
    } else {
      console.warn('SSL certificate check failed');
    }
  });

  req.on('error', (error) => {
    console.error('SSL check error:', error);
  });

  req.end();
};

// Run immediately and then every 12 hours
renewSSL();
setInterval(renewSSL, 12 * 60 * 60 * 1000);