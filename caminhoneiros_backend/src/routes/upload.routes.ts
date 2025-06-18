import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary';

const router = Router();

// Configurar armazenamento local temporário
const tempDir = path.resolve(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configurar o multer para armazenamento local temporário
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar o multer com o storage local
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Função para fazer upload para o Cloudinary
const uploadToCloudinary = async (filePath: string) => {
  try {
    console.log(`Enviando ${filePath} para o Cloudinary...`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'caminhoneiros',
      resource_type: 'auto'
    });
    console.log(`Upload para Cloudinary concluído: ${result.secure_url}`);
    
    // Remover o arquivo temporário
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    console.error('Erro ao fazer upload para o Cloudinary:', error);
    throw error;
  }
};

router.post('/', (req, res) => {
  console.log('Iniciando upload para armazenamento temporário...');
  
  upload.array('fotos', 6)(req, res, async (err) => {
    if (err) {
      console.error('Erro no upload local:', err);
      return res.status(500).json({ error: 'Erro no upload de arquivo', message: err.message });
    }

    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      console.log(`${files.length} arquivos recebidos, enviando para o Cloudinary...`);
      
      // Upload para o Cloudinary
      const uploadPromises = files.map(file => uploadToCloudinary(file.path));
      
      try {
        const results = await Promise.all(uploadPromises);
        
        // Extrair as URLs das imagens enviadas pelo Cloudinary
        const urls = results.map(result => {
          return { url: result.secure_url };
        });
        
        console.log(`✅ Upload concluído: ${files.length} arquivos processados`);
        
        res.json({
          urls,
          success: true,
          message: `${files.length} fotos enviadas com sucesso`
        });
      } catch (cloudinaryError: any) {
        console.error('Erro no upload para o Cloudinary:', cloudinaryError);
        
        // Limpar arquivos temporários em caso de erro
        files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error('Erro ao excluir arquivo temporário:', e);
          }
        });
        
        res.status(500).json({ 
          error: 'Erro ao enviar para o Cloudinary', 
          message: cloudinaryError?.message || 'Falha no upload para o serviço de armazenamento'
        });
      }
    } catch (error: any) {
      console.error('Erro ao processar upload:', error);
      res.status(500).json({ error: 'Erro ao processar upload', message: error.message });
    }
  });
});

export default router;