import { Router } from 'express';
import { PedidosControlador } from './pedidos.controlador.js';
import { authMiddleware } from '../../utils/seguranca.js';

const r = Router();

r.get('/', PedidosControlador.listar);
r.get('/:id', PedidosControlador.obter);
r.post('/', authMiddleware('cliente'), PedidosControlador.criar);
r.patch('/:id/status', authMiddleware('restaurante'), PedidosControlador.atualizarStatus);
r.delete('/:id', authMiddleware('cliente'), PedidosControlador.remover);

export default r;
