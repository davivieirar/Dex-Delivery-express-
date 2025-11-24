import { RestaurantesRepositorio } from './restaurantes.repositorio.js';
import { hashSenha, confereSenha, gerarToken } from '../../utils/seguranca.js';

function validar(dados, modo = 'criar') {
  const { nome_restaurante, tipo_cozinha, telefone_restaurante, email, senha } = dados;

  if (!nome_restaurante || !tipo_cozinha || !telefone_restaurante || !email || (modo === 'criar' && !senha)) {
    return 'nome_restaurante, tipo_cozinha, telefone_restaurante, email e senha são obrigatórios';
  }
  if (!/^\d{11}$/.test(String(telefone_restaurante))) return 'telefone_restaurante deve ter 11 dígitos numéricos';
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return 'email inválido';

  return null;
}

export const RestaurantesControlador = {
  async listar(_req, res, next) {
    try {
      res.json(await RestaurantesRepositorio.listar());
    } catch (e) { next(e); }
  },

  async obter(req, res, next) {
    try {
      const r = await RestaurantesRepositorio.obterPorId(Number(req.params.id));
      if (!r) return res.status(404).json({ erro: 'Restaurante não encontrado' });
      res.json(r);
    } catch (e) { next(e); }
  },

  async criar(req, res, next) {
    try {
      const erro = validar(req.body, 'criar');
      if (erro) return res.status(400).json({ erro });

      const existe = await RestaurantesRepositorio.obterPorEmail(req.body.email);
      if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

      const senha_hash = await hashSenha(req.body.senha);
      const id = await RestaurantesRepositorio.criar({ ...req.body, senha_hash });
      const rest = await RestaurantesRepositorio.obterPorId(id);
      res.status(201).json(rest);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ erro: 'Telefone ou email já cadastrados' });
      }
      next(e);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const erro = validar(req.body, 'atualizar');
      if (erro) return res.status(400).json({ erro });

      await RestaurantesRepositorio.atualizar(id, req.body);
      const rest = await RestaurantesRepositorio.obterPorId(id);
      res.json(rest);
    } catch (e) { next(e); }
  },

  async remover(req, res, next) {
    try {
      await RestaurantesRepositorio.remover(Number(req.params.id));
      res.status(204).end();
    } catch (e) { next(e); }
  },

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ erro: 'email e senha são obrigatórios' });
      }

      const rest = await RestaurantesRepositorio.obterPorEmail(email);
      if (!rest) return res.status(401).json({ erro: 'Credenciais inválidas' });

      const ok = await confereSenha(senha, rest.senha);
      if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

      const token = gerarToken({
        tipo: 'restaurante',
        id_restaurante: rest.id_restaurante,
        email: rest.email,
        nome: rest.nome_restaurante
      });

      res.json({
        token,
        restaurante: {
          id_restaurante: rest.id_restaurante,
          nome_restaurante: rest.nome_restaurante,
          email: rest.email
        }
      });
    } catch (e) { next(e); }
  }
};
