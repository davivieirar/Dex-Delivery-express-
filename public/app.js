const API = location.origin;

// estados globais
let tokenCliente = null;
let tokenRest = null;
let clienteLogado = null;
let restLogado = null;

let carrinho = {
  restauranteId: null,
  itens: []
};

// status possíveis (igual ao ENUM do banco)
const STATUS_PEDIDO = ["CRIADO","EM_PREPARO","A_CAMINHO","ENTREGUE","CANCELADO"];

/* ========= FUNÇÕES UTIL ========= */

// só permite letras (com acento) e espaço
function permitirSomenteLetras(campoId) {
  const campo = document.getElementById(campoId);
  if (!campo) return;

  campo.addEventListener("input", () => {
    campo.value = campo.value.replace(/[^A-Za-zÀ-ÿ ]/g, "");
  });
}

function classeStatus(status) {
  switch (status) {
    case "CRIADO":        return "pedido-status criado";
    case "EM_PREPARO":    return "pedido-status preparo";
    case "A_CAMINHO":     return "pedido-status caminho";
    case "ENTREGUE":      return "pedido-status entregue";
    case "CANCELADO":     return "pedido-status cancelado";
    default:              return "pedido-status";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // máscaras de nome nos cadastros
  permitirSomenteLetras("cad-cli-nome");
  permitirSomenteLetras("cad-rest-nome");
});

/* ========= TELAS LOGIN (index) ========= */

function esconderTudo() {
  document
    .querySelectorAll(".card, #painel-cliente, #painel-restaurante")
    .forEach(el => el.classList.add("oculto"));
}

function mostrarLoginCliente() {
  esconderTudo();
  const el = document.getElementById("login-cliente");
  if (el) el.classList.remove("oculto");
}

function mostrarLoginRest() {
  esconderTudo();
  const el = document.getElementById("login-restaurante");
  if (el) el.classList.remove("oculto");
}

/* ========= LOGIN ========= */

async function loginCliente() {
  const email = document.getElementById("cli-email").value;
  const senha = document.getElementById("cli-senha").value;

  const r = await fetch(`${API}/clientes/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao fazer login do cliente.");
    return;
  }

  tokenCliente = data.token;
  clienteLogado = data.cliente;

  await carregarRestaurantes();

  esconderTudo();
  const painel = document.getElementById("painel-cliente");
  if (painel) painel.classList.remove("oculto");
}

async function loginRestaurante() {
  const email = document.getElementById("rest-email").value;
  const senha = document.getElementById("rest-senha").value;

  const r = await fetch(`${API}/restaurantes/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao fazer login do restaurante.");
    return;
  }

  tokenRest = data.token;
  restLogado = data.restaurante;

  await carregarMeuCardapio();

  esconderTudo();
  const painel = document.getElementById("painel-restaurante");
  if (painel) painel.classList.remove("oculto");

  document.querySelector(".form-cardapio")?.classList.remove("oculto");

}

/* ========= CADASTRO ========= */

async function cadastrarCliente() {
  const payload = {
    nome: document.getElementById("cad-cli-nome").value,
    email: document.getElementById("cad-cli-email").value,
    telefone: document.getElementById("cad-cli-tel").value,
    endereco: document.getElementById("cad-cli-end").value,
    senha: document.getElementById("cad-cli-senha").value
  };

  const r = await fetch(`${API}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao cadastrar cliente.");
    return;
  }

  alert("Cliente cadastrado com sucesso!");
  location.href = "index.html";
}

async function cadastrarRestaurante() {
  const payload = {
    nome_restaurante: document.getElementById("cad-rest-nome").value,
    tipo_cozinha: document.getElementById("cad-rest-tipo").value,
    telefone_restaurante: document.getElementById("cad-rest-tel").value,
    email: document.getElementById("cad-rest-email").value,
    senha: document.getElementById("cad-rest-senha").value
  };

  const r = await fetch(`${API}/restaurantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao cadastrar restaurante.");
    return;
  }

  alert("Restaurante cadastrado!");
  location.href = "index.html";
}

/* ========= CLIENTE — RESTAURANTES / CARDÁPIO ========= */

async function carregarRestaurantes() {
  const elLista = document.getElementById("lista-restaurantes");
  if (!elLista) return;

  const r = await fetch(`${API}/restaurantes`);
  const lista = await r.json();

  elLista.innerHTML = "";

  lista.forEach(rest => {
    elLista.innerHTML += `
      <div class="rest-card"
           onclick="abrirCardapio(${rest.id_restaurante}, '${rest.nome_restaurante.replace(/'/g,"\\'")}')">
        <img src="https://picsum.photos/400/300?food=${rest.id_restaurante}">
        <div class="rest-info">
          <h3>${rest.nome_restaurante}</h3>
          <p>${rest.tipo_cozinha}</p>
        </div>
      </div>
    `;
  });
}

