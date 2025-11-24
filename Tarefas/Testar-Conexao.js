// Tarefas/Testar-Conexao.js
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const db = process.env.DB_NOME || 'Dex';

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USUARIO,
    password: process.env.DB_SENHA,
    database: db,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
  });

  // Insere dados mínimos se estiver vazio
  const [[{ qtdCli }]] = await pool.query('SELECT COUNT(*) AS qtdCli FROM Clientes');
  if (qtdCli === 0) {
    await pool.query(
      `INSERT INTO Clientes (nome, telefone, endereco)
       VALUES ('Ana', '85999999999', 'Rua A, 123')
       ON DUPLICATE KEY UPDATE nome=VALUES(nome)`
    );
  }

  const [[{ qtdRest }]] = await pool.query('SELECT COUNT(*) AS qtdRest FROM Restaurantes');
  if (qtdRest === 0) {
    await pool.query(
      `INSERT INTO Restaurantes (nome_restaurante, tipo_cozinha, telefone_restaurante)
       VALUES ('Pizzaria X', 'Italiana', '85888888888')
       ON DUPLICATE KEY UPDATE nome_restaurante=VALUES(nome_restaurante)`
    );
  }

  const [[cli]] = await pool.query('SELECT id_cliente FROM Clientes LIMIT 1');
  const [[rest]] = await pool.query('SELECT id_restaurante FROM Restaurantes LIMIT 1');

  // Cria um pedido de teste
  const [resPedido] = await pool.query(
    'INSERT INTO Pedidos (id_cliente, id_restaurante) VALUES (?,?)',
    [cli.id_cliente, rest.id_restaurante]
  );
  const id_pedido = resPedido.insertId;

  // Adiciona itens
  await pool.query(
    'INSERT INTO ItemPedido (id_pedido, descricao, quantidade, preco_unitario) VALUES (?,?,?,?)',
    [id_pedido, 'Pizza Calabresa', 2, 39.9]
  );
  await pool.query(
    'INSERT INTO ItemPedido (id_pedido, descricao, quantidade, preco_unitario) VALUES (?,?,?,?)',
    [id_pedido, 'Refrigerante', 1, 8.0]
  );

  // Consulta o pedido completo
  const [rows] = await pool.query(
    `SELECT p.id_pedido, p.pedido_status, i.descricao, i.quantidade, i.preco_unitario, i.total
     FROM Pedidos p
     JOIN ItemPedido i ON i.id_pedido = p.id_pedido
     WHERE p.id_pedido = ?`, [id_pedido]
  );

  console.log('✅ Conexão ok. Pedido de teste criado:');
  console.table(rows);

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Erro no teste de conexão:', err.message);
  process.exit(1);
});
