import { v2 as cloudinary } from 'cloudinary';
import https from 'https';

// Configurar o agente HTTPS para ignorar erros de certificado
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Ignora erros de certificado SSL
});

// Configuração do Cloudinary com as credenciais do .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtcmwozlv',
  api_key: process.env.CLOUDINARY_API_KEY || '254991671737468',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ENsDcagcycKlYbTOC8uBJliWbMc',
  secure: true
});

// Configurar o Cloudinary para usar nosso agente HTTPS personalizado
// @ts-ignore - A tipagem não inclui esta propriedade, mas ela existe
cloudinary.config.https_agent = httpsAgent;

// Verificar se as credenciais do Cloudinary estão configuradas corretamente
try {
  cloudinary.api.ping((error: any, result: any) => {
    if (error) {
      console.error('❌ Erro ao conectar com o Cloudinary:', error.message);
    } else {
      console.log('✅ Conexão com o Cloudinary estabelecida com sucesso');
    }
  });
} catch (error: any) {
  console.error('❌ Erro ao verificar conexão com o Cloudinary:', error);
}

export default cloudinary;