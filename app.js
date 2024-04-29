const express = require('express');
const session = require('express-session');
const http = require('http');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const connection = require('./database.js');

function generateSecretKey(length) {
  return crypto.randomBytes(length).toString('hex');
}

// Générer une clé secrète de 32 caractères (256 bits)
const secretKey = generateSecretKey(16);
console.log('Clé secrète générée : ', secretKey);

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const index = require('./routes/index.js');
const contacter = require('./routes/contacter.js')
const ajoutAffiche = require('./routes/ajoutAffiche.js')
const affiche = require('./routes/affiche.js')
const poste = require('./routes/poste.js')
const mairie = require('./routes/mairie.js')
const info_utiles = require('./routes/info_utiles.js')
const associations = require('./routes/associations.js')
const connexion = require('./routes/connexion.js')

app.use(index);
app.use(contacter);
app.use(ajoutAffiche);
app.use(affiche);
app.use(poste);
app.use(mairie);
app.use(info_utiles);
app.use(associations);
app.use(connexion);

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
