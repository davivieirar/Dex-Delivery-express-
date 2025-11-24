// src/modulos/cardapio/cardapio.rotas.js
import { Router } from 'express';
import {
  criarItem,
  listarPorRestaurante,
  removerItem,
} from './cardapio.controlador.js';

const router = Router();

// cria item
router.post('/', criarItem);

// lista itens de um restaurante
router.get('/restaurantes/:id', listarPorRestaurante);

// remove item
router.delete('/:id', removerItem);

export default router;
