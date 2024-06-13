const express = require('express');
const router = express.Router();

//Middlewares
const { checkUsuarioPIN } = require('../../middleware/usuarios/checkUsuarioPIN');
const { checkUsuarioAD, checkAuth, checkRecaptcha } = require('../../middleware/auth/authMW');

//Controllers
const { loginController, captchaController, tokenController, esUsuarioFirma } = require('../../controllers/auth/auth');

//////////////////// AUTH \\\\\\\\\\\\\\\\\\\\\
//Rutas de Auth
router.post('/login', checkUsuarioAD, checkRecaptcha, checkUsuarioPIN, loginController);
router.post('/login-api', checkUsuarioAD, checkUsuarioPIN, loginController);
router.post('/norobot', captchaController);
router.get('/checkToken', checkAuth, function (req, res, next) {
  res.status(200);
  res.send(JSON.parse('{ "status":"ok", "mensaje": "PIN: Autentificación exitosa"}'))
});
router.post('/logout', function (req, res, next) {

});

router.get('/usuario-firma', checkAuth, esUsuarioFirma)

router.get('/extensiones', checkAuth, (req, res) => {
  if (process.env.API_EXTENSIONES) {
    res.status(200).send({ data: process.env.API_EXTENSIONES })
  }
  else {
    res.status(400).send({ data: "Error" })
  }
})
router.get('/limiteArchivo', checkAuth, (req, res) => {
  if (process.env.API_LIMIT) {
    const numeroExtraido = parseInt(process.env.API_LIMIT.match(/\d+/)[0], 10);
    const bytes = numeroExtraido * 1048576;//Equivalencia de 1MB a bytes
    res.status(200).send({ data: bytes })
  }
  else {
    res.status(409).send({ data: "Error" })
  }
})
router.get('/checkCaptcha', (req, res) => {
  try {
    let respuesta = (process.env.VALIDAR_CAPTCHA === 'true') ? true : false;
    res.status(200).send(respuesta)
  }
  catch (e) {
    res.status(409).send({ data: "Error" })
  }
})


module.exports = router;