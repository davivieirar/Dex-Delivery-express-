import { Router } from 'express';
import { ClientesControlador } from './clientes.controlador.js';
import { authMiddleware } from '../../utils/seguranca.js';

const r = Router();

// login
r.post('/login', ClientesControlador.login);

// crud básico
r.get('/', ClientesControlador.listar);
r.get('/:id', authMiddleware('cliente'), ClientesControlador.obter);
r.post('/', ClientesControlador.criar);
r.put('/:id', authMiddleware('cliente'), ClientesControlador.atualizar);
r.delete('/:id', authMiddleware('cliente'), ClientesControlador.remover);

export default r;
