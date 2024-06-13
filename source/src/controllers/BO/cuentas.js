const { traerCuentas,crearCuenta , traerCuentaPorId, traerUsuariosPorIdCuenta, traerPerfilesCuenta, traerPermisosCuenta,
  traerUsuariosBO, crearUsuarioBO, borrarUsuarioBO, editarUsuarioBO, deshacerEliminarCuenta, borrarCuentaBO } = require('../../models/BO/cuentas')

//Usuarios de Boletín Oficial
//---------------------------
//En Boletín Oficial, la estructura de usuarios es distinta a Normativa y Digesto
//Acá los cuits se utilizan únicamente para ingresar a la plataforma
//Luego la operatoria es bajo una "Cuenta" a la cual se asignan esos cuits

async function crearCuentaController(req, res, next) {
  try {

    let request = {};
    request.nombre = req.body.nombre;
    request.email = req.body.email;
    request.emailAlternativo = req.body.emailAlternativo;
    request.cuenta = req.body.cuenta;
    request.telefono = req.body.telefono;
    request.idReparticion = req.body.idReparticion
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearCuenta(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Cuenta creada exitosamente', data: {} }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear la cuenta.", data: String(e) }))
    res.end();
  }
}
async function crearUsuarioBOController(req, res, next) {
  try {

    let request = {};
    request.apellidoNombre = req.body.apellidoNombre;
    request.email = req.body.email;
    request.usuario = req.body.usuario;
    request.existeEnSADE = req.body.existeEnSADE ? req.body.existeEnSADE : null;
    request.numeroCOAlta = req.body.numeroCOAlta ? req.body.numeroCOAlta : null;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearUsuarioBO(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Usuario creado exitosamente', data: {} }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear usuario.", data: String(e) }))
    res.end();
  }
}

async function traerCuentasController(req, res, next) {
  try {
    let request = {
      paginaActual: req.body?.paginaActual,
      limite: req.body?.limite,
      buscador: req.body?.buscador
    }
    let { cuentas, total } = await traerCuentas(request)
    let totalPaginas = Math.ceil(total / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Cuentas.', cuentas, total, totalPaginas }))
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Cuentas.", data: String(e) }))
  }
}

async function traerCuentaPorIdController(req, res, next) {
  try {

    let request = {};
    request.idCuenta = req.body.idCuenta;

    let [cuenta] = await traerCuentaPorId(request)

    cuenta.usuarios = await traerUsuariosPorIdCuenta(request)

    cuenta.perfiles = await traerPerfilesCuenta(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Cuenta', data: cuenta }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer la cuenta.", data: String(e) }))
    res.end();
  }
}

async function traerPermisosCuentaController(req, res, next) {
  try {

    let request = {};
    request.idCuenta = req.body.idCuenta;

    let permisos = await traerPermisosCuenta(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permisos de la cuenta', data: permisos }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer permisos de la cuenta.", data: String(e) }))
    res.end();
  }
}

async function traerUsuariosBOController(req, res, next) {
  try {
    let request = {
      paginaActual: req.body?.paginaActual,
      limite: req.body?.limite,
      sinPaginacion: req.body?.sinPaginacion,
      buscador: req.body?.buscador,
      idCuenta: req.body?.idCuenta
    }
    let { usuarios, total } = await traerUsuariosBO(request)
    let totalPaginas = Math.ceil(total / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: usuarios de BO', usuarios, total, totalPaginas }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer usuarios de BO.", data: String(e) }))
    res.end();
  }
}

async function borrarUsuarioBOController(req, res, next) {
  try {
    let request = {
      idUsuario: req.body.idUsuario
    }
    await borrarUsuarioBO(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: usuario de BO borrado con éxito', data: request }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar usuario de BO.", data: String(e) }))
    res.end();
  }
}

async function editarUsuarioBOController(req, res, next) {
  try {
    let datosEditar = req.body.datosEditar;
    let idUsuario = req.body?.idUsuario;
    await editarUsuarioBO(datosEditar, idUsuario)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: usuario de BO editado con éxito', datosEditar, idUsuario }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al editar usuario de BO.", data: String(e) }))
    res.end();
  }
}


async function deshacerEliminarCuentaController(req, res) {
  try {
    let idCuenta = req.body.idCuenta
    let usuario = req.body.usuario
    await deshacerEliminarCuenta(usuario, idCuenta)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Se deshizo la eliminación del usuario.', idCuenta }))
    res.end();
  } catch(e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al deshacer eliminación de cuenta.", data: String(e) }))
    res.end();

  }
  
}
async function borrarCuentaController(req, res) {
  try {
    let idCuenta = req.body.idCuenta
    let usuario = req.body.usuario
    await borrarCuentaBO(usuario, idCuenta)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Se eliminó la cuenta del usuario.', idCuenta }))
    res.end();
  } catch(e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar la cuenta.", data: String(e) }))
    res.end();

  }
  
}

module.exports = {
  crearCuentaController,
  traerCuentasController,
  traerCuentaPorIdController,
  traerPermisosCuentaController,
  borrarCuentaController,
  deshacerEliminarCuentaController,
  traerUsuariosBOController,
  crearUsuarioBOController,
  borrarUsuarioBOController,
  editarUsuarioBOController
}