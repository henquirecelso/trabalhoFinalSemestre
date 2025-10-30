const gastosPersonalizados = [];

document.getElementById("adicionarGasto").addEventListener("click", () => {
  const nome = document.getElementById("nomeGasto").value.trim();
  const valor = parseFloat(document.getElementById("valorGasto").value);

  if (!nome || isNaN(valor) || valor <= 0) {
    alert("⚠️ Digite um nome e valor válidos para o gasto.");
    return;
  }

  // Adiciona ao array
  gastosPersonalizados.push({ nome, valor });

  // Atualiza a lista visual
  const container = document.getElementById("gastosPersonalizadosContainer");
  const item = document.createElement("div");
  item.textContent = `${nome}: R$ ${valor.toFixed(2)}`;
  container.appendChild(item);

  document.getElementById("nomeGasto").value = "";
  document.getElementById("valorGasto").value = "";
});

document.getElementById("calcular").addEventListener("click", () => {
  const salario = parseFloat(document.getElementById("salario").value) || 0;
  const luz = parseFloat(document.getElementById("luz").value) || 0;
  const alimentacao =
    parseFloat(document.getElementById("alimentacao").value) || 0;
  const agua = parseFloat(document.getElementById("agua").value) || 0;
  const transporte =
    parseFloat(document.getElementById("transporte").value) || 0;

  if (salario === 0) {
    alert("⚠️ Digite seu salário para calcular.");
    return;
  }

  // Soma os gastos fixos
  const totalGastosFixos = luz + alimentacao + agua + transporte;

  // Soma os gastos personalizados
  const totalGastosPersonalizados = gastosPersonalizados.reduce(
    (acc, gasto) => acc + gasto.valor,
    0
  );

  const totalGastos = totalGastosFixos + totalGastosPersonalizados;
  const saldo = salario - totalGastos;

  localStorage.setItem(
    "dadosFinanceiros",
    JSON.stringify({
      salario,
      luz,
      alimentacao,
      agua,
      transporte,
      gastosPersonalizados,
      saldo,
    })
  );

  window.location.href = "resultado.html";
});
