// Entry point para Vercel serverless functions
// Este arquivo importa o servidor Express compilado
const server = require('../dist/index.cjs');

// Variável para armazenar o app inicializado
let app = null;
let initPromise = null;

// Função para inicializar o app uma única vez
function getApp() {
  if (app) {
    return Promise.resolve(app);
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          app = await server.initializeApp();
          console.log('App initialized for Vercel');
        } else {
          app = server.default || server;
        }
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        throw error;
      }
    })();
  }
  
  return initPromise;
}

// Exporta um handler que aguarda a inicialização
module.exports = async (req, res) => {
  try {
    const initializedApp = await getApp();
    return initializedApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

