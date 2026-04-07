const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

const livros = [];
const leitores = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'biblioteca-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

function auth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/');
}

app.get('/', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method="POST" action="/login">
      <input name="usuario" placeholder="Usuário" required />
      <input name="senha" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).send('Preencha usuário e senha');
  }

  req.session.usuario = usuario;
  res.cookie('ultimoAcesso', new Date().toLocaleString('pt-BR'), {
    httpOnly: true,
    sameSite: 'lax'
  });

  return res.redirect('/menu');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.get('/menu', auth, (req, res) => {
  const ultimo = req.cookies.ultimoAcesso || 'Primeiro acesso';
  res.send(`
    <h2>Menu</h2>
    <p>Bem-vindo, ${req.session.usuario}</p>
    <p>Último acesso: ${ultimo}</p>
    <a href="/livros">Cadastrar Livro</a><br>
    <a href="/leitores">Cadastrar Leitor</a><br>
    <a href="/logout">Sair</a>
  `);
});

app.get('/livros', auth, (req, res) => {
  res.send(`
    <h2>Novo Livro</h2>
    <form method="POST" action="/livros">
      <input name="titulo" placeholder="Título" required />
      <input name="autor" placeholder="Autor" required />
      <input name="isbn" placeholder="ISBN" required />
      <button type="submit">Salvar</button>
    </form>
    <h3>Lista</h3>
    ${livros.length ? livros.map(l => `<p>${l.titulo} - ${l.autor} (${l.isbn})</p>`).join('') : '<p>Nenhum livro cadastrado.</p>'}
    <a href="/menu">Voltar</a>
  `);
});

app.post('/livros', auth, (req, res) => {
  const { titulo, autor, isbn } = req.body;

  if (!titulo || !autor || !isbn) {
    return res.status(400).send('Preencha todos os campos');
  }

  livros.push({ titulo, autor, isbn });
  return res.redirect('/livros');
});

app.get('/leitores', auth, (req, res) => {
  const options = livros.map(l => `<option value="${l.titulo}">${l.titulo}</option>`).join('');

  res.send(`
    <h2>Novo Leitor</h2>
    <form method="POST" action="/leitores">
      <input name="nome" placeholder="Nome" required />
      <input name="cpf" placeholder="CPF" required />
      <input name="tel" placeholder="Telefone" required />
      <input name="dataEmp" type="date" required />
      <input name="dataDev" type="date" required />
      <select name="livro" required>
        <option value="">Selecione um livro</option>
        ${options}
      </select>
      <button type="submit">Salvar</button>
    </form>
    <h3>Lista</h3>
    ${leitores.length ? leitores.map(l => `<p>${l.nome} - ${l.livro}</p>`).join('') : '<p>Nenhum leitor cadastrado.</p>'}
    <a href="/menu">Voltar</a>
  `);
});

app.post('/leitores', auth, (req, res) => {
  const { nome, cpf, tel, dataEmp, dataDev, livro } = req.body;

  if (!nome || !cpf || !tel || !dataEmp || !dataDev || !livro) {
    return res.status(400).send('Preencha todos os campos');
  }

  leitores.push({ nome, cpf, tel, dataEmp, dataDev, livro });
  return res.redirect('/leitores');
});

module.exports = app;
