// Handler para PATCH /api/comments/:id
const { getApp } = require('../_lib/app');

module.exports = async (req, res) => {
  // Apenas aceita PATCH
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[Comments Handler] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};

