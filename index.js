var express = require('express')
var app = express()
const path = require('path')
var bodyParser = require('body-parser')
app.use(express.static(__dirname + '/public'));


const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
 
const adapter = new FileSync('db.json')
const db = low(adapter)

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/', function (req, res) {
  // post cadastrarse
  var id = req.body.lojaid
  var cel = req.body.cel

  let clienteCadastrado = db.get('users').find({ celular: cel }).value()

  if ( clienteCadastrado == undefined ) {
    db.get('precadastro')
    .push(
      {
        nome: "precadastro",
        celular: cel,
        cadastro: [parseInt(id)]
      })
    .last()
    .write()

    res.redirect('/criarconta/' + id + '/' + cel)
  } else {
    // add id da loja no campo cadastro do cliente
    let cadastro = db.get('users').find({ celular: cel }).get('cadastro').value()
    let checkIsAlready = cadastro.includes(parseInt(id))
    if (!checkIsAlready) {
      // se o cliente já está cadastrado atualiza o cadastro do mesmo inserindo o id da loja passado na url
      cadastro.push(parseFloat(id))
      function save() {
        db.get('users')
        .find({ celular: cel })
        .assign({ cadastro })
        .write()
        res.redirect('/sucesso')
      }
      save()

    } else {
      // se o cliente já está cadastrado vai para tela de sucesso
      res.redirect('/sucesso')
    }
  }
})

app.get('/criarconta', function (req, res) {
  let cpf
  let id
  res.render('criarconta.ejs', {id: id, cpf: cpf})
})

app.get('/criarconta/:cpf', function (req, res) {
  // carrega o criar conta com o parametro de cpf no devido campo
  let cpf = req.params.cpf
  let id
  res.render('criarconta.ejs', {id: id, cpf: cpf})
})

app.get('/criarconta/:id/:cpf', function (req, res) {
  // carrega o criar conta com o parametro de cpf no devido campo
  var id = req.params.id
  let cpf = req.params.cpf
  res.render('criarconta.ejs', {id: id, cpf: cpf})
})


app.post('/criarconta', function (req, res) {
  let nome = req.body.name;
  let phone = req.body.phone;
  let email = req.body.email;
  let birthday = req.body.birthday;
  let endereco = req.body.endereco;
  let cpf = req.body.cpf;
  let id = req.body.id;

  db.get('users')
  .push(
    {
      nome: nome,
      celular: phone,
      email: email,
      data_nascimento: birthday,
      endereco: endereco,
      cpf: cpf,
      cadastro: [parseInt(id)]
    })
  .last()
  .write()

  res.redirect('/sucesso')

})

app.get('/minhaconta', function (req, res) {
  res.render('minhaconta.ejs')
})

app.get('/sucesso', function (req, res) {
  res.render('sucesso.ejs')
})

app.get('/', function (req, res) {
  res.render('intro.ejs')
})

app.get('/:id', function (req, res) {
  var id = req.params.id;
  res.render('cadastrese.ejs', {id})
})

app.get('/:id/:nome/:senha', function (req, res) {

  let id = req.params.id;
  let nome = req.params.nome;
  let senha = req.params.senha;

  let verificaLoja = db.get('lojas').find({ id: id }).value()
  if (verificaLoja == undefined) {
    db.get('lojas')
    .push(
      {
        id: id,
        nome: nome,
        senha: senha
      })
    .last()
    .write()
    
    res.redirect('/sucesso-loja/'+id+'/'+nome+'/'+senha)
  } else {
    res.redirect('/')
  }
  
  
})

app.get('/sucesso-loja/:id/:nome/:senha', function (req, res) {
  let id = req.params.id;
  let nome = req.params.nome;
  let senha = req.params.senha;
  res.render('sucesso-loja.ejs', {id: id, nome: nome, senha: senha})
})


app.get('/:id/list', function (req, res) {
  let idLoja = req.params.id
  let clientesCadastrados = db.get('users').filter({ cadastro: [ parseInt(idLoja) ] }).value()
  let clientesPreCadastrados = db.get('precadastro').filter({ cadastro: [ parseInt(idLoja) ] }).value()
  clientesCadastrados.push(...clientesPreCadastrados)
  console.log(clientesCadastrados)
  let dataLoja = db.get('lojas').find({ id: idLoja }).value()
  res.render('list.ejs', {clientesCadastrados: clientesCadastrados, clientesPreCadastrados: clientesPreCadastrados, dataLoja: dataLoja})
})

app.set('views', path.join(__dirname, 'view'))
app.use(express.static(__dirname + '/public'))

// levanta o servidor
app.listen(process.env.PORT || 4000, function(){
  console.log('it is running')
})
