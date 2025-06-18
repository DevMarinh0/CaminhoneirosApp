import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

const prisma = new PrismaClient();

// Função wrapper para tratar erros em funções assíncronas
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const criarCadastro = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { transportadora, nome, placa, destino, dataCadastro, fotos } = req.body;

    console.log('Recebido pedido para criar cadastro:', { transportadora, nome, placa, destino, dataCadastro });
    console.log('Fotos recebidas:', fotos);

    const cadastro = await prisma.cadastro.create({
      data: {
        transportadora,
        nome,
        placa,
        destino,
        dataCadastro,
        fotos: { create: fotos }
      },
      include: { fotos: true }
    });
    
    console.log('Cadastro criado com sucesso:', cadastro.id);
    res.status(201).json(cadastro);
  } catch (error: any) {
    console.error('Erro ao criar cadastro:', error);
    res.status(500).json({ error: 'Erro ao criar cadastro', details: error?.message || 'Erro desconhecido' });
  }
});

export const listarCadastros = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Listando todos os cadastros');
    const cadastros = await prisma.cadastro.findMany({ 
      include: { fotos: true },
      orderBy: { id: 'desc' } // Ordenar do mais recente para o mais antigo
    });
    
    console.log(`Encontrados ${cadastros.length} cadastros`);
    res.json(cadastros);
  } catch (error: any) {
    console.error('Erro ao listar cadastros:', error);
    res.status(500).json({ error: 'Erro ao listar cadastros', details: error?.message || 'Erro desconhecido' });
  }
});

export const buscarCadastros = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    console.log('Buscando cadastros com query:', query);
    
    let where: any = {};

    if (query) {
      where.OR = [
        { nome: { contains: String(query), mode: 'insensitive' } },
        { placa: { contains: String(query), mode: 'insensitive' } }
      ];
    }

    const cadastros = await prisma.cadastro.findMany({
      where,
      include: { fotos: true },
      orderBy: { id: 'desc' }
    });
    
    console.log(`Encontrados ${cadastros.length} cadastros na busca`);
    res.json(cadastros);
  } catch (error: any) {
    console.error('Erro ao buscar cadastros:', error);
    res.status(500).json({ error: 'Erro ao buscar cadastros', details: error?.message || 'Erro desconhecido' });
  }
});

export const excluirCadastro = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cadastroId = Number(id);
    console.log(`Solicitação para excluir cadastro ID: ${cadastroId}`);

    // Primeiro, buscar o cadastro para obter as fotos
    const cadastro = await prisma.cadastro.findUnique({
      where: { id: cadastroId },
      include: { fotos: true }
    });

    if (!cadastro) {
      console.log(`Cadastro ID ${cadastroId} não encontrado`);
      return res.status(404).json({ error: 'Cadastro não encontrado' });
    }

    // Excluir as fotos do Cloudinary
    for (const foto of cadastro.fotos) {
      try {
        if (foto.url && foto.url.includes('cloudinary')) {
          // Extrair o public_id da URL do Cloudinary
          // Formato da URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/caminhoneiros/file_name
          const urlParts = foto.url.split('/');
          const fileName = urlParts[urlParts.length - 1].split('.')[0];
          const folderName = urlParts[urlParts.length - 2];
          const publicId = `${folderName}/${fileName}`;

          await cloudinary.uploader.destroy(publicId);
          console.log(`Imagem excluída do Cloudinary: ${publicId}`);
        }
      } catch (err) {
        console.error(`Erro ao excluir imagem do Cloudinary:`, err);
        // Continua mesmo se houver erro ao excluir imagem
      }
    }

    // Excluir as fotos do banco de dados
    await prisma.foto.deleteMany({
      where: { cadastroId }
    });

    // Excluir o cadastro
    await prisma.cadastro.delete({
      where: { id: cadastroId }
    });

    console.log(`Cadastro ID ${cadastroId} excluído com sucesso`);
    res.json({ success: true, message: 'Cadastro excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir cadastro:', error);
    res.status(500).json({ error: 'Erro ao excluir cadastro', details: error?.message || 'Erro desconhecido' });
  }
});