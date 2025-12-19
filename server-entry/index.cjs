// Entry point para Vercel serverless functions
// Este arquivo importa o servidor Express compilado

// Variável para armazenar o app inicializado
let app = null;
let initPromise = null;

// Função para inicializar o app uma única vez
async function getApp() {
  if (app) {
    return app;
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('Starting app initialization...');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
        
        // Importa o servidor apenas quando necessário
        const server = require('../dist/index.cjs');
        
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          console.log('Calling initializeApp...');
          app = await server.initializeApp();
          console.log('App initialized successfully for Vercel');
        } else {
          console.log('No initializeApp found, using default export');
          app = server.default || server;
        }
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
      }
    })();
  }
  
  return await initPromise;
}

// Exporta um handler que aguarda a inicialização
// A Vercel espera uma função que recebe (req, res)
module.exports = async (req, res) => {
  try {
    // CRÍTICO: Quando a Vercel faz rewrite de /api/:path* para /server-entry/index.cjs,
    // o req.url pode estar como /server-entry/index.cjs em vez de /api/auth/login
    // Precisamos preservar o path original para que o Express encontre a rota correta
    
    // A Vercel preserva o path original em req.url quando faz rewrite, MAS
    // se não preservar, podemos tentar obter de headers ou reconstruir
    
    const originalUrl = req.url;
    const vercelPath = req.headers['x-vercel-path'] || req.headers['x-invoke-path'];
    
    // Se req.url contém /server-entry, significa que o rewrite não preservou o path
    // Nesse caso, tentar usar o header ou reconstruir
    if (originalUrl && originalUrl.includes('/server-entry')) {
      // Se temos um header com o path original, usar ele
      if (vercelPath) {
        req.url = vercelPath;
        req.originalUrl = vercelPath;
      } else {
        // Se não temos header, o path original deve ser /api/... (do rewrite pattern)
        // Mas não podemos saber qual é sem o header, então vamos usar req.url como está
        // e deixar o Express lidar (pode retornar 404, mas pelo menos não 405)
        console.warn(`[API Handler] Path contains /server-entry but no x-vercel-path header. URL: ${originalUrl}`);
      }
    }
    
    // Logs para debug
    console.log(`[API Handler] ${req.method} ${req.url}`);
    console.log(`[API Handler] Original URL: ${req.originalUrl || req.url}`);
    console.log(`[API Handler] Path: ${req.path}`);
    console.log(`[API Handler] x-vercel-path: ${req.headers['x-vercel-path'] || 'not set'}`);
    
    const initializedApp = await getApp();
    // Chama o app Express diretamente - ele vai lidar com req e res
    initializedApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

