app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/menu', auth, (req, res) => {
  const ultimo = req.cookies.ultimoAcesso || 'Primeiro acesso';
  res.send(`
    <h2>Menu</h2>
    <p>Último acesso: ${ultimo}</p>
    <a href="/livros">Cadastrar Livro</a><br>
    <a href="/leitores">Cadastrar Leitor</a><br>
    <a href="/logout">Sair</a>
  `);
});

app.get('/livros', auth, (req, res) => {
  res.send(`
    <h2>Novo Livro</h2>
    <form method="POST">
      <input name="titulo" placeholder="Título" required />
      <input name="autor" placeholder="Autor" required />
      <input name="isbn" placeholder="ISBN" required />
      <button>Salvar</button>
    </form>
    <h3>Lista</h3>
    ${livros.map(l => `<p>${l.titulo} - ${l.autor}</p>`).join('')}
    <a href="/menu">Voltar</a>
  `);
});
app.post('/livros', auth, (req, res) => {
  const { titulo, autor, isbn } = req.body;
  if (!titulo || !autor || !isbn) {
    return res.send('Preencha todos os campos');
  }
  livros.push({ titulo, autor, isbn });
  res.redirect('/livros');
});

app.get('/leitores', auth, (req, res) => {
  const options = livros.map(l => `<option value="${l.titulo}">${l.titulo}</option>`).join('');
  res.send(`
    <h2>Novo Leitor</h2>
    <form method="POST">
      <input name="nome" placeholder="Nome" required />
      <input name="cpf" placeholder="CPF" required />
      <input name="tel" placeholder="Telefone" required />
      <input name="dataEmp" type="date" required />
      <input name="dataDev" type="date" required />
      <select name="livro" required>
        ${options}
      </select>
      <button>Salvar</button>
    </form>
    <h3>Lista</h3>
    ${leitores.map(l => `<p>${l.nome} - ${l.livro}</p>`).join('')}
    <a href="/menu">Voltar</a>
  `);
});
app.post('/leitores', auth, (req, res) => {
  const { nome, cpf, tel, dataEmp, dataDev, livro } = req.body;
  if (!nome || !cpf || !tel || !dataEmp || !dataDev || !livro) {
    return res.send('Preencha todos os campos');
  }
  leitores.push({ nome, cpf, tel, dataEmp, dataDev, livro });
  res.redirect('/leitores');
});
module.exports = app;