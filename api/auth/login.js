// Handler para POST /api/auth/login
const { getApp } = require('../_lib/app');

module.exports = async (req, res) => {
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = await getApp();
    // O Express app já tem a rota /api/auth/login registrada
    // Apenas precisamos chamar o app com o req e res
    app(req, res);
  } catch (error) {
    console.error('[Login Handler] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};

