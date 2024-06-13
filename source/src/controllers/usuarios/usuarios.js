const { httpError } = require('../../helpers/handleError');
const { crearReparticionesUsuario, borrarReparticionesUsuario, traerReparticionesUsuario, borrarPermisoReparticion,
  crearPermisoReparticion, traerPermisosReparticion, borrarPermisoUsuario, crearPermisoUsuario, nuevoUsuario,
  editarUsuario, eliminarUsuario, getPerfilUsuario, getPerfilVistas, traerPermisosBOCargaPorId, traerUsuarios, traerPerfiles,
  asignarPerfilUsuario, eliminarPerfilUsuario, traerUsuariosSDIN, traerUsuarioPorId, editarUsuarioSDIN, borrarUsuarioSDIN,
  crearUsuarioSDIN, traerUsuarioSDIN, asignarPerfilUsuarioSDIN, borrarPerfilUsuarioSDIN, reactivarUsuarioSDIN } = require('./usuariosFunctions')
async function crearReparticionesUsuarioController(req, res, next) {
  try {
    const idUsuario = req.usuario.idUsuario;

    let request = {};
    request.idUsuarioCarga = idUsuario;
    request.idUsuario = req.body.idUsuarioAdmin;
    request.idReparticion = req.body.idReparticion;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearReparticionesUsuario(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones que opera ' + req.usuario.usuario + ' creadas con éxito', data: {} }))
    res.end();

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear reparticiones que opera el usuario.", data: String(e) }))
    res.end();
  }
}
async function borrarReparticionesUsuarioController(req, res, next) {
  try {
    let request = {};
    request.idUsuarioCarga = req.usuario.idUsuario;
    request.idUsuario = req.body.idUsuarioAdmin;
    request.itemBorrar = req.body.itemBorrar;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarReparticionesUsuario(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones que opera el usuario borradas con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar reparticiones que opera el usuario.", data: String(e) }))
    res.end();
  }

}
async function traerReparticionesUsuarioController(req, res, next) {

  const idUsuario = req.usuario.idUsuario;

  let request = {};
  request.idUsuario = idUsuario;

  let respuesta = await traerReparticionesUsuario(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer reparticiones que opera el usuario.", data: String(e) }))
      res.end();
      return;
    });

  if (respuesta.length === 0) {
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: No hay reparticiones asignadas al usuario ' + req.usuario.usuario + '.', data: {} }))
    res.end();
    return;
  }
  else {
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones que opera ' + req.usuario.usuario, data: JSON.parse(respuesta[0].usuarioReparticiones) }))
    res.end();
    return;
  }


}
async function traerPermisosBOCargaPorIdOrgJerarquiaController(req, res, next) {

  const idOrgJerarquia = req.reparticion.idOrgJerarquia;

  let request = {};
  request.idOrgJerarquia = idOrgJerarquia;

  let respuesta = await traerPermisosReparticion(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Permisos de la repartición.", data: String(e) }))
      res.end();
      return;
    });

  if (respuesta.length === 0) {
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: No hay permisos asignados a la repartición: ' + req.reparticion.reparticion, data: {} }))
    res.end();
    return;
  }
  else {
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permisos de la Repartición ' + req.reparticion.reparticion, data: JSON.parse(respuesta[0].permisosCargaReparticion) }))
    res.end();
    return;
  }


}
async function borrarPermisosUsuarioController(req, res, next) {
  try {
    const idUsuario = req.body.idUsuarioAdmin;

    let request = {};
    request.idUsuarioActualizacion = idUsuario;
    request.itemBorrar = req.body.itemBorrar;
    request.idCuenta = req.body.idCuenta;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarPermisoUsuario(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permiso de usuario borrado con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Permiso de Usuario.", data: String(e) }))
    res.end();

  }
}
async function asignarPermisosUsuarioController(req, res, next) {
  try {
    const idUsuarioCarga = req.body.idUsuarioAdmin;
    const permisosCargaUsuario = req.body.permisosCargaUsuario;

    let request = {};
    request.idUsuarioCarga = idUsuarioCarga;
    request.permisosCargaUsuario = permisosCargaUsuario;
    request.idCuenta = req.body.idCuenta;
    // Nombre y Sigla no vienen dentro de permisosCargaUsuario
    request.nombre = req.body.nombre;
    request.sigla = req.body.sigla
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearPermisoUsuario(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permiso de usuario creado con éxito.', data: request }))
    res.end();
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Permiso de Usuario.", data: String(e) }))
    res.end();
  }
}

async function asignarPermisosReparticionController(req, res, next) {

  try {
    let request = {};
    request.idOrgJerarquia = req.reparticion.idOrgJerarquia;
    request.permisosCargaReparticion = req.body.permisosCargaReparticion;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearPermisoReparticion(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permiso de reparticion (' + req.reparticion.reparticion + ') creado con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: 'PIN: Error al crear Permiso en repartición (' + req.reparticion.reparticion + ').', data: String(e) }))
    res.end();
  }
}

