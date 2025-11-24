# 🍔 Dex Delivery — Sistema de Delivery com Node.js e MySQL

Bem-vindo ao **Dex Delivery**, um sistema completo de delivery com **API em Node.js + Express**, **banco MySQL** e **front-end em HTML/CSS/JS**.  
O projeto foi pensado para estudos de desenvolvimento web full stack, com foco em separação de responsabilidades (cliente x restaurante) e integração com banco de dados relacional.

---

## 🎯 Visão Geral

### 👤 Área do Cliente
- Cadastro e login de clientes  
- Listagem de restaurantes  
- Visualização de cardápio por restaurante  
- Adição de itens ao carrinho  
- Finalização de pedidos  
- Acompanhamento do status do pedido

### 🧑‍🍳 Área do Restaurante
- Cadastro e login de restaurantes  
- Cadastro de itens no cardápio (nome, descrição e preço)  
- Listagem e remoção de itens do cardápio  
- Visualização de pedidos recebidos  
- Atualização de status do pedido (CRIADO → EM_PREPARO → A_CAMINHO → ENTREGUE / CANCELADO)

### 🛠 Backend / API
- **Node.js + Express**  
- Arquitetura modular organizada por domínio (clientes, restaurantes, cardápio, pedidos)  
- Integração com **MySQL** usando driver oficial  
- Senhas armazenadas com hash (bcrypt)  
- Endpoints REST padronizados

### 💻 Front-End
- Páginas em **HTML5 + CSS3 + JavaScript**  
- Layout escuro, minimalista, inspirado em apps de delivery  
- Sem imagens de restaurantes/itens (visual clean)  
- Separação de telas de login/cadastro e painéis de cliente/restaurante  

---

## 📂 Estrutura do Projeto

```bash
dex-api/
├── public/                  # Front-end (arquivos estáticos)
│   ├── index.html           # Tela inicial + fluxo principal
│   ├── cadastro-cliente.html
│   ├── cadastro-restaurante.html
│   ├── style.css            # Estilos globais do site
│   └── app.js               # Lógica de front (consumo da API)
│
├── src/
│   ├── config/
│   │   └── Conexao-Banco.js # Configuração da conexão MySQL
│   │
│   ├── modulos/
│   │   ├── clientes/        # Rotas, controlador e serviço de clientes
│   │   ├── restaurantes/    # Rotas, controlador e serviço de restaurantes
│   │   ├── cardapio/        # Rotas, controlador e serviço de itens de cardápio
│   │   └── pedidos/         # Rotas, controlador e serviço de pedidos
│   │
│   ├── utils/
│   │   └── seguranca.js      
│   │
│   └── Servidor.js 
│
├── package.json
├── .env                     # Variáveis de ambiente (NÃO versionado no Git)
└── README.md
```

> 🔒 O arquivo `.env` não deve ser versionado (por conter dados sensíveis do banco).

---

## 🗄️ Configuração do Banco de Dados

Crie um banco de dados MySQL chamado `Dex` (ou outro nome de sua preferência):

```sql
CREATE DATABASE Dex;
```

Depois, crie as tabelas (exemplo simplificado):

```sql
USE Dex;

CREATE TABLE Clientes (
  id_cliente INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  telefone CHAR(11) NOT NULL UNIQUE,
  endereco VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE Restaurantes (
  id_restaurante INT PRIMARY KEY AUTO_INCREMENT,
  nome_restaurante VARCHAR(100) NOT NULL,
  tipo_cozinha VARCHAR(100) NOT NULL,
  telefone_restaurante CHAR(11) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE ItensCardapio (
  id_item_cardapio INT PRIMARY KEY AUTO_INCREMENT,
  id_restaurante INT NOT NULL,
  nome_item VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  preco DECIMAL(10,2) NOT NULL,
  ativo TINYINT DEFAULT 1,
  FOREIGN KEY (id_restaurante) REFERENCES Restaurantes(id_restaurante)
);

CREATE TABLE Pedidos (
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

CREATE TABLE ItemPedido (
  id_item INT PRIMARY KEY AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_item_cardapio INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_item_cardapio) REFERENCES ItensCardapio(id_item_cardapio)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
```

> Obs.: o script acima é um resumo da estrutura usada no projeto, você pode ajustá-lo conforme evolução do código.

---

## 🔐 Configuração do `.env`

Na raiz do projeto (`dex-api/`), crie um arquivo `.env` com as variáveis de conexão ao banco:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USUARIO=root
DB_SENHA=sua_senha_aqui
DB_NOME=Dex
PORT=3000
```

Certifique-se de que o `Conexao-Banco.js` está lendo essas variáveis usando `dotenv`.

---

## ▶️ Como Rodar o Projeto

### 1️⃣ Instalar as dependências

```bash
npm install
```

### 2️⃣ Subir o servidor em modo desenvolvimento

```bash
npm run dev
```

Ou, se não existir script `dev`:

```bash
node src/Servidor.js

```

A aplicação estará acessível em:

```bash
http://localhost:3000
```

O front-end é servido pela pasta `public/`.

---

## 📡 Endpoints Principais (Resumo)

### 👤 Clientes

```http
POST /clientes           # Cadastro de cliente
POST /clientes/login     # Login de cliente
GET  /clientes           # Listar clientes (para testes/admin)
```

### 🧑‍🍳 Restaurantes

```http
POST /restaurantes           # Cadastro de restaurante
POST /restaurantes/login     # Login de restaurante
GET  /restaurantes           # Listar restaurantes
```

### 📋 Cardápio

```http
POST   /cardapio                      # Cadastrar item de cardápio
GET    /cardapio/restaurantes/:id     # Listar cardápio de um restaurante
DELETE /cardapio/:id                  # Remover item do cardápio
```

### 🧾 Pedidos

```http
POST  /pedidos                 # Criar pedido
GET   /pedidos                 # Listar pedidos (cliente/restaurante filtra na tela)
PATCH /pedidos/:id/status      # Atualizar status do pedido
```

---

## 🤝 Contribuições

Contribuições são bem-vindas!  
Você pode:
- Abrir *issues* com dúvidas ou sugestões  
- Enviar *pull requests* com melhorias de código, layout ou documentação  

---

## 📄 Licença

Este projeto é de uso livre para fins **educacionais** e de **portfólio**.

---

## ✨ Autor

**Luis Eduardo Holanda da Silva e Davi Vieira Rodrigues**  
Estudantes de Ciência da Computação — UNIFOR  
Foco em desenvolvimento web, Node.js e MySQL
