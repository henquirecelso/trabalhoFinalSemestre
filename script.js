let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) window.location.href = "cadastro.html";
if (usuarioLogado.saldo === undefined) usuarioLogado.saldo = 0;
if (!Array.isArray(usuarioLogado.movimentacoes)) usuarioLogado.movimentacoes = [];

const metaValorEl = document.getElementById("metaValor");
const secMetas = document.getElementById("secMetas");
const btnMetas = document.getElementById("btnMetas");
const btnSalvarMeta = document.getElementById("salvarMeta");
const inputValorMeta = document.getElementById("valorMeta");
if (usuarioLogado.meta === undefined) usuarioLogado.meta = 0;
const saldoEl = document.getElementById("saldo");
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


function mostrarMensagem(pertoDoElemento, texto, tipo = "info") {
  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;
  msg.textContent = texto;

  const antigas = pertoDoElemento.parentElement.querySelectorAll(".msg");
  antigas.forEach(el => el.remove());

  pertoDoElemento.parentElement.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = 0;
    msg.style.transform = "translateY(-10px)";
    setTimeout(() => msg.remove(), 500);
  }, 3000);
}

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
mostrarMensagem(btnSalvarMov, "Preencha todos os campos corretamente!", "erro");
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
if (usuarioLogado.meta > 0) {
  const progresso = Math.min((usuarioLogado.saldo / usuarioLogado.meta) * 100, 100);

  if (!metaValorEl.querySelector(".progresso-barra")) {
    metaValorEl.innerHTML = `
      <p>0% da meta</p>
      <div class="progresso-barra"><div class="preenchimento"></div></div>
    `;
  }

  const preenchimento = metaValorEl.querySelector(".preenchimento");
  const p = metaValorEl.querySelector("p");
  preenchimento.style.width = `${progresso}%`;

  if (progresso >= 100) {
    metaValorEl.innerHTML = `
      <p class="meta-atingida"> Meta atingida! </p>
      <div class="progresso-barra"><div class="preenchimento" style="width:100%"></div></div>
    `;
  } else {
    p.textContent = `${progresso.toFixed(1)}% da meta`;
  }
} else {
  metaValorEl.innerHTML = `
    <p>Faça sua meta!</p>
    <div class="progresso-barra"><div class="preenchimento"></div></div>
  `;
}



  // cardsContainer.innerHTML = "";
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
      // cardsContainer.appendChild(card);
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

  const tabelaCorpo = document.getElementById("tabelaCorpo");
tabelaCorpo.innerHTML = "";
usuarioLogado.movimentacoes
  .sort((a, b) => new Date(b.data) - new Date(a.data))
  .forEach(m => {
    const tr = document.createElement("tr");
    const data = new Date(m.data);
    const dia = data.toLocaleDateString("pt-BR");
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    tr.innerHTML = `
      <td>${dia}</td>
      <td>${hora}</td>
      <td>${m.descricao}</td>
      <td class="${m.tipo}">${m.tipo === 'entrada' ? 'Entrada' :
                             m.tipo === 'saida' ? 'Saída' : 'Renda Extra'}</td>
      <td class="${m.tipo}">R$ ${m.valor.toFixed(2).replace('.', ',')}</td>
    `;
    tabelaCorpo.appendChild(tr);
  });

  graficoLinha.update();

  graficoPizza.data.datasets[0].data = [totalEntrada, totalSaida, usuarioLogado.movimentacoes
    .filter(m => m.tipo === 'rendaExtra')
    .reduce((acc, cur) => acc + cur.valor, 0)];
  graficoPizza.update();

  
}

btnSalvarMeta.addEventListener("click", () => {
  const valor = parseFloat(inputValorMeta.value);
  if (isNaN(valor) || valor <= 0) {
    mostrarMensagem(btnSalvarMeta, "Informe um valor válido para a meta!");
    return;
  }

  usuarioLogado.meta = valor;
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios = usuarios.map(u => (u.email === usuarioLogado.email ? usuarioLogado : u));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

mostrarMensagem(btnSalvarMeta, "Meta salva com sucesso!", "sucesso");
  inputValorMeta.value = "";
  atualizarDashboard();
});


function mostrarSecao(secAtiva, btnAtivo, secInativa, btnInativo) {
  secAtiva.classList.add("ativo");
  secInativa.classList.remove("ativo");
  btnAtivo.classList.add("ativo");
  btnInativo.classList.remove("ativo");
}

function mostrarApenas(secao) {
  [secDashboard, secTransacoes, secMetas].forEach(s => s.classList.remove("ativo"));
  secao.classList.add("ativo");
}

function ativarBotao(botao) {
  [btnDashboard, btnTransacoes, btnMetas].forEach(b => b.classList.remove("ativo"));
  botao.classList.add("ativo");
}

btnDashboard.addEventListener("click", () => {
  mostrarApenas(secDashboard);
  ativarBotao(btnDashboard);
});

btnTransacoes.addEventListener("click", () => {
  mostrarApenas(secTransacoes);
  ativarBotao(btnTransacoes);
});

btnMetas.addEventListener("click", () => {
  mostrarApenas(secMetas);
  ativarBotao(btnMetas);
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "cadastro.html";
});

atualizarDashboard();
