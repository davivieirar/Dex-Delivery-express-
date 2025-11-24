import { pool } from '../../config/Conexao-Banco.js';

export const ClientesRepositorio = {
  async listar() {
    const [rows] = await pool.query(
      'SELECT id_cliente, nome, telefone, endereco, email FROM Clientes ORDER BY id_cliente'
    );
    return rows;
  },

  async obterPorId(id) {
    const [rows] = await pool.query(
      'SELECT id_cliente, nome, telefone, endereco, email FROM Clientes WHERE id_cliente=?',
      [id]
    );
    return rows[0] || null;
  },

  async obterPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM Clientes WHERE email=?', [email]);
    return rows[0] || null;
  },

  async criar({ nome, telefone, endereco, email, senha_hash }) {
    const [res] = await pool.query(
      'INSERT INTO Clientes (nome, telefone, endereco, email, senha) VALUES (?,?,?,?,?)',
      [nome, telefone, endereco, email, senha_hash]
    );
    return res.insertId;
  },

  async atualizar(id, { nome, telefone, endereco, email }) {
    await pool.query(
      'UPDATE Clientes SET nome=?, telefone=?, endereco=?, email=? WHERE id_cliente=?',
      [nome, telefone, endereco, email, id]
    );
  },

  async remover(id) {
    await pool.query('DELETE FROM Clientes WHERE id_cliente=?', [id]);
  }
};