async function abrirCardapio(id, nome) {
  const area = document.getElementById("cardapio-area");
  const titulo = document.getElementById("titulo-cardapio");
  const listaEl = document.getElementById("lista-cardapio");
  if (!area || !titulo || !listaEl) return;

  carrinho.restauranteId = id;
  carrinho.itens = [];

  area.classList.remove("oculto");
  titulo.textContent = `Cardápio — ${nome}`;

  const r = await fetch(`${API}/cardapio/restaurantes/${id}`);
  const lista = await r.json();

  listaEl.innerHTML = "";

  lista.forEach(item => {
    listaEl.innerHTML += `
      <div class="cardapio-item">
        <img src="https://picsum.photos/400/300?dish=${item.id_item_cardapio}">
        <div class="cardapio-info">
          <h4>${item.nome_item}</h4>
          <p>${item.descricao || ""}</p>
          <div class="cardapio-preco">R$ ${Number(item.preco).toFixed(2)}</div>
          <button class="add-btn"
                  onclick="addCarrinho(${item.id_item_cardapio}, '${item.nome_item.replace(/'/g,"\\'")}', ${Number(item.preco)})">
            Adicionar
          </button>
        </div>
      </div>
    `;
  });

  atualizarCarrinho(); // limpa visualmente se trocar de restaurante
}

/* ========= CARRINHO ========= */

function addCarrinho(id, nome, preco) {
  const existente = carrinho.itens.find(i => i.id === id);

  if (existente) existente.qtd++;
  else carrinho.itens.push({ id, nome, preco, qtd: 1 });

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const el = document.getElementById("carrinho");
  const lista = document.getElementById("carrinho-itens");
  const totalEl = document.getElementById("carrinho-total");
  if (!el || !lista || !totalEl) return;

  if (!carrinho.itens.length) {
    el.classList.add("oculto");
    lista.innerHTML = "";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  el.classList.remove("oculto");
  lista.innerHTML = "";

  let total = 0;

  carrinho.itens.forEach((item, idx) => {
    total += item.preco * item.qtd;

    lista.innerHTML += `
      <div class="carrinho-item">
        <span>${item.nome} (x${item.qtd})</span>
        <button class="btn red" style="padding:4px 8px;font-size:.8rem"
                onclick="removerItem(${idx})">
          X
        </button>
      </div>
    `;
  });

  totalEl.textContent = "R$ " + total.toFixed(2);
}

function removerItem(idx) {
  carrinho.itens.splice(idx, 1);
  atualizarCarrinho();
}

async function finalizarPedido() {
  if (!clienteLogado) {
    alert("Faça login como cliente.");
    return;
  }
  if (!carrinho.itens.length) {
    alert("Carrinho vazio.");
    return;
  }

  const payload = {
    id_cliente: clienteLogado.id_cliente,
    id_restaurante: carrinho.restauranteId,
    itens: carrinho.itens.map(i => ({
      id_item_cardapio: i.id,
      quantidade: i.qtd
    }))
  };

  const r = await fetch(`${API}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + tokenCliente
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao criar pedido.");
    return;
  }

  alert("Pedido enviado!");
  carrinho.itens = [];
  atualizarCarrinho();
}

/* ========= CLIENTE — ACOMPANHAR PEDIDOS ========= */

async function carregarPedidosCliente() {
  if (!clienteLogado) {
    alert("Faça login como cliente.");
    return;
  }

  const area = document.getElementById("area-pedidos-cliente");
  const listaEl = document.getElementById("lista-pedidos-cliente");
  if (!area || !listaEl) return;

  area.classList.remove("oculto");
  listaEl.innerHTML = "Carregando...";

  const r = await fetch(`${API}/pedidos`);
  const lista = await r.json();

  const meus = lista.filter(p => p.id_cliente === clienteLogado.id_cliente);

  if (!meus.length) {
    listaEl.innerHTML = "<p class='info-pequena'>Você ainda não fez nenhum pedido.</p>";
    return;
  }

  listaEl.innerHTML = "";

  meus.forEach(p => {
    const data = new Date(p.data_hora);
    const formato = data.toLocaleString("pt-BR");

    listaEl.innerHTML += `
      <div class="pedido-card">
        <div class="pedido-info">
          <strong>Pedido #${p.id_pedido}</strong>
          <span>Restaurante: ${p.restaurante || p.id_restaurante}</span>
          <span>Data: ${formato}</span>
        </div>
        <div>
          <span class="${classeStatus(p.pedido_status)}">
            ${p.pedido_status.replace("_", " ")}
          </span>
        </div>
      </div>
    `;
  });
}

/* ========= RESTAURANTE — CARDÁPIO ========= */

async function carregarMeuCardapio() {
  const cont = document.getElementById("meu-cardapio");
  if (!cont || !restLogado) return;

  const r = await fetch(`${API}/cardapio/restaurantes/${restLogado.id_restaurante}`);
  const lista = await r.json();

  cont.innerHTML = "";

  lista.forEach(item => {
    cont.innerHTML += `
      <div class="cardapio-item">
        <img src="https://picsum.photos/400/300?rest=${item.id_item_cardapio}">
        <div class="cardapio-info">
          <h4>${item.nome_item}</h4>
          <p>${item.descricao || ""}</p>
          <div class="cardapio-preco">R$ ${Number(item.preco).toFixed(2)}</div>
          <button class="btn outline cheio" style="margin-top:8px"
                  onclick="removerItemRest(${item.id_item_cardapio})">
            Excluir
          </button>
        </div>
      </div>
    `;
  });
}

async function addItemCardapio() {
  if (!restLogado) {
    alert("Faça login como restaurante.");
    return;
  }

  const payload = {
    id_restaurante: restLogado.id_restaurante,
    nome_item: document.getElementById("item-nome").value,
    descricao: document.getElementById("item-desc").value,
    preco: Number(document.getElementById("item-preco").value),
    ativo: 1
  };

  const r = await fetch(`${API}/cardapio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + tokenRest
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.erro || "Erro ao cadastrar item.");
    return;
  }

  alert("Item adicionado!");
  carregarMeuCardapio();
}

