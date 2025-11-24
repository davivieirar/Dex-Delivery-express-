// ================== CONFIG BÁSICA ==================

const API = "http://localhost:3000";

// estados em memória
let clienteLogado = null;
let restLogado = null;
let tokenCliente = null;
let tokenRest = null;

let carrinho = [];
let restauranteSelecionado = null;

// possíveis status de pedido
const STATUS_PEDIDO = ["CRIADO", "EM_PREPARO", "A_CAMINHO", "ENTREGUE", "CANCELADO"];

// ================== HELPERS DE UI ==================

function $(id) {
  return document.getElementById(id);
}

function esconderTudo() {
  ["login-cliente", "login-restaurante", "painel-cliente", "painel-restaurante"]
    .forEach((id) => $(id)?.classList.add("oculto"));

  $("area-pedidos-cliente")?.classList.add("oculto");
  $("area-pedidos-rest")?.classList.add("oculto");
}

function classeStatus(status) {
  switch (status) {
    case "CRIADO":
      return "status status-criado";
    case "EM_PREPARO":
      return "status status-preparo";
    case "A_CAMINHO":
      return "status status-caminho";
    case "ENTREGUE":
      return "status status-entregue";
    case "CANCELADO":
      return "status status-cancelado";
    default:
      return "status";
  }
}

// ================== LOGIN / FLUXO INICIAL ==================

function mostrarLoginCliente() {
  esconderTudo();
  $("login-cliente").classList.remove("oculto");
}

function mostrarLoginRest() {
  esconderTudo();
  $("login-restaurante").classList.remove("oculto");
}

// ----- Cliente -----

async function loginCliente() {
  const email = $("cli-email").value.trim();
  const senha = $("cli-senha").value.trim();

  if (!email || !senha) {
    alert("Preencha email e senha.");
    return;
  }

  try {
    const r = await fetch(`${API}/clientes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.erro || "Erro ao fazer login.");
      return;
    }

    clienteLogado = data.cliente || data;
    tokenCliente = data.token || null;

    esconderTudo();
    $("painel-cliente").classList.remove("oculto");
    carregarRestaurantes();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao fazer login.");
  }
}

// ----- Restaurante -----

async function loginRestaurante() {
  const email = $("rest-email").value.trim();
  const senha = $("rest-senha").value.trim();

  if (!email || !senha) {
    alert("Preencha email e senha.");
    return;
  }

  try {
    const r = await fetch(`${API}/restaurantes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.erro || "Erro ao fazer login.");
      return;
    }

    restLogado = data.restaurante || data;
    tokenRest = data.token || null;

    esconderTudo();
    $("painel-restaurante").classList.remove("oculto");
    document.querySelector(".form-cardapio")?.classList.remove("oculto");
    carregarMeuCardapio();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao fazer login.");
  }
}

// ================== CLIENTE - RESTAURANTES & CARDÁPIO ==================

async function carregarRestaurantes() {
  const listaRest = $("lista-restaurantes");
  if (!listaRest) return;

  listaRest.innerHTML = "Carregando restaurantes...";

  try {
    const r = await fetch(`${API}/restaurantes`);
    const dados = await r.json();

    if (!r.ok) {
      listaRest.innerHTML = "<p>Erro ao carregar restaurantes.</p>";
      return;
    }

    if (!dados.length) {
      listaRest.innerHTML = "<p>Nenhum restaurante cadastrado.</p>";
      return;
    }

    listaRest.innerHTML = "";

    dados.forEach((rest) => {
      listaRest.innerHTML += `
        <article class="card restaurante-card">
          <div class="card-body">
            <h3>${rest.nome_restaurante}</h3>
            <p>${rest.tipo_cozinha}</p>
            <button class="btn red cheio"
                    onclick="abrirCardapio(${rest.id_restaurante}, '${rest.nome_restaurante.replace(
                      /'/g,
                      "\\'"
                    )}')">
              Ver cardápio
            </button>
          </div>
        </article>
      `;
    });
  } catch (e) {
    console.error(e);
    listaRest.innerHTML = "<p>Erro de conexão ao buscar restaurantes.</p>";
  }
}

async function abrirCardapio(idRest, nomeRest) {
  restauranteSelecionado = idRest;
  $("cardapio-area").classList.remove("oculto");
  $("titulo-cardapio").textContent = `Cardápio de ${nomeRest}`;
  await carregarCardapioCliente(idRest);
}

