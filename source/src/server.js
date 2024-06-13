require('dotenv').config() //<-- prod.
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require('morgan');
const app = express();
const helmet = require("helmet");

const apiversion = '/api/' + process.env.API_VERSION;

const auth = require('./routes/auth/auth-rutas');
const boletinOficial = require('./routes/BO/boletin-oficial-rutas');
const usuariosPIN = require('./routes/usuarios/usuarios-rutas');
const organismos = require('./routes/organismos/organismos-rutas')
const sdin = require('./routes/SDIN/sdin-rutas')
const dj = require('./routes/DJ/dj-rutas')

const whitelist = process.env.API_WHITELIST.split(',')
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
      console.log("CORS OK FROM: ", origin);
    } else {
      callback(new Error("Not allowed by CORS from " + origin))
    }
  },
  credentials: true,
}


app.use(cors(corsOptions));
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(
  helmet.frameguard({
    action: "sameorigin",
  })
);
//app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: process.env.API_LIMIT }));
app.use(bodyParser.urlencoded({ limit: process.env.API_LIMIT, extended: false }));
app.use(cookieParser());

//HEALTH
async function pinrun(req, res) {
  res.status(200)
  res.send(JSON.stringify({ status: 'OK' }))
  res.end();
}
app.get(apiversion +'/pin-run', pinrun);
//Rutas
app.use(apiversion + '/auth', auth);
app.use(apiversion + '/boletin-oficial', boletinOficial);
app.use(apiversion + '/usuarios', usuariosPIN);
app.use(apiversion + '/organismos', organismos);
app.use(apiversion + '/sdin', sdin);
app.use(apiversion + '/dj', dj);

app.use('*', (req, res) => {
  res.status(404)
  //res.send(JSON.stringify({ mensaje: 'PIN: Ruta inválida.', error: 'Petición no permitida.' }))
  res.end();
});


module.exports = app;