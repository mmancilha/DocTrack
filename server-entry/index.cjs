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
    // CRÍTICO: Quando a Vercel faz rewrite, precisamos preservar o path original
    // O req.url pode estar como /server-entry/index.cjs, mas precisamos do path original /api/auth/login
    // A Vercel passa o path original em req.headers['x-vercel-path'] ou podemos usar req.url diretamente
    // Mas quando fazemos rewrite, o req.url pode estar errado
    
    // Tentar obter o path original de várias formas
    const originalPath = req.headers['x-vercel-path'] || 
                        req.headers['x-invoke-path'] || 
                        req.url;
    
    // Se o path contém /server-entry/index.cjs, precisamos extrair o path real do rewrite
    // O rewrite é /api/:path* -> /server-entry/index.cjs
    // Então se req.url é /server-entry/index.cjs, o path original deve ser /api/...
    // Mas na verdade, quando a Vercel faz rewrite, ela pode preservar em req.url
    // Vamos verificar e corrigir se necessário
    
    let pathToUse = originalPath;
    
    // Se o path contém server-entry, significa que o rewrite aconteceu mas não preservou
    // Nesse caso, precisamos usar o header ou reconstruir
    if (pathToUse && pathToUse.includes('/server-entry')) {
      // Tentar obter do header x-vercel-rewrite-path ou similar
      pathToUse = req.headers['x-vercel-rewrite-path'] || 
                  req.headers['x-invoke-path'] ||
                  req.originalUrl ||
                  originalPath;
    }
    
    // Se ainda não temos o path correto, tentar usar req.url diretamente
    // A Vercel normalmente preserva o path original em req.url quando faz rewrite
    if (!pathToUse || pathToUse.includes('/server-entry')) {
      // Última tentativa: usar req.url que pode já ter o path correto
      pathToUse = req.url;
    }
    
    // Garantir que o path começa com /api
    if (pathToUse && !pathToUse.startsWith('/api') && !pathToUse.startsWith('/server-entry')) {
      // Se não começa com /api, pode ser que o rewrite não preservou
      // Nesse caso, vamos assumir que req.url já tem o path correto
      pathToUse = req.url;
    }
    
    // Se ainda está errado, tentar reconstruir do header x-vercel-path
    if (pathToUse && pathToUse.includes('/server-entry')) {
      // Extrair o path do rewrite pattern /api/:path*
      // Se temos x-vercel-path, usar ele
      const vercelPath = req.headers['x-vercel-path'];
      if (vercelPath) {
        pathToUse = vercelPath;
      } else {
        // Se não temos, manter req.url que pode já estar correto
        pathToUse = req.url;
      }
    }
    
    // Atualizar req.url e req.originalUrl para o Express
    if (pathToUse && pathToUse !== req.url) {
      req.url = pathToUse;
      req.originalUrl = pathToUse;
    }
    
    console.log(`[API Handler] ${req.method} ${req.url}`);
    console.log(`[API Handler] Original URL: ${req.originalUrl || req.url}`);
    console.log(`[API Handler] Path: ${req.path}`);
    console.log(`[API Handler] Headers:`, JSON.stringify({
      'x-vercel-path': req.headers['x-vercel-path'],
      'x-invoke-path': req.headers['x-invoke-path'],
      'x-vercel-rewrite-path': req.headers['x-vercel-rewrite-path']
    }));
    
    const initializedApp = await getApp();
    // Chama o app Express diretamente - ele vai lidar com req e res
    // Express não retorna nada, ele processa a requisição diretamente
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

