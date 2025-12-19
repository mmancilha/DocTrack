// Handler para GET /api/documents/:id/versions
const { getApp } = require('../_lib/app');

module.exports = async (req, res) => {
  // Apenas aceita GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[Document Versions Handler] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};

