// Tarefas/Aplicar-schema.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

function mustRead(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

async function main() {
  // Garante que estamos resolvendo a partir da raiz do projeto
  const root = process.cwd();
  const schemaPath = path.join(root, 'sql', 'Criar_Schema.sql');
  const dadosPath  = path.join(root, 'sql', 'Dados_exemplo.sql');

  // Lê SQL principal + opcional de dados-exemplo
  const schema = mustRead(schemaPath);
  const dados  = fs.existsSync(dadosPath) ? fs.readFileSync(dadosPath, 'utf8') : '';
  const sql = `${schema}\n${dados}`;

  // Conexão somente para aplicar o schema (sem database fixo)
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USUARIO,
    password: process.env.DB_SENHA,
    multipleStatements: true,
  });

  try {
    console.log('>> Aplicando schema SQL...');
    await conn.query(sql);
    console.log('✅ Banco criado/atualizado com sucesso.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('❌ Erro ao aplicar schema:', err.message);
  process.exit(1);
});
