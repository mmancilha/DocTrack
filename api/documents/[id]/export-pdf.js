// Handler para POST /api/documents/:id/export-pdf
const { getApp } = require('../_lib/app');

module.exports = async (req, res) => {
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[Export PDF Handler] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};

