import { Router } from 'express';
import { buscarCadastros, criarCadastro, excluirCadastro, listarCadastros } from '../controllers/cadastro.controllers';

const router = Router();

router.post('/', criarCadastro);
router.get('/', listarCadastros);
router.get('/busca', buscarCadastros);
router.delete('/:id', excluirCadastro);

export default router;