import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// Definindo interfaces para melhorar a tipagem
interface FotoInfo {
  path: string;
  nome: string;
}

// Função wrapper para tratar erros em funções assíncronas
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Função para baixar imagem temporariamente para o PDF
async function downloadImage(url: string, tempDir: string): Promise<string> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    
    // Criar nome de arquivo temporário
    const tempFileName = `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Salvar arquivo temporariamente
    fs.writeFileSync(tempFilePath, response.data);
    
    return tempFilePath;
  } catch (error) {
    console.error('Erro ao baixar imagem:', error);
    throw error;
  }
}

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cadastro = await prisma.cadastro.findUnique({
    where: { id },
    include: { fotos: true }
  });

  if (!cadastro) {
    return res.status(404).json({ error: 'Cadastro não encontrado' });
  }

  // Formatar o nome do arquivo baseado no nome do motorista (removendo caracteres especiais)
  const nomeFormatado = cadastro.nome.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Cadastro_${nomeFormatado}.pdf"`);

  // Importar PDFKit com configurações de alta qualidade
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({
    autoFirstPage: true,
    size: 'A4',
    margin: 50,
    info: {
      Title: `Cadastro de Motorista - ${cadastro.nome}`,
      Author: 'Caminhoneiros App',
      Subject: `Cadastro ${cadastro.id}`,
      Keywords: 'cadastro, motorista, caminhoneiro',
      CreationDate: new Date()
    }
  });

  doc.pipe(res);

  // Cabeçalho
  doc.fontSize(20).text('Cadastro de Motorista', { align: 'center' });
  doc.moveDown();

  // Função para adicionar texto com rótulo em negrito
  const addBoldLabel = (label: string, value: string) => {
    doc.fontSize(14);
    doc.font('Helvetica-Bold').text(label, { continued: true });
    doc.font('Helvetica').text(` ${value}`);
  };

  // Adicionar informações com rótulos em negrito
  addBoldLabel('Nome do Motorista:', cadastro.nome);
  addBoldLabel('Nome da Transportadora:', cadastro.transportadora);
  addBoldLabel('Placa:', cadastro.placa);
  addBoldLabel('Destino:', cadastro.destino);
  addBoldLabel('Data do Cadastro:', cadastro.dataCadastro);

  doc.moveDown();

  if (cadastro.fotos && cadastro.fotos.length > 0) {
    doc.font('Helvetica-Bold').fontSize(16).text('Fotos:', { underline: true });
    doc.font('Helvetica'); // Retorna para a fonte normal
    doc.moveDown(0.5);

    // Criar diretório temporário para imagens
    const tempDir = path.resolve(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Configuração da grade de imagens
    const pageWidth = doc.page.width - 100; // Largura da página menos margens
    const imageWidth = pageWidth / 3; // 3 imagens por linha
    const imageHeight = 200; // Altura fixa para cada imagem
    const margin = 50; // Margem lateral

    // Processar as fotos em grade
    const validFotos: FotoInfo[] = [];
    const tempFiles: string[] = [];

    try {
      // Baixar todas as imagens do Cloudinary
      for (const foto of cadastro.fotos) {
        if (!foto.url) continue;

        try {
          // Se for URL do Cloudinary, baixar temporariamente
          if (foto.url.includes('cloudinary')) {
            const tempFilePath = await downloadImage(foto.url, tempDir);
            tempFiles.push(tempFilePath);
            validFotos.push({ path: tempFilePath, nome: path.basename(tempFilePath) });
          }
        } catch (err) {
          console.error(`Erro ao processar imagem: ${foto.url}`, err);
        }
      }

      // Agora desenhe as fotos em grade
      for (let i = 0; i < Math.min(validFotos.length, 6); i++) {
        const foto = validFotos[i];

        // Calcular posição na grade (3 colunas x 2 linhas)
        const col = i % 3;
        const row = Math.floor(i / 3);

        const x = margin + (col * imageWidth);
        const y = doc.y + (row * imageHeight);

        try {
          // Se for a primeira imagem da segunda linha, ajuste a posição Y
          if (i === 3) {
            doc.y = doc.y + imageHeight + 10;
          }

          // Se for a primeira imagem de cada linha, posicione no X correto
          if (col === 0) {
            doc.x = x;
          }

          // Adicionar a imagem na posição calculada com alta qualidade
          doc.image(foto.path, doc.x, doc.y, {
            fit: [imageWidth - 10, imageHeight - 10],
            align: 'center',
            valign: 'center'
          });

          // Mover para a próxima posição horizontal
          doc.x = doc.x + imageWidth;

          // Se for a última imagem da linha, quebrar linha
          if (col === 2 || i === validFotos.length - 1) {
            doc.x = margin;
            // Não avançar o Y aqui, pois queremos manter as linhas juntas
          }
        } catch (error) {
          console.error(`Erro ao processar imagem:`, error);
        }
      }

      // Avançar para depois da grade de imagens
      if (validFotos.length > 0) {
        doc.y = doc.y + imageHeight + 20;
      } else {
        doc.text("Nenhuma imagem disponível", { align: 'center' });
      }
    } finally {
      // Limpar arquivos temporários após gerar o PDF
      doc.on('end', () => {
        tempFiles.forEach(file => {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch (err) {
            console.error(`Erro ao excluir arquivo temporário: ${file}`, err);
          }
        });
      });
    }
  }

  // Adicionar rodapé com número de página
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(10).text(
      `Página ${i + 1} de ${pageCount}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  doc.end();
}));

export default router;