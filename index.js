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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function auth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/');
}

function renderPage({ title, content, user = null }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 45%, #6dd5ed 100%);
      font-family: Arial, Helvetica, sans-serif;
    }
    .glass-card {
      border: 0;
      border-radius: 22px;
      background: rgba(255,255,255,0.96);
      box-shadow: 0 18px 45px rgba(0,0,0,0.18);
      overflow: hidden;
    }
    .hero {
      background: linear-gradient(135deg, #0d6efd, #6610f2);
      color: #fff;
      padding: 28px;
    }
    .form-control, .form-select {
      border-radius: 12px;
      padding: 12px 14px;
    }
    .btn {
      border-radius: 12px;
      padding: 10px 18px;
      font-weight: 600;
    }
    .table thead th {
      background: #0d6efd;
      color: #fff;
      border: none;
    }
    .table tbody tr:hover {
      background: #f5f9ff;
    }
    .menu-link {
      text-decoration: none;
      display: block;
      padding: 16px 18px;
      border-radius: 16px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      color: #212529;
      transition: .2s ease;
      height: 100%;
    }
    .menu-link:hover {
      transform: translateY(-2px);
      background: #eef4ff;
      border-color: #bfd3ff;
      color: #0d6efd;
    }
    .badge-soft {
      background: #e7f1ff;
      color: #0d6efd;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container py-5">
    <div class="glass-card">
      <div class="hero d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="h3 mb-2">${escapeHtml(title)}</h1>
          <p class="mb-0 opacity-75">Sistema de Biblioteca com visual melhorado para Vercel.</p>
        </div>
        ${user ? `<div class="text-md-end">
          <div class="badge-soft">Usuário: ${escapeHtml(user)}</div>
        </div>` : ''}
      </div>
      <div class="p-4 p-md-5">
        ${content}
      </div>
    </div>
  </div>
</body>
</html>`;
}

app.get('/', (req, res) => {
  res.send(
    renderPage({
      title: 'Login da Biblioteca',
      content: `
        <div class="row justify-content-center">
          <div class="col-lg-6">
            <div class="text-center mb-4">
              <h2 class="fw-bold">Bem-vindo</h2>
              <p class="text-muted mb-0">Entre com qualquer usuário e senha para acessar o sistema.</p>
            </div>
            <form method="POST" action="/login" class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Usuário</label>
                <input name="usuario" class="form-control" placeholder="Digite seu usuário" required />
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Senha</label>
                <input name="senha" type="password" class="form-control" placeholder="Digite sua senha" required />
              </div>
              <div class="col-12 d-grid">
                <button type="submit" class="btn btn-primary btn-lg">Entrar no sistema</button>
              </div>
            </form>
          </div>
        </div>
      `
    })
  );
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
  res.send(
    renderPage({
      title: 'Painel principal',
      user: req.session.usuario,
      content: `
        <div class="mb-4">
          <p class="mb-2"><strong>Bem-vindo, ${escapeHtml(req.session.usuario)}</strong></p>
          <p class="text-muted mb-0">Último acesso: ${escapeHtml(ultimo)}</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6">
            <a class="menu-link" href="/livros">
              <h3 class="h5 mb-2">📚 Cadastrar livros</h3>
              <p class="mb-0 text-muted">Adicione novos livros e visualize a lista cadastrada.</p>
            </a>
          </div>
          <div class="col-md-6">
            <a class="menu-link" href="/leitores">
              <h3 class="h5 mb-2">👤 Cadastrar leitores</h3>
              <p class="mb-0 text-muted">Registre leitores e vincule empréstimos aos livros.</p>
            </a>
          </div>
        </div>

        <div class="mt-4">
          <a href="/logout" class="btn btn-outline-danger">Sair</a>
        </div>
      `
    })
  );
});

app.get('/livros', auth, (req, res) => {
  const linhasLivros = livros.length
    ? livros
        .map(
          (l, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${escapeHtml(l.titulo)}</td>
              <td>${escapeHtml(l.autor)}</td>
              <td>${escapeHtml(l.isbn)}</td>
            </tr>
          `
        )
        .join('')
    : `<tr><td colspan="4" class="text-center text-muted py-4">Nenhum livro cadastrado.</td></tr>`;

  res.send(
    renderPage({
      title: 'Cadastro de livros',
      user: req.session.usuario,
      content: `
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h2 class="h4 mb-3">Novo livro</h2>
                <form method="POST" action="/livros" class="row g-3">
                  <div class="col-12">
                    <label class="form-label fw-semibold">Título</label>
                    <input name="titulo" class="form-control" placeholder="Ex: Dom Casmurro" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Autor</label>
                    <input name="autor" class="form-control" placeholder="Ex: Machado de Assis" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">ISBN</label>
                    <input name="isbn" class="form-control" placeholder="Ex: 978-00-000000-0" required />
                  </div>
                  <div class="col-12 d-grid">
                    <button type="submit" class="btn btn-primary">Salvar livro</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="h4 mb-0">Lista de livros</h2>
                  <span class="badge text-bg-primary">${livros.length} cadastrados</span>
                </div>
                <div class="table-responsive">
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>ISBN</th>
                      </tr>
                    </thead>
                    <tbody>${linhasLivros}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <a href="/menu" class="btn btn-outline-secondary">Voltar ao menu</a>
          <a href="/logout" class="btn btn-outline-danger">Sair</a>
        </div>
      `
    })
  );
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
  const options = livros
    .map(l => `<option value="${escapeHtml(l.titulo)}">${escapeHtml(l.titulo)}</option>`)
    .join('');

  const linhasLeitores = leitores.length
    ? leitores
        .map(
          (l, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${escapeHtml(l.nome)}</td>
              <td>${escapeHtml(l.cpf)}</td>
              <td>${escapeHtml(l.tel)}</td>
              <td>${escapeHtml(l.dataEmp)}</td>
              <td>${escapeHtml(l.dataDev)}</td>
              <td>${escapeHtml(l.livro)}</td>
            </tr>
          `
        )
        .join('')
    : `<tr><td colspan="7" class="text-center text-muted py-4">Nenhum leitor cadastrado.</td></tr>`;

  res.send(
    renderPage({
      title: 'Cadastro de leitores',
      user: req.session.usuario,
      content: `
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h2 class="h4 mb-3">Novo leitor</h2>
                <form method="POST" action="/leitores" class="row g-3">
                  <div class="col-12">
                    <label class="form-label fw-semibold">Nome</label>
                    <input name="nome" class="form-control" placeholder="Nome completo" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">CPF</label>
                    <input name="cpf" class="form-control" placeholder="000.000.000-00" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Telefone</label>
                    <input name="tel" class="form-control" placeholder="(00) 00000-0000" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Data de empréstimo</label>
                    <input name="dataEmp" type="date" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Data de devolução</label>
                    <input name="dataDev" type="date" class="form-control" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">Livro</label>
                    <select name="livro" class="form-select" required>
                      <option value="">Selecione um livro</option>
                      ${options}
                    </select>
                    ${livros.length === 0 ? '<div class="form-text text-danger">Cadastre pelo menos um livro antes de cadastrar leitores.</div>' : ''}
                  </div>
                  <div class="col-12 d-grid">
                    <button type="submit" class="btn btn-success" ${livros.length === 0 ? 'disabled' : ''}>Salvar leitor</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="h4 mb-0">Lista de leitores</h2>
                  <span class="badge text-bg-success">${leitores.length} cadastrados</span>
                </div>
                <div class="table-responsive">
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Empréstimo</th>
                        <th>Devolução</th>
                        <th>Livro</th>
                      </tr>
                    </thead>
                    <tbody>${linhasLeitores}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <a href="/menu" class="btn btn-outline-secondary">Voltar ao menu</a>
          <a href="/logout" class="btn btn-outline-danger">Sair</a>
        </div>
      `
    })
  );
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