async function removerItemRest(id) {
  if (!confirm("Excluir este item?")) return;

  const r = await fetch(`${API}/cardapio/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + tokenRest }
  });

  if (!r.ok && r.status !== 204) {
    const data = await r.json().catch(() => ({}));
    alert(data.erro || "Erro ao excluir item.");
    return;
  }

  alert("Item removido.");
  carregarMeuCardapio();
}

/* ========= RESTAURANTE — PEDIDOS ========= */

async function carregarPedidosRestaurante() {
  if (!restLogado) {
    alert("Faça login como restaurante.");
    return;
  }

  const area = document.getElementById("area-pedidos-rest");
  const listaEl = document.getElementById("lista-pedidos-rest");
  if (!area || !listaEl) return;

  area.classList.remove("oculto");
  listaEl.innerHTML = "Carregando...";

  const r = await fetch(`${API}/pedidos`);
  const lista = await r.json();

  const meus = lista.filter(p => p.id_restaurante === restLogado.id_restaurante);

  if (!meus.length) {
    listaEl.innerHTML = "<p class='info-pequena'>Nenhum pedido recebido ainda.</p>";
    return;
  }

  listaEl.innerHTML = "";

  meus.forEach(p => {
    const data = new Date(p.data_hora);
    const formato = data.toLocaleString("pt-BR");

    const options = STATUS_PEDIDO.map(st => `
      <option value="${st}" ${st === p.pedido_status ? "selected" : ""}>
        ${st.replace("_"," ")}
      </option>
    `).join("");

    listaEl.innerHTML += `
      <div class="pedido-card">
        <div class="pedido-info">
          <strong>Pedido #${p.id_pedido}</strong>
          <span>Cliente: ${p.cliente || p.id_cliente}</span>
          <span>Data: ${formato}</span>
        </div>
        <div class="pedido-acoes">
          <select id="sel-status-${p.id_pedido}">
            ${options}
          </select>
          <button class="btn red cheio"
                  onclick="salvarStatusPedido(${p.id_pedido})">
            Atualizar status
          </button>
        </div>
      </div>
    `;
  });
}

async function salvarStatusPedido(id_pedido) {
  if (!restLogado || !tokenRest) {
    alert("Faça login como restaurante.");
    return;
  }

  const select = document.getElementById(`sel-status-${id_pedido}`);
  if (!select) return;

  const novoStatus = select.value;

  const r = await fetch(`${API}/pedidos/${id_pedido}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + tokenRest
    },
    body: JSON.stringify({ status: novoStatus })
  });

  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    alert(data.erro || "Erro ao atualizar status do pedido.");
    return;
  }

  alert("Status atualizado!");
  carregarPedidosRestaurante();
}
