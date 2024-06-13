const axios = require('axios');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../../helpers/generateToken')
const secret = process.env.SECRET_STRING;

//Funciones
const { tokenSign } = require('../../helpers/generateToken')
const { getUsuario } = require('../usuarios/usuariosFunctions');
const { getPerfilesUsuario, traerReparticionesUsuario } = require('../usuarios/usuariosFunctions');
const { traerPerfilesCuenta } = require('../../models/BO/cuentas');

async function loginController(req, res, next) {

  const usuario = req.usuario;
  let err = null;

  // token
  const tokenSession = await tokenSign(usuario)

  let perfiles = {};
  if (usuario.cuenta) {
    perfiles = await traerPerfilesCuenta(usuario.cuenta)
  }
  else {
    perfiles = await getPerfilesUsuario(req.usuario)
  }

  /*
    let reparticiones = {}
  
     await traerReparticionesUsuario(request)
      .then((response) => {
        // console.log(response)
        if(response.lenght === 0)
        {
          
        }
        else
        {
          reparticiones = JSON.parse(response[0].usuarioReparticiones)
        }
      })
      .catch((e) => {
        error = e;
      });
    if (err !== null) {
      responses.INTERNAL_SERVER_ERROR(res);
      return;
    } */

  res.status(200)
  res.send({
    status: 'ok',
    mensaje: 'PIN: Bienvenido!',
    cuit: usuario.usuario,
    idUsuarioBO: usuario.idUsuarioBO,
    nombre: usuario.apellidoNombre,
    tokenSession,
    perfiles
  })
  //res.status(200)
  //res.send(JSON.stringify({ mensaje: 'PIN: Bienvenido.', data : request }))
  res.end();
  return;
}

// async function loginController(req, res, next) {

//   let request = []
//   let result = {};
//   let err = null;

//   request.usuario = req.body.usuario;

//   await getPerfilUsuario(request)
//     .then((response) => {
//       request.idPerfil = response[0].idPerfil
//     })
//     .catch((e) => {
//       error = e;
//     });
//   await getPerfilVistas(request)
//     .then((response) => {
//       result.vistas = response
//     })
//     .catch((e) => {
//       error = e;
//     });

//   //metadatos del usuario
//   await getUsuario(request)
//     .then((response) => {
//       result.usuario = response
//     })
//     .catch((e) => {
//       error = e;
//     });

//   if (err !== null) {
//     responses.INTERNAL_SERVER_ERROR(res);
//     return;
//   }

//   res.status(200).send(result);
//   return;

// }
async function logoutController(req, res, next) {

  let request = []
  let result = {};
  let err = null;

  request.usuario = req.body.usuario;

  await getPerfilUsuario(request)
    .then((response) => {
      request.idPerfil = response[0].idPerfil
    })
    .catch((e) => {
      error = e;
    });
  await getPerfilVistas(request)
    .then((response) => {
      result.vistas = response
    })
    .catch((e) => {
      error = e;
    });

  //metadatos del usuario
  await getUsuario(request)
    .then((response) => {
      result.usuario = response
    })
    .catch((e) => {
      error = e;
    });

  if (err !== null) {
    responses.INTERNAL_SERVER_ERROR(res);
    return;
  }

  res.status(200).send(result);
  return;

}


async function captchaController(req, res, next) {


  const {
    captchaToken
  } = req.body;

  // console.log(req.body)

  try {
    // Call Google's API to get score
    const resp = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_CAPTCHA}&response=${captchaToken}`
    );

    res.status(200).send(resp.data);

  }
  catch {
    res.status(500).send('ERROR - SOS ROBOT PA');
  }

}


async function esUsuarioFirma(req, res) {
  try {
    const token = req.headers.authorization.split(' ').pop()
    const tokenData = await verifyToken(token);
    if (tokenData._usuario == process.env.FIRMA_USUARIO_CUIT) {
      res.status(200).send({ mensaje: "Usuario autorizado para firmar.", data: tokenData._usuario })
    } else {
      throw tokenData
    }
  }
  catch (e) {
    console.log(e)
    res.status(409).send({ mensaje: "Usuario NO autorizado para firmar.", data: {} })
  }
}



module.exports = { loginController, captchaController, esUsuarioFirma }

