CREATE DATABASE IF NOT EXISTS Dex;
USE Dex;

CREATE TABLE IF NOT EXISTS Clientes(
  id_cliente INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  telefone CHAR(11) NOT NULL UNIQUE,
  endereco VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Restaurantes(
  id_restaurante INT PRIMARY KEY AUTO_INCREMENT,
  nome_restaurante VARCHAR(100) NOT NULL,
  tipo_cozinha VARCHAR(100) NOT NULL,
  telefone_restaurante CHAR(11) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Pedidos(
  id_pedido INT PRIMARY KEY AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  id_restaurante INT NOT NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pedido_status ENUM('CRIADO','EM_PREPARO','A_CAMINHO','ENTREGUE','CANCELADO') NOT NULL DEFAULT 'CRIADO',
  FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_restaurante) REFERENCES Restaurantes(id_restaurante)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ItemPedido(
  id_item INT PRIMARY KEY AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) AS (quantidade * preco_unitario) STORED,
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_qtd_pos CHECK (quantidade > 0),
  CONSTRAINT chk_preco_pos CHECK (preco_unitario >= 0)
);
