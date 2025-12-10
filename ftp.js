const ftp = require('basic-ftp');

async function connectToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false // Set to true if using FTPS
    });
    console.log('Connected to FTP server successfully');
    return client;
  } catch (err) {
    console.error('FTP connection failed:', err);
    throw err;
  }
}

module.exports = { connectToFTP };