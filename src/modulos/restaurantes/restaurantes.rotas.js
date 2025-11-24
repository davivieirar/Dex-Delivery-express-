import { Router } from 'express';
import { RestaurantesControlador } from './restaurantes.controlador.js';
import { authMiddleware } from '../../utils/seguranca.js';

const r = Router();

// login
r.post('/login', RestaurantesControlador.login);

// crud
r.get('/', RestaurantesControlador.listar);
r.get('/:id', authMiddleware('restaurante'), RestaurantesControlador.obter);
r.post('/', RestaurantesControlador.criar);
r.put('/:id', authMiddleware('restaurante'), RestaurantesControlador.atualizar);
r.delete('/:id', authMiddleware('restaurante'), RestaurantesControlador.remover);

export default r;
