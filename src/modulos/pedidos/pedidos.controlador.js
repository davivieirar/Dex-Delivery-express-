import { PedidosRepositorio } from './pedidos.repositorio.js';

const STATUS_VALIDOS = ['CRIADO', 'EM_PREPARO', 'A_CAMINHO', 'ENTREGUE', 'CANCELADO'];

function validarCriacao({ id_cliente, id_restaurante, itens }) {
  if (!id_cliente || !id_restaurante) {
    return 'id_cliente e id_restaurante são obrigatórios';
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return 'Envie ao menos um item';
  }
  for (const it of itens) {
    if (!it?.id_item_cardapio) return 'Item sem id_item_cardapio';
    if (!(Number(it.quantidade) > 0)) return 'quantidade deve ser > 0';
  }
  return null;
}

export const PedidosControlador = {
  async listar(_req, res, next) {
    try {
      const lista = await PedidosRepositorio.listar();
      res.json(lista);
    } catch (e) { next(e); }
  },

  async obter(req, res, next) {
    try {
      const ped = await PedidosRepositorio.obterCompleto(Number(req.params.id));
      if (!ped) return res.status(404).json({ erro: 'Pedido não encontrado' });
      res.json(ped);
    } catch (e) { next(e); }
  },

  // body: { id_cliente, id_restaurante, itens: [{id_item_cardapio, quantidade}] }
  async criar(req, res, next) {
    try {
      const erro = validarCriacao(req.body);
      if (erro) return res.status(400).json({ erro });

      const { id_cliente, id_restaurante, itens } = req.body;

      const id_pedido = await PedidosRepositorio.criarPedido({
        id_cliente,
        id_restaurante
      });

      for (const it of itens) {
        const preco = await PedidosRepositorio.precoDoItem(it.id_item_cardapio);
        if (preco == null) {
          return res.status(400).json({
            erro: `Item de cardápio inexistente: ${it.id_item_cardapio}`
          });
        }

        await PedidosRepositorio.adicionarItem({
          id_pedido,
          id_item_cardapio: Number(it.id_item_cardapio),
          quantidade: Number(it.quantidade),
          preco_unitario: preco
        });
      }

      const completo = await PedidosRepositorio.obterCompleto(id_pedido);
      res.status(201).json(completo);
    } catch (e) { next(e); }
  },

  async atualizarStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido' });
      }
      const id = Number(req.params.id);
      await PedidosRepositorio.atualizarStatus(id, status);
      const ped = await PedidosRepositorio.obterCompleto(id);
      res.json(ped);
    } catch (e) { next(e); }
  },

  async remover(req, res, next) {
    try {
      await PedidosRepositorio.remover(Number(req.params.id));
      res.status(204).end();
    } catch (e) { next(e); }
  }
};
