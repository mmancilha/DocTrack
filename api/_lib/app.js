// Helper compartilhado para inicializar o Express app
// Usado por todos os handlers individuais

let app = null;
let initPromise = null;

async function getApp() {
  if (app) {
    return app;
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[App Helper] Starting app initialization...');
        console.log('[App Helper] NODE_ENV:', process.env.NODE_ENV);
        console.log('[App Helper] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('[App Helper] SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
        
        // Importa o servidor compilado
        const server = require('../../dist/index.cjs');
        
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          console.log('[App Helper] Calling initializeApp...');
          app = await server.initializeApp();
          console.log('[App Helper] App initialized successfully');
        } else {
          console.log('[App Helper] No initializeApp found, using default export');
          app = server.default || server;
        }
        return app;
      } catch (error) {
        console.error('[App Helper] Error initializing app:', error);
        console.error('[App Helper] Error message:', error.message);
        console.error('[App Helper] Error stack:', error.stack);
        throw error;
      }
    })();
  }
  
  return await initPromise;
}

module.exports = { getApp };