async function carregarCardapioCliente(idRest) {
  const lista = $("lista-cardapio");
  if (!lista) return;

  lista.innerHTML = "Carregando cardápio...";

  try {
    const r = await fetch(`${API}/cardapio/restaurantes/${idRest}`);
    const itens = await r.json();

    if (!r.ok) {
      lista.innerHTML = "<p>Erro ao carregar cardápio.</p>";
      return;
    }

    if (!itens.length) {
      lista.innerHTML = "<p>Este restaurante ainda não cadastrou itens.</p>";
      return;
    }

    lista.innerHTML = "";

    itens.forEach((item) => {
      lista.innerHTML += `
        <article class="card item-cardapio">
          <div class="card-body">
            <h3>${item.nome_item}</h3>
            <p>${item.descricao || ""}</p>
            <div class="preco-linha">
              <span>R$ ${Number(item.preco).toFixed(2)}</span>
              <button class="btn red cheio"
                      onclick="adicionarAoCarrinho(${item.id_item_cardapio}, '${item.nome_item.replace(
                        /'/g,
                        "\\'"
                      )}', ${item.preco})">
                Adicionar
              </button>
            </div>
          </div>
        </article>
      `;
    });
  } catch (e) {
    console.error(e);
    lista.innerHTML = "<p>Erro de conexão ao carregar cardápio.</p>";
  }
}

// ================== CARRINHO & PEDIDOS (CLIENTE) ==================

function adicionarAoCarrinho(idItemCardapio, nomeItem, preco) {
  if (!clienteLogado) {
    alert("Faça login como cliente para adicionar itens.");
    return;
  }
  if (!restauranteSelecionado) {
    alert("Selecione um restaurante.");
    return;
  }

  const existente = carrinho.find(
    (i) => i.id_item_cardapio === idItemCardapio
  );
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      id_item_cardapio: idItemCardapio,
      nome_item: nomeItem,
      preco: Number(preco),
      quantidade: 1,
    });
  }

  renderCarrinho();
}

function renderCarrinho() {
  const box = $("carrinho");
  const lista = $("carrinho-itens");
  const totalEl = $("carrinho-total");

  if (!carrinho.length) {
    box.classList.add("oculto");
    lista.innerHTML = "";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  box.classList.remove("oculto");
  lista.innerHTML = "";

  let total = 0;
  carrinho.forEach((item) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    lista.innerHTML += `
      <div class="carrinho-item">
        <span>${item.quantidade}x ${item.nome_item}</span>
        <span>R$ ${subtotal.toFixed(2)}</span>
      </div>
    `;
  });

  totalEl.textContent = "R$ " + total.toFixed(2);
}

async function finalizarPedido() {
  if (!clienteLogado) {
    alert("Faça login como cliente.");
    return;
  }
  if (!restauranteSelecionado) {
    alert("Selecione um restaurante.");
    return;
  }
  if (!carrinho.length) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const payload = {
    id_cliente: clienteLogado.id_cliente,
    id_restaurante: restauranteSelecionado,
    itens: carrinho.map((item) => ({
      id_item_cardapio: item.id_item_cardapio,
      quantidade: item.quantidade,
    })),
  };

  try {
    const r = await fetch(`${API}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(tokenCliente ? { Authorization: "Bearer " + tokenCliente } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.erro || "Erro ao criar pedido.");
      return;
    }

    alert("Pedido realizado com sucesso!");
    carrinho = [];
    renderCarrinho();
    carregarPedidosCliente();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao finalizar pedido.");
  }
}

async function carregarPedidosCliente() {
  if (!clienteLogado) {
    alert("Faça login como cliente.");
    return;
  }

  const area = $("area-pedidos-cliente");
  const listaEl = $("lista-pedidos-cliente");
  if (!area || !listaEl) return;

  area.classList.remove("oculto");
  listaEl.innerHTML = "Carregando...";

  try {
    const r = await fetch(`${API}/pedidos`);
    const lista = await r.json();

    if (!r.ok) {
      listaEl.innerHTML = "<p>Erro ao carregar pedidos.</p>";
      return;
    }

    const meus = lista.filter(
      (p) => p.id_cliente === clienteLogado.id_cliente
    );

    if (!meus.length) {
      listaEl.innerHTML =
        "<p class='info-pequena'>Você ainda não fez pedidos.</p>";
      return;
    }

    listaEl.innerHTML = "";

    meus.forEach((p) => {
      const data = new Date(p.data_hora);
      const formato = data.toLocaleString("pt-BR");
      const total = typeof p.total === "number" ? p.total : 0;
      const nomeRest =
        p.nome_restaurante || p.restaurante || `Restaurante ${p.id_restaurante}`;

      listaEl.innerHTML += `
        <div class="pedido-card">
          <div class="pedido-info">
            <strong>Pedido #${p.id_pedido}</strong>
            <span>Restaurante: ${nomeRest}</span>
            <span>Data: ${formato}</span>
            <span>Valor: R$ ${total.toFixed(2)}</span>
          </div>
          <div>
            <span class="${classeStatus(p.pedido_status)}">
              ${p.pedido_status.replace("_", " ")}
            </span>
          </div>
        </div>
      `;
    });
  } catch (e) {
    console.error(e);
    listaEl.innerHTML =
      "<p>Erro de conexão ao carregar pedidos.</p>";
  }
}

// ================== RESTAURANTE - MEU CARDÁPIO ==================

async function carregarMeuCardapio() {
  if (!restLogado) return;

  const container = $("meu-cardapio");
  if (!container) return;

  container.innerHTML = "Carregando itens...";

  try {
    const r = await fetch(
      `${API}/cardapio/restaurantes/${restLogado.id_restaurante}`
    );
    const itens = await r.json();

    if (!r.ok) {
      container.innerHTML = "<p>Erro ao carregar cardápio.</p>";
      return;
    }

    if (!itens.length) {
      container.innerHTML =
        "<p>Nenhum item cadastrado ainda.</p>";
      return;
    }

    container.innerHTML = "";

    itens.forEach((item) => {
      container.innerHTML += `
        <article class="card item-cardapio">
          <div class="card-body">
            <h3>${item.nome_item}</h3>
            <p>${item.descricao || ""}</p>
            <div class="preco-linha">
              <span>R$ ${Number(item.preco).toFixed(2)}</span>
            </div>
            <button class="btn outline"
                    onclick="removerItemRest(${item.id_item_cardapio})">
              Excluir
            </button>
          </div>
        </article>
      `;
    });
  } catch (e) {
    console.error(e);
    container.innerHTML =
      "<p>Erro de conexão ao carregar cardápio.</p>";
  }
}

async function addItemCardapio() {
  if (!restLogado) {
    alert("Faça login como restaurante.");
    return;
  }

  const nome = $("item-nome").value.trim();
  const preco = Number($("item-preco").value);
  const desc = $("item-desc").value.trim();

  if (!nome || !preco) {
    alert("Preencha pelo menos nome e preço.");
    return;
  }

  const payload = {
    id_restaurante: restLogado.id_restaurante,
    nome_item: nome,
    descricao: desc,
    preco: preco,
    ativo: 1,
  };

  try {
    const r = await fetch(`${API}/cardapio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(tokenRest ? { Authorization: "Bearer " + tokenRest } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.erro || "Erro ao cadastrar item.");
      return;
    }

    alert("Item adicionado!");
    $("item-nome").value = "";
    $("item-preco").value = "";
    $("item-desc").value = "";

    carregarMeuCardapio();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao adicionar item.");
  }
}

