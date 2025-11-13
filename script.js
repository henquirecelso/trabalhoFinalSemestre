let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) window.location.href = "cadastro.html";
if (usuarioLogado.saldo === undefined) usuarioLogado.saldo = 0;
if (!Array.isArray(usuarioLogado.movimentacoes)) usuarioLogado.movimentacoes = [];

const saldoEl = document.getElementById("saldo");
const cardsContainer = document.getElementById("cardsMovimentos");
const popup = document.getElementById("popup");
const tipoBtns = document.querySelectorAll(".tipo-btn");
const tipoAcaoInput = document.getElementById("tipoAcao");
const btnAbrirPopup = document.getElementById("abrirPopup");
const btnFecharPopup = document.getElementById("fecharPopup");
const btnSalvarMov = document.getElementById("salvarMov");
const btnDashboard = document.getElementById("btnDashboard");
const btnTransacoes = document.getElementById("btnTransacoes");
const btnLogout = document.getElementById("logoutBtn");
const secDashboard = document.getElementById("secDashboard");
const secTransacoes = document.getElementById("secTransacoes");
const inputNomeMov = document.getElementById("nomeMov");
const inputValorMov = document.getElementById("valorMov");

function abrirPopup() {
  popup.style.display = "flex";
  popup.style.opacity = 0;
  tipoAcaoInput.value = "entrada";
  tipoBtns.forEach((b) => b.classList.remove("ativo"));
  tipoBtns[0].classList.add("ativo");

  let op = 0;
  const fadeIn = setInterval(() => {
    if (op >= 1) clearInterval(fadeIn);
    popup.style.opacity = op;
    op += 0.1;
  }, 20);

  inputNomeMov.focus();
}

function fecharPopup() {
  let op = 1;
  const fadeOut = setInterval(() => {
    if (op <= 0) {
      clearInterval(fadeOut);
      popup.style.display = "none";
    }
    popup.style.opacity = op;
    op -= 0.1;
  }, 20);
}

btnAbrirPopup.addEventListener("click", abrirPopup);
btnFecharPopup.addEventListener("click", fecharPopup);

tipoBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tipoBtns.forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    tipoAcaoInput.value = btn.dataset.tipo;
  });
});

btnSalvarMov.addEventListener("click", () => {
  const tipo = tipoAcaoInput.value;
  const descricao = inputNomeMov.value.trim();
  const valor = parseFloat(inputValorMov.value);

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
  usuarios = usuarios.map((u) => (u.email === usuarioLogado.email ? usuarioLogado : u));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  atualizarDashboard();
  fecharPopup();

  inputNomeMov.value = "";
  inputValorMov.value = "";
});

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
        borderColor: "#0f8a23ff",
        backgroundColor: "#00eaff33",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Saídas (R$)",
        data: [],
        borderColor: "#ff3300ff",
        backgroundColor: "#0077ff33",
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: "#fff", font: { size: 13 } } } },
    scales: {
      x: { ticks: { color: "#00eaff" } },
      y: { ticks: { color: "#00eaff" } },
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
        backgroundColor: ["#0f8a23ff", "#ff1e00ff", "#eeb806ff"],
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

function atualizarDashboard() {
  let entradas = usuarioLogado.movimentacoes.filter(m => m.tipo === 'entrada' || m.tipo === 'rendaExtra');
  let saidas = usuarioLogado.movimentacoes.filter(m => m.tipo === 'saida');

  const totalEntrada = entradas.reduce((acc, cur) => acc + cur.valor, 0);
  const totalSaida = saidas.reduce((acc, cur) => acc + cur.valor, 0);
  const debito = totalEntrada - totalSaida; 

  saldoEl.textContent = `R$ ${usuarioLogado.saldo.toFixed(2).replace('.', ',')}`;

  document.getElementById("maiorEntrada").textContent = `R$ ${totalEntrada.toFixed(2).replace('.', ',')}`;
  document.getElementById("maiorSaida").textContent = `R$ ${totalSaida.toFixed(2).replace('.', ',')}`;
  document.getElementById("debito").textContent = `R$ ${debito.toFixed(2).replace('.', ',')}`;

  cardsContainer.innerHTML = "";
  usuarioLogado.movimentacoes
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(mov => {
      const card = document.createElement("div");
      card.classList.add("info-card");
      card.classList.add(mov.tipo === 'entrada' || mov.tipo === 'rendaExtra' ? 'entrada' : 'saida');
      card.innerHTML = `
        <h3>${mov.descricao}</h3>
        <p>R$ ${mov.valor.toFixed(2).replace('.', ',')}</p>
        <small>${new Date(mov.data).toLocaleDateString('pt-BR')}</small>
      `;
      cardsContainer.appendChild(card);
    });

  const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);
  const entradasDiarias = Array(31).fill(0);
  const saidasDiarias = Array(31).fill(0);

  usuarioLogado.movimentacoes.forEach(m => {
    const dia = new Date(m.data).getDate() - 1;
    if (m.tipo === 'entrada' || m.tipo === 'rendaExtra') entradasDiarias[dia] += m.valor;
    else if (m.tipo === 'saida') saidasDiarias[dia] += m.valor;
  });

  graficoLinha.data.labels = diasDoMes;
  graficoLinha.data.datasets[0].data = entradasDiarias;
  graficoLinha.data.datasets[1].data = saidasDiarias;
  graficoLinha.update();

  graficoPizza.data.datasets[0].data = [totalEntrada, totalSaida, usuarioLogado.movimentacoes
    .filter(m => m.tipo === 'rendaExtra')
    .reduce((acc, cur) => acc + cur.valor, 0)];
  graficoPizza.update();
}



function mostrarSecao(secAtiva, btnAtivo, secInativa, btnInativo) {
  secAtiva.classList.add("ativo");
  secInativa.classList.remove("ativo");
  btnAtivo.classList.add("ativo");
  btnInativo.classList.remove("ativo");
}

btnDashboard.addEventListener("click", () => mostrarSecao(secDashboard, btnDashboard, secTransacoes, btnTransacoes));
btnTransacoes.addEventListener("click", () => mostrarSecao(secTransacoes, btnTransacoes, secDashboard, btnDashboard));

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "cadastro.html";
});

atualizarDashboard();
