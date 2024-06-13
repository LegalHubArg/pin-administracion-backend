// CONTROLADOR DE ORGANISMOS
// Funciones de Organismos
const { traerJerarquia,
  traerJerarquiaPorId,
  crearJerarquia,
  borrarJerarquiaPorId,
  traerReparticionesBO,
  traerReparticionPorId,
  crearReparticion,
  borrarReparticionPorId } = require('./organismosFunctions')

///////////////////// JERARQUIA \\\\\\\\\\\\\\\\\\\\\\\\
async function traerJerarquiaController(req, res, next) {
  try {
    let request = req.query.hasOwnProperty('paginaActual') && req.query.hasOwnProperty('limite') ?
      { paginaActual: req.query.paginaActual, limite: req.query.limite }
      : undefined;

    let { data, total } = await traerJerarquia(request)

    let totalPaginas = request && total ? Math.ceil(total / request.limite) : 1;

    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ mensaje: 'PIN: Jerarquía GCBA.', data, totalPaginas }))

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Jerarquía.", data: String(e) }))
  }
}
async function traerReparticionesBOController(req, res, next) {
  try {
    let request = {};
    request.limite = req.query?.limite;
    request.paginaActual = req.query?.paginaActual

    const data = await traerReparticionesBO(request)
    const totalReparticiones = data.totalReparticiones
    const totalPaginas = Math.ceil(totalReparticiones / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Reparticiones: `, data: data.reparticiones, totalReparticiones, totalPaginas }))
    res.end();
    return;

  }
  catch (er) {
    console.log(er)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(er) }))
    res.end();
    return;

  }
}

async function traerJerarquiaPorIdController(req, res, next) {
  try {
    let request = {};
    request.idOrgJerarquia = req.body.idOrgJerarquia;

    let respuesta = await traerJerarquiaPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Jerarquia.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Repartición Jerarquía.', data: respuesta }))
    res.end();
    return;

  }
  catch (er) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Jerarquía.", data: String(e) }))
    res.end();
    return;

  }
}

async function traerReparticionPorIdController(req, res, next) {
  try {
    let request = {};
    request.idReparticion = req.body.idReparticion;

    let respuesta = await traerReparticionPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Repartición.', data: respuesta }))
    res.end();
    return;

  }
  catch (er) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(e) }))
    res.end();
    return;

  }
}

async function crearJerarquiaController(req, res, next) {
  try {
    let request = {};
    request.idReparticionHijo = req.body.idReparticionHijo;
    request.idReparticionPadre = req.body.idReparticionPadre;
    request.aplicaBO = req.body.aplicaBO;
    request.aplicaSDIN = req.body.aplicaSDIN;
    request.aplicaDJ = req.body.aplicaDJ;

    let respuesta = await crearJerarquia(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Jerarquía creada con éxito.', data: request }))
    res.end();
    return;

  }
  catch (er) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(e) }))
    res.end();
    return;

  }
}
async function crearReparticionController(req, res, next) {
  try {
    let request = {};
        request.reparticion = req.body.reparticion;
    request.siglaReparticion = req.body.siglaReparticion;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await crearReparticion(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Repartición creada con éxito.', data: request }))
    res.end();
    return;

  }
  catch (e) {
    console.log("error: ", e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones.", data: String(e) }))
    res.end();
    return;

  }
}
async function borrarJerarquiaPorIdController(req, res, next) {
  try {
    let request = {};
    request.idOrgJerarquia = req.body.idOrgJerarquia;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarJerarquiaPorId(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al borrar jerarquia.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Jerarquía borrada con éxito.', data: respuesta }))
    res.end();
    return;

  }
  catch (er) {
    console.log(er)
    res.status(409)
    res.send(er)
    res.end();
    return;

  }
}
async function borrarReparticionPorIdController(req, res, next) {
  try {
    let request = {};
    request.idReparticion = req.body.idReparticion;
    request.idUsuario = req.body.idUsuario;

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarReparticionPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al borrar repartición.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: "PIN: Repartición borrada con éxito.", data: respuesta }))
    res.end();
    return;

  }
  catch (er) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar jerarquia.", data: String(er) }))
    res.end();
    return;

  }
}
module.exports = {
  traerJerarquiaController,
  traerReparticionesBOController,
  traerJerarquiaPorIdController,
  crearJerarquiaController,
  borrarJerarquiaPorIdController,
  traerReparticionPorIdController,
  crearReparticionController,
  borrarReparticionPorIdController
}