async function removerItemRest(id) {
  if (!confirm("Excluir este item?")) return;

  try {
    const r = await fetch(`${API}/cardapio/${id}`, {
      method: "DELETE",
      headers: {
        ...(tokenRest ? { Authorization: "Bearer " + tokenRest } : {}),
      },
    });

    if (!r.ok && r.status !== 204) {
      let msg = "Erro ao excluir item.";
      try {
        const data = await r.json();
        if (data.erro) msg = data.erro;
      } catch (_) {}
      alert(msg);
      return;
    }

    alert("Item removido.");
    carregarMeuCardapio();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao excluir item.");
  }
}

// ================== RESTAURANTE - PEDIDOS ==================

async function carregarPedidosRestaurante() {
  if (!restLogado) {
    alert("Faça login como restaurante.");
    return;
  }

  const area = $("area-pedidos-rest");
  const listaEl = $("lista-pedidos-rest");
  if (!area || !listaEl) return;

  area.classList.remove("oculto");
  listaEl.innerHTML = "Carregando...";

  try {
    const r = await fetch(`${API}/pedidos`);
    const lista = await r.json();

    if (!r.ok) {
      listaEl.innerHTML = "<p>Erro ao carregar pedidos.</p>";
      return;
    }

    const meus = lista.filter(
      (p) => p.id_restaurante === restLogado.id_restaurante
    );

    if (!meus.length) {
      listaEl.innerHTML =
        "<p>Nenhum pedido recebido ainda.</p>";
      return;
    }

    listaEl.innerHTML = "";

    meus.forEach((p) => {
      const data = new Date(p.data_hora);
      const formato = data.toLocaleString("pt-BR");
      const total = typeof p.total === "number" ? p.total : 0;
      const nomeCliente =
        p.nome_cliente || p.cliente || `Cliente ${p.id_cliente}`;

      const options = STATUS_PEDIDO.map(
        (st) => `
        <option value="${st}" ${
          st === p.pedido_status ? "selected" : ""
        }>
          ${st.replace("_", " ")}
        </option>
      `
      ).join("");

      listaEl.innerHTML += `
        <div class="pedido-card">
          <div class="pedido-info">
            <strong>Pedido #${p.id_pedido}</strong>
            <span>Cliente: ${nomeCliente}</span>
            <span>Data: ${formato}</span>
            <span>Valor: R$ ${total.toFixed(2)}</span>
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
  } catch (e) {
    console.error(e);
    listaEl.innerHTML =
      "<p>Erro de conexão ao carregar pedidos.</p>";
  }
}

async function salvarStatusPedido(idPedido) {
  const select = $(`sel-status-${idPedido}`);
  if (!select) return;

  const novoStatus = select.value;

  try {
    const r = await fetch(`${API}/pedidos/${idPedido}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(tokenRest ? { Authorization: "Bearer " + tokenRest } : {}),
      },
      body: JSON.stringify({ status: novoStatus }),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.erro || "Erro ao atualizar status.");
      return;
    }

    alert("Status atualizado!");
    carregarPedidosRestaurante();
  } catch (e) {
    console.error(e);
    alert("Erro de conexão ao atualizar status.");
  }
}

// ================== INICIAL ==================

console.log("app.js carregado");
