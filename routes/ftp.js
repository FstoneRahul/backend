const express = require('express');
const { connectToFTP } = require('../ftp');
const router = express.Router();

// @route   GET /api/ftp/test
// @desc    Test FTP connection
// @access  Public
router.get('/test', async (req, res) => {
  try {
    const client = await connectToFTP();
    await client.close();
    res.json({ msg: 'FTP connection successful' });
  } catch (err) {
    console.error('FTP test failed:', err);
    res.status(500).json({ msg: 'FTP connection failed', error: err.message });
  }
});

module.exports = router;