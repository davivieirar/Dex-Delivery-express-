import { pool } from '../../config/Conexao-Banco.js';

export const RestaurantesRepositorio = {
  async listar() {
    const [rows] = await pool.query(
      'SELECT id_restaurante, nome_restaurante, tipo_cozinha, telefone_restaurante, email FROM Restaurantes ORDER BY id_restaurante'
    );
    return rows;
  },

  async obterPorId(id) {
    const [rows] = await pool.query(
      'SELECT id_restaurante, nome_restaurante, tipo_cozinha, telefone_restaurante, email FROM Restaurantes WHERE id_restaurante=?',
      [id]
    );
    return rows[0] || null;
  },

  async obterPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM Restaurantes WHERE email=?', [email]);
    return rows[0] || null;
  },

  async criar({ nome_restaurante, tipo_cozinha, telefone_restaurante, email, senha_hash }) {
    const [res] = await pool.query(
      'INSERT INTO Restaurantes (nome_restaurante, tipo_cozinha, telefone_restaurante, email, senha) VALUES (?,?,?,?,?)',
      [nome_restaurante, tipo_cozinha, telefone_restaurante, email, senha_hash]
    );
    return res.insertId;
  },

  async atualizar(id, { nome_restaurante, tipo_cozinha, telefone_restaurante, email }) {
    await pool.query(
      'UPDATE Restaurantes SET nome_restaurante=?, tipo_cozinha=?, telefone_restaurante=?, email=? WHERE id_restaurante=?',
      [nome_restaurante, tipo_cozinha, telefone_restaurante, email, id]
    );
  },

  async remover(id) {
    await pool.query('DELETE FROM Restaurantes WHERE id_restaurante=?', [id]);
  }
};
