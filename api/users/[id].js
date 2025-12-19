// Handler para PATCH e DELETE /api/users/:id
const { getApp } = require('../_lib/app');

module.exports = async (req, res) => {
  // Aceita PATCH e DELETE
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[User ID Handler] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};

