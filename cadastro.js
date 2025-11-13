// cadastro.js
const loginTab = document.getElementById("loginTab");
const cadastroTab = document.getElementById("cadastroTab");
const loginForm = document.getElementById("loginForm");
const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

// Troca entre abas
loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  cadastroTab.classList.remove("active");
  loginForm.classList.add("ativo");
  cadastroForm.classList.remove("ativo");
});

cadastroTab.addEventListener("click", () => {
  cadastroTab.classList.add("active");
  loginTab.classList.remove("active");
  cadastroForm.classList.add("ativo");
  loginForm.classList.remove("ativo");
});

// Cadastrar novo usuário
document.getElementById("cadastrar").addEventListener("click", () => {
  const usuario = document.getElementById("novoUsuario").value.trim();
  const senha = document.getElementById("novaSenha").value.trim();

  if (!usuario || !senha) {
    mostrarMensagem("⚠️ Preencha todos os campos.", "erro");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.find((u) => u.usuario === usuario)) {
    mostrarMensagem("❌ Usuário já existe!", "erro");
    return;
  }

usuarios.push({
  usuario,
  senha,
  saldo: 0, // saldo inicial
  movimentacoes: [] // lista de entradas/saídas
});
localStorage.setItem("usuarios", JSON.stringify(usuarios));

mostrarMensagem("✅ Cadastro realizado com sucesso!");

// Limpa os campos
document.getElementById("novoUsuario").value = "";
document.getElementById("novaSenha").value = "";

// Após 1,5s, volta automaticamente para o login
setTimeout(() => {
  cadastroTab.classList.remove("active");
  loginTab.classList.add("active");
  cadastroForm.classList.remove("ativo");
  loginForm.classList.add("ativo");
}, 1500);

});

// Fazer login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuarioLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value.trim();

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const encontrado = usuarios.find(
    (u) => u.usuario === usuario && u.senha === senha
  );

  if (encontrado) { 
    //  Salva nome do usuário logado
    localStorage.setItem("usuarioLogado", JSON.stringify(encontrado));

    mostrarMensagem("✅ Login bem-sucedido! Redirecionando...", "sucesso");
    setTimeout(() => {
      window.location.href = "index.html"; // Redireciona ao painel principal
    }, 1000);
  } else {
    mostrarMensagem("❌ Usuário ou senha incorretos.", "erro");
  }
});

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  mensagem.style.display = "block";
  setTimeout(() => {
    mensagem.style.display = "none";
  }, 3000);
}
