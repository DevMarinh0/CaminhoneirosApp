// Importações
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cadastroRoutes from './routes/cadastro.routes';
import pdfRoutes from './routes/pdf.routes';
import resetRoutes from './routes/reset.routes';
import uploadRoutes from './routes/upload.routes';
import { findAvailablePort } from './utils/port-finder';
import os from 'os';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configurar CORS para permitir todas as origens
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aumentar o limite de tamanho do corpo da requisição para uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Criar pasta uploads e temp se não existirem
const uploadsDir = path.resolve(__dirname, '../uploads');
const tempDir = path.resolve(__dirname, '../temp');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configurar cache para arquivos estáticos
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  maxAge: '1d', // Cache de 1 dia
  etag: true,
  lastModified: true
}));

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando corretamente!' });
});

// Rota de ping para manter o servidor ativo e verificar saúde
app.get('/ping', (req, res) => {
  // Incluir informações de diagnóstico
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.status(200).json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)} minutos`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  });
});

// Use as rotas
app.use('/cadastros', cadastroRoutes);
app.use('/upload', uploadRoutes);
app.use('/pdf', pdfRoutes);
app.use('/reset-tudo', resetRoutes);

// Middleware de tratamento de erros global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro ao processar sua solicitação'
  });
});

// Função para obter os endereços IP da máquina
function getIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        // Pular endereços IPv6 e loopback
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
  }

  return addresses;
}

// Definir a porta do servidor (usar PORT do ambiente ou 3333 como padrão)
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3333;

// Iniciar o servidor com a porta fornecida pelo ambiente
async function startServer() {
  try {
    // Em produção, usar diretamente a porta do ambiente
    const port = process.env.NODE_ENV === 'production' ? DEFAULT_PORT : await findAvailablePort(DEFAULT_PORT);

    // Iniciar o servidor na porta disponível
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Servidor está rodando na porta ${port}`);
      
      // Mostrar todos os IPs disponíveis para facilitar a conexão
      const ipAddresses = getIpAddresses();
      console.log('📱 Para acessar do Expo Go, use um dos seguintes endereços:');
      ipAddresses.forEach(ip => {
        console.log(`   http://${ip}:${port}`);
      });
      
      console.log('🌥️ Cloudinary configurado com:', process.env.CLOUDINARY_CLOUD_NAME || 'dtcmwozlv');
      console.log('🔄 Ambiente:', process.env.NODE_ENV || 'development');
    });
    
    // Adicionar tratamento de erro para o servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${port} já está em uso. Tentando outra porta...`);
        // Tentar outra porta
        setTimeout(() => {
          server.close();
          startServer();
        }, 1000);
      } else {
        console.error('❌ Erro no servidor:', error);
      }
    });

    // Tratamento de erros não capturados para evitar que o servidor caia
    process.on('uncaughtException', (error: Error) => {
      console.error('Erro não tratado capturado:', error);
      // O servidor continua rodando mesmo após um erro não tratado
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Promessa rejeitada não tratada:', reason);
      // O servidor continua rodando mesmo após uma promessa rejeitada
    });
  } catch (error: any) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Função para manter o servidor ativo (auto-ping)
function setupKeepAlive() {
  // Se estiver em produção, configurar um auto-ping a cada 14 minutos
  // para evitar que o Render.com desligue o serviço por inatividade
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Configurando keep-alive para ambiente de produção');
    setInterval(() => {
      // Fazer uma requisição para a própria rota de ping
      const https = require('https');
      const url = 'https://caminhoneiros-backend.onrender.com/ping';
      
      https.get(url, (res: any) => {
        console.log(`🔄 Keep-alive ping: ${res.statusCode}`);
      }).on('error', (err: Error) => {
        console.error('❌ Erro no keep-alive ping:', err.message);
      });
    }, 14 * 60 * 1000); // 14 minutos
  }
}

// Iniciar o servidor
startServer();

// Configurar keep-alive
setupKeepAlive();