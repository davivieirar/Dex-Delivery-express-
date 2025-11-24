import { ClientesRepositorio } from './clientes.repositorio.js';
import { hashSenha, confereSenha, gerarToken } from '../../utils/seguranca.js';

function validar(dados, modo = 'criar') {
  const { nome, telefone, endereco, email, senha } = dados;

  if (!nome || !telefone || !endereco || !email || (modo === 'criar' && !senha)) {
    return 'nome, telefone, endereco, email e senha são obrigatórios';
  }
  if (!/^\d{11}$/.test(String(telefone))) return 'telefone deve ter 11 dígitos numéricos';
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return 'email inválido';

  return null;
}

export const ClientesControlador = {
  async listar(_req, res, next) {
    try {
      const lista = await ClientesRepositorio.listar();
      res.json(lista);
    } catch (e) { next(e); }
  },

  async obter(req, res, next) {
    try {
      const cli = await ClientesRepositorio.obterPorId(Number(req.params.id));
      if (!cli) return res.status(404).json({ erro: 'Cliente não encontrado' });
      res.json(cli);
    } catch (e) { next(e); }
  },

  async criar(req, res, next) {
    try {
      const erro = validar(req.body, 'criar');
      if (erro) return res.status(400).json({ erro });

      const existe = await ClientesRepositorio.obterPorEmail(req.body.email);
      if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

      const senha_hash = await hashSenha(req.body.senha);
      const id = await ClientesRepositorio.criar({ ...req.body, senha_hash });
      const cli = await ClientesRepositorio.obterPorId(id);
      res.status(201).json(cli);
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

      await ClientesRepositorio.atualizar(id, req.body);
      const cli = await ClientesRepositorio.obterPorId(id);
      res.json(cli);
    } catch (e) { next(e); }
  },

  async remover(req, res, next) {
    try {
      await ClientesRepositorio.remover(Number(req.params.id));
      res.status(204).end();
    } catch (e) { next(e); }
  },

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ erro: 'email e senha são obrigatórios' });
      }

      const cli = await ClientesRepositorio.obterPorEmail(email);
      if (!cli) return res.status(401).json({ erro: 'Credenciais inválidas' });

      const ok = await confereSenha(senha, cli.senha);
      if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

      const token = gerarToken({
        tipo: 'cliente',
        id_cliente: cli.id_cliente,
        email: cli.email,
        nome: cli.nome
      });

      res.json({
        token,
        cliente: {
          id_cliente: cli.id_cliente,
          nome: cli.nome,
          email: cli.email
        }
      });
    } catch (e) { next(e); }
  }
};