async function borrarPermisosReparticionController(req, res, next) {
  try {

    let request = {};
    request.idOrgJerarquia = req.reparticion.idOrgJerarquia
    request.itemBorrar = req.body.itemBorrar;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarPermisoReparticion(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permiso de reparticion (' + req.reparticion.reparticion + ') borrados con éxito.', data: request }))
    res.end();
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: 'PIN: Error al borrar Permisos en repartición (' + req.reparticion.reparticion + ').', data: String(e) }))
    res.end();

  }
}

async function nuevoUsuarioController(req, res, next) {

  let request = {};
  try {
    request.usuario = req.body.usuario;
    request.email = req.body.email;
    request.apellidoNombre = req.body.apellidoNombre;
    request.existeEnSADE = req.body.existeEnSADE;
    request.numeroCOAlta = req.body.numeroCOAlta;
    request.idUsuarioCarga = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    await nuevoUsuario(request);

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario creado con éxito.", data: request })).end();

  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear usuario.", data: String(err) }))
    res.end();
    return;
  }

}

async function editarUsuarioController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.email = req.body.email;
  request.apellidoNombre = req.body.apellidoNombre;
  request.existeEnSADE = req.body.existeEnSADE;
  request.idUsuario = req.usuario.idUsuario;
  request.numeroCOAlta = req.body.numeroCOAlta;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarUsuario(request)
    .then((res) => {
    })
    .catch((err) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar usuario.", data: String(err) }))
      res.end();
      return;
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar usuario.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario actualizado con éxito.", data: req.body })).end();
  return;

}
async function eliminarUsuarioController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.numeroCOBaja = String(req.body.numeroCOBaja).trim();
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarUsuario(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar usuario.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Usuario Eliminado con Éxito.', data: respuesta })).end();
  return;

}
async function getPerfilUsuarioController(req, res, next) {

  let request = {};
  let result = {};
  let err = null;

  request.idUsuario = req.usuario.idUsuario;

  await getPerfilUsuario(request)
    .then((response) => {
      result = response
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
async function getPerfilVistasController(req, res, next) {

  let request = {};
  let result = {};
  let err = null;

  request.idPerfil = req.body.idPerfil;

  await getPerfilVistas(request)
    .then((response) => {
      result = response
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

async function getVistas(req, res, next) {

  let request = {};
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
      result = response
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



async function traerPermisosBOCargaPorIdController(req, res, next) {
  try {
    let request = {};
    request.idUsuario = req.usuario.idUsuario;
    let respuesta = await traerPermisosBOCargaPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer permisos de carga BO.", data: String(e) }))
        res.end();
        return;
      });

    let permisos = respuesta[0];
    if (permisos !== undefined) {

      let permisoCargaUsuario = JSON.parse(permisos.permisosCargaUsuario);

      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Permisos de Carga BO.', data: permisoCargaUsuario }))
      res.end();
      return;
    }
    else {
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Permisos de Carga BO.', data: {} }))
      res.end();
      return;
    }

  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer permisos de carga BO.", data: String(err) }))
    res.end();
    return;
  }


}
async function traerTodosLosPermisosBOCargaPorIdController(req, res, next) {
  try {
    let request = {};
    request.idUsuario = req.usuario.idUsuario;
    let permisosUsuario = []
    await traerPermisosBOCargaPorId(request).then(
      (response) => {
        if (response.length === 0) {

        }
        else {
          permisosUsuario = JSON.parse(response[0].permisosCargaUsuario)
        }

      }
    ).catch((e) => {
      throw e
    });

    const reparticiones = await traerReparticionesUsuario(request).catch((e) => {
      throw e
    });

    if (reparticiones[0]) {
      const aaa = await JSON.parse(reparticiones[0].usuarioReparticiones)

      for await (const repa of aaa) {

        let requestB = {};
        requestB.idOrgJerarquia = repa.idOrgJerarquia;

        const permi = await traerPermisosReparticion(requestB);
        try {
          const bb = JSON.parse(permi[0].permisosCargaReparticion);
          for await (const p of bb) {
            permisosUsuario.push(p)

          }

        }
        catch (e) {
          console.log('rompe acá', e, permi, aaa)
          throw e
        }


      }
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Permisos de Carga BO.', data: permisosUsuario }))
    res.end();
    return;


  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer permisos de carga BO.", data: [] }))
    res.end();
    return;
  }


}

async function traerUsuariosController(req, res, next) {
  try {
    let request = {
      paginaActual: req.body?.paginaActual,
      limite: req.body?.limite
    }
    let { usuarios, total } = await traerUsuarios(request)
    let totalPaginas = Math.ceil(total / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Usuarios.', usuarios, total, totalPaginas }))
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Usuarios.", data: String(e) }))
  }
}

async function traerUsuarioController(req, res, next) {
  let request = {
    idUsuario: req.body.idUsuario
  }
  try {
    let usuario = await traerUsuarioPorId(request).catch(e => { throw e })
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Usuario.', data: usuario[0] }))
    res.end();
    return;
  }
  catch (e) {
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Usuario.', data: req.usuario }))
    res.end();
    return;

  }
}

async function traerPerfilesController(req, res, next) {
  let respuesta = await traerPerfiles()
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Perfiles.", data: String(e) }))
      res.end();
      return;
    });
  console.log(respuesta)
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Perfiles.', data: respuesta }))
  res.end();
  return;

}

async function asignarPerfilUsuarioController(req, res, next) {
  try {
    let request = {}
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    request.idUsuarioCarga = req.usuario.idUsuario;
    request.idPerfil = req.body.idPerfil;
    request.idUsuario = req.body.idUsuarioAdmin;

    let respuesta = await asignarPerfilUsuario(request)
      .catch((e) => { throw e });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: perfil asignado con éxito.', data: respuesta }))
    res.end();
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al asignar perfil.", data: String(e) }))
    res.end();
  }
}

async function eliminarPerfilUsuarioController(req, res, next) {
  try {
    let request = {};
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    request.idUsuariosPerfil = req.perfil;
    request.idUsuarioCarga = req.usuario.idUsuario;
    request.idUsuario = req.body.idUsuarioAdmin;

    await eliminarPerfilUsuario(request)
      .catch((err) => { throw err });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Perfil de Usuario Eliminado con éxito.', data: request }));

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar perfil de usuario.", data: String(e) }))
    res.end();
  }

}

async function traerUsuariosSDINController(req, res, next) {
  try {
    let request = {
      paginaActual: req.body?.paginaActual,
      limite: req.body?.limite
    }
    let { usuarios, total } = await traerUsuariosSDIN(request).catch(err => { throw err })
    let totalPaginas = Math.ceil(total / request.limite);
    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuarios SDIN", data: usuarios, total, totalPaginas }))
  }
  catch (e) {
    res.status(409).send(JSON.stringify({ mensaje: "PIN: Error al traer los usuarios", data: String(e) }))
  }
}

async function editarUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.email = req.body.email;
    request.apellidoNombre = req.body.apellidoNombre;
    request.usuario = req.body.cuit;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await editarUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario actualizado con éxito.", data: req.body })).end();

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar usuario.", data: String(e) }))
  }

}

async function borrarUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.email = req.body.email;
    request.apellidoNombre = req.body.apellidoNombre;
    request.usuario = req.body.cuit;
    request.idUsuario = req.body.idUsuario;

    let usuarioActual = req.body.usuarioActual

    if (usuarioActual === request.idUsuario) {
      return res.status(409).send({mensaje: "PIN: No podes borrar tu propio usuario."})
    }

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario actualizado con éxito.", data: req.body })).end();

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar usuario.", data: String(e) }))
  }

}

async function reactivarUsuarioSDINController(req, res, next) {
  try {
    let request = {}
    request.idUsuario = req.body.idUsuario

    await reactivarUsuarioSDIN(request)
    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario actualizado con éxito.", data: req.body })).end();

  } catch (error) {
    res.status(409).send(error).end()
  }
}

async function crearUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.email = req.body.email;
    request.apellidoNombre = req.body.apellidoNombre;
    request.usuario = req.body.cuit;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario creado con éxito.", data: req.body })).end();

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear el usuario.", data: String(e) }))
  }

}

