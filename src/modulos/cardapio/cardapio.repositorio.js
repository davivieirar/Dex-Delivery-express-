import { pool } from '../../config/Conexao-Banco.js';

export const CardapioRepositorio = {
  async listarPorRestaurante(id_restaurante) {
    const [rows] = await pool.query(
      'SELECT id_item_cardapio, id_restaurante, nome_item, descricao, preco, ativo FROM ItensCardapio WHERE id_restaurante=? ORDER BY id_item_cardapio',
      [id_restaurante]
    );
    return rows;
  },

  async obter(id_item_cardapio) {
    const [rows] = await pool.query(
      'SELECT id_item_cardapio, id_restaurante, nome_item, descricao, preco, ativo FROM ItensCardapio WHERE id_item_cardapio=?',
      [id_item_cardapio]
    );
    return rows[0] || null;
  },

  async criar({ id_restaurante, nome_item, descricao, preco, ativo = 1 }) {
    const [res] = await pool.query(
      'INSERT INTO ItensCardapio (id_restaurante, nome_item, descricao, preco, ativo) VALUES (?,?,?,?,?)',
      [id_restaurante, nome_item, descricao ?? null, preco, ativo]
    );
    return res.insertId;
  },

  async atualizar(id_item_cardapio, { nome_item, descricao, preco, ativo }) {
    await pool.query(
      'UPDATE ItensCardapio SET nome_item=?, descricao=?, preco=?, ativo=? WHERE id_item_cardapio=?',
      [nome_item, descricao ?? null, preco, ativo, id_item_cardapio]
    );
  },

  async remover(id_item_cardapio) {
    await pool.query('DELETE FROM ItensCardapio WHERE id_item_cardapio=?', [id_item_cardapio]);
  }
};
