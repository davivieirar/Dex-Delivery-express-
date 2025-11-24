// src/modulos/cardapio/cardapio.controlador.js
import pool from '../../config/Conexao-Banco.js';

// POST /cardapio  -> criar item
export async function criarItem(req, res) {
  try {
    const { id_restaurante, nome_item, descricao, preco, ativo } = req.body;

    if (!id_restaurante || !nome_item || !preco) {
      return res.status(400).json({
        erro: 'id_restaurante, nome_item e preco são obrigatórios.',
      });
    }

    const [result] = await pool.query(
      `
        INSERT INTO ItensCardapio 
          (id_restaurante, nome_item, descricao, preco, ativo)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        id_restaurante,
        nome_item,
        descricao || null,
        preco,
        ativo ?? 1,
      ],
    );

    const [rows] = await pool.query(
      `SELECT * FROM ItensCardapio WHERE id_item_cardapio = ?`,
      [result.insertId],
    );

    return res.status(201).json(rows[0]);
  } catch (erro) {
    console.error('Erro ao criar item de cardápio:', erro);
    return res.status(500).json({ erro: 'Erro ao criar item de cardápio.' });
  }
}

// GET /cardapio/restaurantes/:id  -> listar itens de um restaurante
export async function listarPorRestaurante(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
        SELECT 
          id_item_cardapio,
          id_restaurante,
          nome_item,
          descricao,
          preco,
          ativo
        FROM ItensCardapio
        WHERE id_restaurante = ?
          AND ativo = 1         -- <<< só ativos
        ORDER BY nome_item
      `,
      [id]
    );

    return res.json(rows);
  } catch (erro) {
    console.error('Erro ao listar itens do cardápio:', erro);
    return res.status(500).json({ erro: 'Erro ao listar itens do cardápio.' });
  }
}


export async function removerItem(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE ItensCardapio
         SET ativo = 0
       WHERE id_item_cardapio = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }

    // 204 = sucesso sem corpo
    return res.status(204).send();
  } catch (erro) {
    console.error('Erro ao remover item do cardápio:', erro);
    return res.status(500).json({ erro: 'Erro ao remover item do cardápio.' });
  }
}

