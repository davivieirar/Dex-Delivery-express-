import express from 'express';

import clientesRotas from './modulos/clientes/clientes.rotas.js';
import restaurantesRotas from './modulos/restaurantes/restaurantes.rotas.js';
import cardapioRotas from './modulos/cardapio/cardapio.rotas.js';
import pedidosRotas from './modulos/pedidos/pedidos.rotas.js';


const app = express();

app.use(express.json());
app.use(express.static('public')); // se tiver o index.html / css

app.get('/ping', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use('/clientes', clientesRotas);
app.use('/restaurantes', restaurantesRotas);
app.use('/cardapio', cardapioRotas);
app.use('/pedidos', pedidosRotas);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Falha interna', detalhe: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API on http://localhost:${PORT}`);
});