async function traerUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let { usuario, perfiles } = await traerUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Usuario.", data: usuario, perfiles })).end();
    
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer el usuario.", data: String(e) }))
  }

}

async function asignarPerfilUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.idUsuario = req.body.idUsuario;
    request.idPerfil = req.body.idPerfil;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await asignarPerfilUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Perfil asignado correctamente.", data: req.body })).end();

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al asignar el perfil al usuario.", data: String(e) }))
  }

}

async function borrarPerfilUsuarioSDINController(req, res, next) {
  try {
    let request = {};

    request.idUsuariosPerfil = req.body.idUsuariosPerfil;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarPerfilUsuarioSDIN(request)

    res.status(200).send(JSON.stringify({ mensaje: "PIN: Perfil borrado correctamente.", data: req.body })).end();

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar el perfil al usuario.", data: String(e) }))
  }

}

module.exports = {
  asignarPerfilUsuarioController,
  traerPerfilesController,
  nuevoUsuarioController,
  editarUsuarioController,
  eliminarUsuarioController,
  getPerfilUsuarioController,
  getPerfilVistasController,
  getVistas,
  traerPermisosBOCargaPorIdController,
  traerUsuariosController,
  traerUsuarioController,
  eliminarPerfilUsuarioController,
  asignarPermisosUsuarioController,
  borrarPermisosUsuarioController,
  traerPermisosBOCargaPorIdOrgJerarquiaController,
  asignarPermisosReparticionController,
  borrarPermisosReparticionController,
  traerReparticionesUsuarioController,
  crearReparticionesUsuarioController,
  borrarReparticionesUsuarioController,
  traerTodosLosPermisosBOCargaPorIdController,
  traerUsuariosSDINController,
  editarUsuarioSDINController,
  borrarUsuarioSDINController,
  crearUsuarioSDINController,
  traerUsuarioSDINController,
  asignarPerfilUsuarioSDINController,
  borrarPerfilUsuarioSDINController,
  reactivarUsuarioSDINController
}