let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) window.location.href = "cadastro.html";
if (usuarioLogado.saldo === undefined) usuarioLogado.saldo = 0;
if (!Array.isArray(usuarioLogado.movimentacoes)) usuarioLogado.movimentacoes = [];

const saldoEl = document.getElementById("saldo");
const cardsContainer = document.getElementById("cardsMovimentos");

function atualizarDashboard() {
  saldoEl.textContent = `R$ ${usuarioLogado.saldo.toFixed(2)}`;
  cardsContainer.innerHTML = "";

  usuarioLogado.movimentacoes.slice().reverse().forEach((mov) => {
    const card = document.createElement("div");
    card.className = `card-mov ${mov.tipo}`;
    card.innerHTML = `
      <strong>${mov.descricao}</strong>
      <span>R$ ${mov.valor.toFixed(2)}</span>
    `;
    cardsContainer.appendChild(card);
  });

  atualizarGraficos();
}

const popup = document.getElementById("popup");
document.getElementById("abrirPopup").addEventListener("click", () => popup.style.display = "flex");
document.getElementById("fecharPopup").addEventListener("click", () => popup.style.display = "none");

document.getElementById("salvarMov").addEventListener("click", () => {
  const tipo = document.getElementById("tipoAcao").value;
  const descricao = document.getElementById("nomeMov").value.trim();
  const valor = parseFloat(document.getElementById("valorMov").value);

  if (!tipo || !descricao || isNaN(valor)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  usuarioLogado.movimentacoes.push({
    tipo,
    descricao,
    valor,
    data: new Date().toISOString(),
  });

  if (tipo === "entrada" || tipo === "rendaExtra") usuarioLogado.saldo += valor;
  else if (tipo === "saida") usuarioLogado.saldo -= valor;

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios = usuarios.map((u) => {
    if (u.email === usuarioLogado.email) {
      return usuarioLogado; 
    }
    return u;
  });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  atualizarDashboard();
  popup.style.display = "none";

  document.getElementById("tipoAcao").value = "";
  document.getElementById("nomeMov").value = "";
  document.getElementById("valorMov").value = "";
});


const btnDashboard = document.getElementById("btnDashboard");
const btnTransacoes = document.getElementById("btnTransacoes");
const secDashboard = document.getElementById("secDashboard");
const secTransacoes = document.getElementById("secTransacoes");

btnDashboard.addEventListener("click", () => {
  secDashboard.style.display = "block";
  secTransacoes.style.display = "none";
  btnDashboard.classList.add("ativo");
  btnTransacoes.classList.remove("ativo");
});

btnTransacoes.addEventListener("click", () => {
  secDashboard.style.display = "none";
  secTransacoes.style.display = "block";
  btnDashboard.classList.remove("ativo");
  btnTransacoes.classList.add("ativo");
  atualizarDashboard();
});

document.getElementById("voltarDashboard").addEventListener("click", () => {
  secDashboard.style.display = "block";
  secTransacoes.style.display = "none";
  btnDashboard.classList.add("ativo");
  btnTransacoes.classList.remove("ativo");
});

const toggleMenu = document.getElementById("toggleMenu");
const sidebar = document.getElementById("sidebar");
toggleMenu.addEventListener("click", () => sidebar.classList.toggle("collapsed"));

const ctxLinha = document.getElementById("graficoLinha").getContext("2d");
const ctxPizza = document.getElementById("graficoPizza").getContext("2d");

const graficoLinha = new Chart(ctxLinha, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Entradas (R$)",
        data: [],
        borderColor: "#00ff99",
        backgroundColor: "#00ff9955",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Saídas (R$)",
        data: [],
        borderColor: "#ff5555",
        backgroundColor: "#ff555533",
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: "#fff", font: { size: 13 } } } },
    scales: {
      x: { ticks: { color: "#00ffff" } },
      y: { ticks: { color: "#00ffff" } },
    },
  },
});

const graficoPizza = new Chart(ctxPizza, {
  type: "doughnut",
  data: {
    labels: ["Entrada", "Saída", "Renda Extra"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#00ff99", "#ff5555", "#00ffff"],
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: "#fff", font: { size: 14 } } } },
    cutout: "65%",
  },
});

function atualizarGraficos() {
  const totais = { entrada: 0, saida: 0, rendaExtra: 0 };
  const entradasPorDia = {};
  const saidasPorDia = {};

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  usuarioLogado.movimentacoes.forEach((mov) => {
    const dataMov = new Date(mov.data);
    if (dataMov.getMonth() === mesAtual && dataMov.getFullYear() === anoAtual) {
      const dia = dataMov.getDate();
      if (mov.tipo === "entrada" || mov.tipo === "rendaExtra") {
        entradasPorDia[dia] = (entradasPorDia[dia] || 0) + mov.valor;
      } else if (mov.tipo === "saida") {
        saidasPorDia[dia] = (saidasPorDia[dia] || 0) + mov.valor;
      }
      totais[mov.tipo] += mov.valor;
    }
  });

  const diasDoMes = Array.from(
    { length: hoje.getDate() },
    (_, i) => (i + 1).toString()
  );

  const dadosEntrada = diasDoMes.map((d) => entradasPorDia[d] || 0);
  const dadosSaida = diasDoMes.map((d) => saidasPorDia[d] || 0);

  graficoLinha.data.labels = diasDoMes;
  graficoLinha.data.datasets[0].data = dadosEntrada;
  graficoLinha.data.datasets[1].data = dadosSaida;
  graficoLinha.update();

  graficoPizza.data.datasets[0].data = [
    totais.entrada,
    totais.saida,
    totais.rendaExtra,
  ];
  graficoPizza.update();
}

atualizarDashboard();
