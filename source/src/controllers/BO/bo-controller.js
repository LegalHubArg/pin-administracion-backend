//Controlador de BOLETIN OFICIAL
//const html_to_pdf1 = require('html-pdf-node');
//const { Arial64 } = require('../../helpers/utils')
const moment = require('moment')
const { PDFDocument, StandardFonts, rgb, PageSizes } = require("pdf-lib");
const path = require('path');
const fs = require('fs');
const pdf = require("html-pdf");
const { subirPdfBucketS3, subirArchivo, copiarArchivo } = require('../../helpers/functionsS3');
const { generarHTMLBoletin, generarHTMLSeparata } = require('../../helpers/pdf-boletin');

//Funciones
const { crearNormaTipo, borrarNormaTipo, traerNormaTipoPorId, traerNormasTipos, editarNormaTipo, traerTodosNormaTipos } = require('./NormasTiposFunctions')
const { crearNormaSubtipo, borrarNormaSubtipo, traerNormaSubtipoPorId, traerNormasSubtipos, editarNormaSubtipo } = require('./NormasSubtiposFunctions')

const { crearEstadoNorma, traerNormaPorId, traerNormasDelUsuario, traerNormasDeReparticionesDelUsuario, traerNormasDeReparticiones,
  borrarNorma, crearNorma, crearAnexoNorma, traerAnexosPorIdNorma, traerNormasDeCuenta, crearMetadatosNorma,
  traerObservacionesMotivos, crearObservacion, revision, traerPrioridades, cambiarEstadoNorma, borrarEstadoNorma, crearEstadoNormaPorTipo,
  asignarPrioridad, cotizarNorma, aprobarNormaParaCotizacion, actualizarNorma, aprobarNorma, desaprobarNorma,
  borrarAnexosNorma,
  traerObservacionesPorIdUsuario,
  traerObservacionPorIdNorma,
  crearDigitalizacionNorma,
  traerDigitalizacionPorIdNorma,
  actualizarDigitalizacionPorIdNorma,
  traerTrazabilidadPorIdNorma,
  traerEstadosNormas,
  traerNormasConFiltro,
  republicarNorma,
  traerOrganismosConjuntos,
  editarFechaLimite,
  asociarAviso,
  traerAvisoAsociado,
  revisarNorma,
  traerUsuariosActivosPorIdNorma,
  registrarIngresoEdicion,
  traerPublicacionesNormaDesdeHasta,
  guardarRepublicaciones,
  traerUsuarios, traerPerfil, traerCuenta
} = require('./NormasFunctions')

const { traerTiposDeNormaPorSeccion, traerSecciones, traerReparticiones, traerSubtipos, traerSumario,
  traerSumarioItemPorId,
  traerSeccionPorId,
  crearSumarioItem,
  crearSeccion,
  mostrarSeccion,
  borrarSeccion,
  borrarSumarioItemPorId,
  borrarSeccionPorId, actualizarSeccionPorId,
  crearSumarioSubtipo,
  borrarSumarioSubtipo, borrarSumarioReparticion, crearSumarioReparticion, ordenarSecciones, ordenarNormaTiposSumario,
  ordenarSubtiposSumario, ordenarReparticiones, traerReparticionesPorSeccion, reactivarSubtipo, reactivarSumarioItemPorId } = require('./SumarioFunctions')
const { traerFeriadosPorAnio, traerFeriadoPorFecha, crearFeriado, borrarFeriadoPorId } = require('./FeriadosFunctions')
const { traerReparticionesUsuario, traerUsuarioPorId } = require('../usuarios/usuariosFunctions')
const { crearBoletin, traerVistaPreviaBoletin, traerNormasOrdenadasDeUnBoletin, traerNormasPorFechaLimite,
  traerBoletinesEnEdicion, traerNormasPorFechaOrdenadasPorSumario, traerNormasPorFechaPublicacionOrdenadasPorSumario, traerBoletinPorId,
  traerNormasPorFechaPublicacionSeccion, editarBoletin,
  traerNormaParaPDF, existeBoletinPorFecha, cambiarEstadoBoletin,
  traerUltimoBoletinPublicado,
  traerVistaPreviaNorma, descargarBoletin,
  traerHTMLDeUnBoletin, traerBoletinPDF, traerSeparataPDF,
  publicarBoletin, anularDescargaBoletin, firmarBoletin, traerDocumentosPublicados,
  anularFirma, republicarBoletin, traerNormasBoletinDesdeHasta,
  traerVistaPreviaDocBoletin, borrarBoletin, traerBoletinesPublicados, republicarSeparata, traerBoletinPorFechaPublicacion
} = require('./BoletinFunctions')

const { observacion } = require('../../helpers/mailer')
const { traerObservacionesPorReparticion } = require('../../models/BO/NormasModel');
const { firmaDirectaDocumento } = require("../../helpers/consultaGEDO");
const { traerReparticionesTodas, traerOrganismosEmisores, crearOrganismosEmisores, editarOrganismosEmisores,
  eliminarOrganismosEmisores,
  traerOrganismosEmisoresExterno } = require('../organismos/organismosFunctions')
let XLSX = require("xlsx");

///////////////////// SUMARIO \\\\\\\\\\\\\\\\\\\\\\\\
async function traerSumarioController(req, res, next) {
  try {

    let request = {};

    let respuesta = await traerSumario(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sumario de BO.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Sumario.", data: String(e) }))
    res.end();
    return;

  }

}
async function traerSumarioSeccionSubtiposController(req, res, next) {
  try {
    const idSumarioNormasTipo = parseInt(req.body.idSumarioNormasTipo);

    let request = {};
    request.idSumarioNormasTipo = idSumarioNormasTipo;

    if (!Number.isInteger(idSumarioNormasTipo)) {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Subtipos del Tipo de Norma.", data: 'El campo no es un número entero' }))
      res.end();
      return;
    }

    let respuesta = await traerSubtipos(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Subtipos del Tipo de Norma.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Subtipos del Tipo de Norma.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Subtipos del Tipo de Norma.", data: String(e) }))
    res.end();
    return;

  }
}
async function traerSumarioSeccionTipoReparticionesController(req, res, next) {
  try {
    const idSumarioNormasTipo = parseInt(req.body.idSumarioNormasTipo);

    let request = {};
    request.idSumarioNormasTipo = idSumarioNormasTipo;

    if (!Number.isInteger(idSumarioNormasTipo)) {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones del Tipo de Norma.", data: 'El campo no es un número entero' }))
      res.end();
      return;
    }

    let respuesta = await traerReparticiones(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones del Tipo de Norma.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones del Tipo de Norma.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones del Tipo de Norma.", data: String(e) }))
    res.end();
    return;

  }
}
async function traerSumarioSeccionReparticionesController(req, res, next) {
  try {
    const idSeccion = parseInt(req.body.idSeccion);

    let request = {};
    request.idSeccion = idSeccion;

    if (!Number.isInteger(idSeccion)) {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones de la Seccion.", data: 'El campo no es un número entero' }))
      res.end();
      return;
    }

    let respuesta = await traerReparticionesPorSeccion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones de la Seccion.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Reparticiones de la Seccion.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Reparticiones de la Seccion.", data: String(e) }))
    res.end();
    return;

  }
}
async function traerSumarioSeccionesController(req, res, next) {
  try {
    let request = {};

    let respuesta = await traerSecciones(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Secciones del Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Secciones del Sumario.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Secciones del Sumario.", data: String(e) }))
    res.end();
    return;

  }
}
async function traerSumarioSeccionController(req, res, next) {
  try {

    const idSeccion = parseInt(req.body.idSeccion);

    let request = {};
    request.idSeccion = idSeccion;

    if (!Number.isInteger(idSeccion)) {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Seccion del Sumario.", data: 'El campo no es un número entero' }))
      res.end();
      return;
    }


    let respuesta = await traerTiposDeNormaPorSeccion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Seccion del Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección del Sumario.', data: respuesta }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Seccion del Sumario.", data: String(e) }))
    res.end();
    return;

  }
}
//////////////////// TIPOS NORMAS \\\\\\\\\\\\\\\\\\\\\
async function crearNormaTipoController(req, res, next) {
 try{
  const normaTipo = String(req.body.descripcion).trim();
  const siglaNormaTipo = String(req.body.sigla).trim();

  let request = {};
  request.normaTipo = normaTipo;
  request.siglaNormaTipo = siglaNormaTipo;
  request.bo = req.body.bo;
  request.sdin = req.body.sdin;
  request.dj = req.body.dj;
  request.idUsuario = req.usuario.idUsuarioBO;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  let respuesta = await crearNormaTipo(request)

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma creada con éxito.', data: request }))
  res.end();
  return;
 }
 catch (error){
  console.log(error)
  res.status(409)
  res.send(JSON.stringify({ mensaje: "PIN: Error al crear Tipo de Norma.", data: String(error) }))
  res.end();
 }
}

async function editarNormaTipoController(req, res, next) {

  const normaTipo = String(req.body.descripcion).trim();
  const siglaNormaTipo = String(req.body.sigla).trim();

  let request = {};
  request.normaTipo = normaTipo;
  request.siglaNormaTipo = siglaNormaTipo;
  request.bo = req.body.bo;
  request.sdin = req.body.sdin;
  request.dj = req.body.dj;
  request.idUsuario = req.usuario.idUsuarioBO;
  request.idNormaTipo = parseInt(req.body.idNormaTipo);

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  await editarNormaTipo(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al editar Tipo de Norma.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma editada con éxito.', data: request }))
  res.end();
  return;
}

async function editarNormaSubtipoController(req, res, next) {

  const normaSubtipo = String(req.body.descripcion).trim();
  const normaSubtipoSigla = String(req.body.sigla).trim();

  let request = {};
  request.normaSubtipo = normaSubtipo;
  request.normaSubtipoSigla = normaSubtipoSigla;
  request.idUsuario = req.usuario.idUsuarioBO;
  request.idNormaSubtipo = parseInt(req.body.idNormaSubtipo);

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  await editarNormaSubtipo(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al editar Tipo de Norma.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma editada con éxito.', data: request }))
  res.end();
  return;
}

async function borrarNormaTipoController(req, res, next) {

  const idNormaTipo = parseInt(req.body.idNormaTipo);
  let request = {};
  request.idNormaTipo = idNormaTipo;
  request.idUsuario = req.usuario.idUsuarioBO;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  let respuesta = await borrarNormaTipo(request)
    .then((resp) => {
      // console.log(resp)
    }
    )
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al borrar el Tipo de Norma.", data: String(e) }))
      res.end();
      return;
    });
  let tipoUpdate = await traerNormaTipoPorId(request).then().catch((e) => console.log(e));
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma borrada con éxito.', data: tipoUpdate }))
  res.end();
  return;
}
async function traerNormaTipoController(req, res, next) {
  const idNormaTipo = parseInt(req.body.idNormaTipo);
  let request = {};
  request.idNormaTipo = idNormaTipo;
  let respuesta = await traerNormaTipoPorId(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer información del Tipo de Norma.", data: String(e) }))
      res.end();
      return;
    });
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Tipo Norma.', data: respuesta }))
  res.end();
  return;

}
async function traerNormasTiposController(req, res, next) {

  let respuesta = await traerNormasTipos()
    .then((resp) => {
      //console.log(resp)
      res.status(200)
      res.send(JSON.stringify({ mensaje: 'PIN: Tipos de Normas.', data: resp }))
      res.end();
    })
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer información de los Tipos de Normas.", data: String(e) }))
      res.end();
      return;
    });

  return;

}
//////////////////// SUBTIPOS NORMAS \\\\\\\\\\\\\\\\\\\\\
async function crearNormaSubtipoController(req, res, next) {

  const normaSubtipo = String(req.body.descripcion).trim();
  const siglaNormaSubtipo = String(req.body.sigla).trim();

  let request = {};
  request.normaSubtipo = normaSubtipo;
  request.siglaNormaSubtipo = siglaNormaSubtipo;
  request.idUsuario = req.usuario.idUsuarioBO;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  let respuesta = await crearNormaSubtipo(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al crear Subtipo de Norma.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Subtipo de Norma creada con éxito.', data: request }))
  res.end();
  return;
}
async function borrarNormaSubtipoController(req, res, next) {

  const idNormaSubtipo = parseInt(req.body.idNormaSubtipo);
  let request = {};
  request.idNormaSubtipo = idNormaSubtipo;
  request.idUsuario = req.usuario.idUsuarioBO;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  let respuesta = await borrarNormaSubtipo(request)
    .then((resp) => {
      // console.log(resp)
    }
    )
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al borrar el Subtipo de Norma.", data: String(e) }))
      res.end();
      return;
    });
  let subtipoUpdate = await traerNormaSubtipoPorId(request).then().catch((e) => console.log(e));
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Subtipo de Norma borrada con éxito.', data: subtipoUpdate }))
  res.end();
  return;
}
async function traerNormaSubtipoController(req, res, next) {
  const idNormaSubtipo = parseInt(req.body.idNormaSubtipo);
  let request = {};
  request.idNormaSubtipo = idNormaSubtipo;
  let respuesta = await traerNormaSubtipoPorId(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer información del Subtipo de Norma.", data: String(e) }))
      res.end();
      return;
    });
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Subtipo Norma.', data: respuesta }))
  res.end();
  return;

}
async function traerNormasSubtiposController(req, res, next) {

  try {
    let request = {}
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;

    const data = await traerNormasSubtipos(request)
    const totalSubtipos = data.totalSubtipos
    const totalPaginas = Math.ceil(totalSubtipos / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Tipos de Normas.`, data: data.subtipos, totalSubtipos, totalPaginas }))
    res.end();
  } catch (error) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer información de los Subtipos de Normas.", data: String(error) }))
    res.end();
    return;
  }
  // --------------------------------------------
  // const data = await traerNormasSubtipos()
  //   .then((resp) => {
  //     //console.log(resp)
  //     res.status(200)
  //     res.send(JSON.stringify({ mensaje: 'PIN: Subtipos de Normas.', data: resp }))
  //     res.end();
  //   })
  //   .catch((e) => {
  //     res.status(409)
  //     res.send(JSON.stringify({ mensaje: "PIN: Error al traer información de los Subtipos de Normas.", data: String(e) }))
  //     res.end();
  //     return;
  //   });

  // return;

}
async function borrarNormaController(req, res, next) {
  const idNorma = parseInt(req.body.idNorma);
  let request = {};
  request.idNorma = idNorma;
  request.usuario = req.body.idUsuario;
  request.idNormasEstadoTipo = 0;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  let respuesta = await borrarNorma(request)
    .then((resp) => {
      // console.log(resp)
    }
    )
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al borrar la Norma.", data: String(e) }))
      res.end();
      return;
    });
  let normaUpdate = await traerNormaPorId(request).then().catch((e) => console.log(e));
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Norma borrada con éxito.', data: normaUpdate }))
  res.end();
  return;
}
async function traerNormaController(req, res, next) {
  const idNorma = parseInt(req.body.idNorma);
  let request = {};
  request.idNorma = idNorma;

  try {

    let respuesta = await traerNormaPorId(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al traer la Norma.", data: String(e) });
      });

    respuesta[0].anexos = await traerAnexosPorIdNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al traer los Anexos.", data: String(e) });
      })

    respuesta[0].normaDocumento = await traerDigitalizacionPorIdNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al traer norma Digital.", data: String(e) });
      })

    // TRAIGO LAS OBSERVACIONES
    respuesta[0].observaciones = await traerObservacionPorIdNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al traer Observaciones de la norma.", data: String(e) });
      })

    respuesta[0].trazabilidad = await traerTrazabilidadPorIdNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al traer Trazabilidad de la norma.", data: String(e) });
      })

    // Calculo Días Hábiles
    if ([4, 5, 6, 10].includes(parseInt(respuesta[0].idSeccion))) {

      const fechaDesde = moment(respuesta[0].fechaDesde)
      const fechaHasta = moment(respuesta[0].fechaHasta)
      const feriadosDesde = await traerFeriadosPorAnio({ fechaAnio: fechaDesde.year() })
        .catch(e => { throw e })
      const feriadosHasta = await traerFeriadosPorAnio({ fechaAnio: fechaHasta.year() })
        .catch(e => { throw e })

      let diasHabiles = 0;

      for (let fecha = fechaDesde; fecha <= fechaHasta; fecha.add(1, "days")) {
        const esFinde = (fecha.day() === 6) || (fecha.day() === 0);
        const esFeriado = [...feriadosDesde, ...feriadosHasta].find(elem => elem['DATE(feriadoFecha)'] === fecha);
        if (!esFinde && !esFeriado)
          diasHabiles++;
      }

      respuesta[0].diasHabiles = diasHabiles

    }

    if (respuesta[0].organismosConjuntos) {
      if (JSON.parse(respuesta[0].organismosConjuntos).organismos.length > 0) {
        organismosConjuntos = await traerOrganismosConjuntos(respuesta[0])
          .catch(e => { throw e })
        respuesta[0].organismosConjuntosSiglas = organismosConjuntos;
      }
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Norma.', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409).send(e);
    return;
  }
}

async function traerNormasPropiasController(req, res, next) {
  const usuario = req.usuario;
  let request = {};
  request.usuario = usuario;
  request.idSeccion = req.body.idSeccion;
  request.idReparticion = req.body.idReparticion;
  request.idNormasEstadoTipo = req.body.idNormasEstadoTipo;
  request.normaAnio = req.body.normaAnio;
  request.normaNumero = req.body.normaNumero;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  let respuesta = await traerNormasDelUsuario(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Normas del Usuario.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Normas Propias.', data: respuesta?.normas, totalNormas: respuesta?.totalNormas[0]['COUNT(a.idNorma)'] }))
  res.end();
  return;
}

async function traerNormasDeReparticionController(req, res, next) {
  const idOrgJerarquia = req.body.idOrgJerarquia
  let request = {};
  request.idOrgJerarquia = idOrgJerarquia;
  let normas = {}
  await traerNormasDeReparticion(request)
    .then(
      (response) => {
        if (response.lenght !== 0) {
          normas = response
        }

      }
    )
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Normas de Reparticion.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Normas de Reparticiones del Usuario.', data: normas }))
  res.end();
  return;
}

async function traerNormasDeReparticionesController(req, res, next) {
  const idUsuario = req.usuario.idUsuarioBO
  let request = {};
  request.idUsuario = idUsuario;
  let normas = {}
  await traerNormasDeReparticiones(request)
    .then(
      (response) => {
        if (response.lenght !== 0) {
          normas = response
        }

      }
    )
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Normas de Reparticion.", data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Normas de Reparticiones del Usuario.', data: normas }))
  res.end();
  return;
}

async function traerNormaDeCuentaController(req, res, next) {

  try {
    let request = {};
    request.idCuenta = req.body.idCuenta;
    //Paginacion (viene tambien en el req.body)
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;

    const nnn = await traerNormasDeCuenta(request);
    totalNormas = parseInt(nnn.totalNormas[0]['COUNT(a.idNorma)'])
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Normas de la Cuenta.', data: nnn.normas, totalNormas }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Normas de Reparticiones del Usuario.", data: String(e) }))
    res.end();
    return;
  }
}


async function editarNormaDigitalizacionController(req, res, next) {


  try {
    let request = {};
    request.idNorma = req.body.idNorma;
    request.normaDocumento = String(req.body.normaDocumento).trim();
    request.idNormaDigitalizacion = req.body.idNormaDigitalizacion;
    request.idUsuarioCarga = req.usuario.idUsuarioBO;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    //console.log(request)
    //console.log(req.body)
    if (request.idNormaDigitalizacion === 0) {
      await crearDigitalizacionNorma(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al actualizar Digitalizacion de Solicitud de Norma.", data: String(e) })
        });

    }
    else {
      await actualizarDigitalizacionPorIdNorma(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al actualizar Digitalizacion de Solicitud de Norma.", data: String(e) })
        });

    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Solicitud de Norma actualizada con éxito.', data: request }))
    res.end();
    return;
  }
  catch (error) {
    res.status(409).send(error).end()
  }
}

async function editarNormaMetaController(req, res, next) {

  try {
    let request = {};
    request.idNorma = req.body.idNorma;
    request.idNormasMetadato = req.body.idNormasMetadato;
    request.idPrioridadTipo = req.body.idPrioridadTipo;
    request.valorCotizacion = (req.body.valorCotizacion == undefined) ? 0 : req.body.valorCotizacion;
    request.numeroBUI = (req.body.numeroBUI == undefined) ? '' : String(req.body.numeroBUI);
    request.normaTexto = (req.body.normaTexto == undefined) ? '' : String(req.body.normaTexto);


    request.idUsuarioCarga = req.usuario.idUsuarioBO;
    request.normaAcronimoReferencia = String(req.body.normaAcronimoReferencia).trim();
    request.organismoEmisor = String(req.body.organismoEmisor).trim();
    request.idReparticion = parseInt(req.body.idReparticion);
    request.idSeccion = parseInt(req.body.idSeccion);
    request.idNormaTipo = parseInt(req.body.idNormaTipo);
    request.idNormaSubtipo = req.body.idNormaSubtipo ? parseInt(req.body.idNormaSubtipo) : null;
    request.normaNumero = parseInt(req.body.normaNumero);
    request.normaAnio = parseInt(req.body.normaAnio);
    request.normaSumario = String(req.body.normaSumario);
    request.tags = String(req.body.tags);
    request.normaArchivoOriginal = `${String(req.body.normaAcronimoReferencia).trim()}.pdf`
    request.normaArchivoOriginalS3Key = String(req.body.normaArchivoOriginalS3Key);

    request.reparticiones = req.body.reparticiones
    request.siglasReparticiones = req.body.siglasReparticiones

    if (req.body.fechaSugerida !== null && req.body.fechaLimite !== null) {
      request.fechaSugerida = String(req.body.fechaSugerida);
      request.fechaLimite = String(req.body.fechaLimite);
      request.fechaDesde = req.body.fechaDesde
      request.fechaHasta = req.body.fechaHasta
    }
    if (req.body.fechaDesde !== null && req.body.fechaHasta !== null) {
      request.fechaDesde = String(req.body.fechaDesde);
      request.fechaHasta = String(req.body.fechaHasta);
      request.fechaSugerida = req.body.fechaSugerida;
      request.fechaLimite = req.body.fechaLimite;
    }
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    await actualizarNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al actualizar Metadatos de Solicitud de Norma.", data: String(e) })
      });


    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Solicitud de Norma actualizada con éxito.', data: request }))
    res.end();
    return;
  }
  catch (error) {
    res.status(409)
    res.send(error)
    res.end();
    return;
  }
}

async function editarNormaController(req, res, next) {

  const request = {};
  request.idNorma = req.body.idNorma;
  request.idNormasMetadato = req.body.idNormasMetadato;
  request.idPrioridadTipo = req.body.idPrioridadTipo;
  request.valorCotizacion = (req.body.valorCotizacion == undefined) ? 0 : req.body.valorCotizacion;
  request.numeroBUI = (req.body.numeroBUI == undefined) ? '' : String(req.body.numeroBUI);
  request.normaTexto = (req.body.normaTexto == undefined) ? '' : String(req.body.normaTexto);


  request.idUsuario = req.usuario.idUsuarioBO;
  request.idUsuarioCarga = req.usuario.idUsuarioBO;
  request.normaAcronimoReferencia = String(req.body.normaAcronimoReferencia).trim();
  request.organismoEmisor = req.body.organismoEmisor;
  request.idReparticion = parseInt(req.body.idReparticion);
  request.idSeccion = parseInt(req.body.idSeccion);
  request.idNormaTipo = parseInt(req.body.idNormaTipo);
  request.idNormaSubtipo = req.body.idNormaSubtipo ? parseInt(req.body.idNormaSubtipo) : null;
  request.normaNumero = parseInt(req.body.normaNumero);
  request.normaAnio = parseInt(req.body.normaAnio);
  request.normaSumario = String(req.body.normaSumario);
  request.tags = String(req.body.tags);
  request.normaArchivoOriginal = String(req.body.normaArchivoOriginal);
  request.normaArchivoOriginalS3Key = String(req.body.normaArchivoOriginalS3Key);
  request.anexos = req.body.anexos;
  request.normaDocumento = String(req.body.normaDocumento).trim();
  request.idNormaDigitalizacion = req.body.idNormaDigitalizacion;
  request.idTipoProceso = req.body.idTipoProceso;
  request.reparticiones = req.body.reparticiones;
  request.siglasReparticiones = req.body.siglasReparticiones;
  request.numeroEdicionSubtipo = req.body.numeroEdicionSubtipo;
  request.procedimiento = req.body.procedimiento;
  request.numeroReparto = req.body.numeroReparto;
  if (req.body.fechaSugerida !== null && req.body.fechaLimite !== null) {
    request.fechaSugerida = String(req.body.fechaSugerida);
    request.fechaLimite = String(req.body.fechaLimite);
    request.fechaDesde = req.body.fechaDesde
    request.fechaHasta = req.body.fechaHasta
  }
  if (req.body.fechaDesde !== null && req.body.fechaHasta !== null) {
    request.fechaDesde = String(req.body.fechaDesde);
    request.fechaHasta = String(req.body.fechaHasta);
    request.fechaSugerida = req.body.fechaSugerida;
    request.fechaLimite = req.body.fechaLimite;
  }

  //console.log({ request })
  //console.log(req.body)
  //console.log('req.body.anexos', req.body.anexos)

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  if (req.body.archivo) {
    const archivoNorma = await subirArchivo(req.body.archivo, request?.cuit, process.env.S3_BO_NORMAS + request.normaArchivoOriginal)
      .catch(e => { throw e })
    request.normaArchivoOriginalS3Key = String(archivoNorma.Key.replace(process.env.S3_BO_NORMAS, ''));
  }
  for (let index = 0; index < req.body.anexos.length; index++) {
    const anx = request.anexos[index];
    if (anx.base64) {
      const archivoAnx = await subirArchivo(anx.base64, request?.cuit, process.env.S3_BO_NORMAS + anx.nombre)
        .catch(e => { throw "Error al subir el archivo " + anx.nombre })
      anx.normaAnexoDescripcion = null,
        anx.normaAnexoArchivo = anx.nombre,
        anx.normaAnexoArchivoS3Key = archivoAnx.Key.replace(process.env.S3_BO_NORMAS, '')
      request.anexos[index] = anx
    } else {
      continue
    }
  }
  let anexosExistentes = await traerAnexosPorIdNorma({ idNorma: request.idNorma })
  let idAnexosExistentes = anexosExistentes.map(anx => { return anx.idNormasAnexo })
  let idAnexosFront = request.anexos.map((e) => (e.idNormasAnexo !== undefined ? e.idNormasAnexo : null)).filter(e => e !== null)
  let idsAnexosEliminados = idAnexosExistentes.filter((e) => !idAnexosFront.includes(e))
  //Borrar anexos por idNormasAnexos
  if (idsAnexosEliminados.length > 0) {
    let requestAnexos = {
      idsBorrar: [...idsAnexosEliminados],
      idUsuarioCarga: req.usuario.idUsuarioBO,
      ip: request.ip
    }
    await borrarAnexosNorma(requestAnexos)
      .catch(e => { throw JSON.stringify({ mensaje: "PIN: Error al eliminar Anexos de la solicitud.", data: String(e) }) })
  }
  if (req.body.anexos.length > 0) {
    for (const anexo of request['anexos']) {
      if (anexo.base64) {
        let requestAnexo = { anexo: anexo, idNorma: request.idNorma, idUsuario: request.idUsuarioCarga, ip: request.ip }
        await crearAnexoNorma(requestAnexo)
          .catch((e) => {
            throw JSON.stringify({ mensaje: "PIN: Error al crear Anexo.", data: String(e) })
          });
      } else {
        continue
      }
    }
  }
  try {
    //console.log(request)
    await actualizarNorma(request)
      .catch((e) => {
        throw JSON.stringify({ mensaje: "PIN: Error al actualizar Metadatos de Solicitud de Norma.", data: String(e) })
      });



    /* if (request.anexos) {
      let borraAnexos = await borrarAnexosNorma(request);
      if (request.anexos.length > 0) {
        for (const anexo of request['anexos']) {
          let requestAnexo = { anexo: anexo, idNorma: request.idNorma, idUsuario: request.idUsuarioCarga, ip: request.ip }
          await crearAnexoNorma(requestAnexo)
            .catch((e) => {
              throw JSON.stringify({ mensaje: "PIN: Error al crear Anexo.", data: String(e) })
            });
        }

      }
    } */
    if (request.idNormaDigitalizacion === 0) {
      await crearDigitalizacionNorma(request)
        .catch((e) => {
          throw JSON.stringify({ mensaje: "PIN: Error al actualizar Digitalizacion de Solicitud de Norma.", data: String(e) })
        });

    }
    else {
      await actualizarDigitalizacionPorIdNorma(request)
        .catch((e) => {
          throw JSON.stringify({ mensaje: "PIN: Error al actualizar Digitalizacion de Solicitud de Norma.", data: String(e) })
        });

    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Solicitud de Norma actualizada con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(e)
    res.end();
    return;
  }
}

async function encontrarAnexosEliminados(arr1, arr2) {
  const elementosEliminados = [];

  // Hacemos una copia de la primera lista para no modificarla
  const copiaLista1 = [...arr1];

  // Recorremos la segunda lista y eliminamos elementos de la copia de la primera lista
  for (const elemento of arr2) {
    const indice = copiaLista1.indexOf(elemento);
    if (indice !== -1) {
      elementosEliminados.push(elemento);
    }
  }

  return elementosEliminados;
}

async function crearNormaController(req, res, next) {
  try {
    let request = {};
    request.idUsuarioCarga = req.usuario.idUsuarioBO;
    request.idCuenta = req.usuario.cuenta.idCuenta;
    request.normaAcronimoReferencia = String(req.body.normaAcronimoReferencia).trim();
    request.organismoEmisor = req.body.organismoEmisor;
    request.idReparticion = parseInt(req.body.idReparticion);
    request.idSeccion = parseInt(req.body.idSeccion);
    request.idNormaTipo = parseInt(req.body.idNormaTipo);
    request.idNormaSubtipo = req.body.idNormaSubtipo ? parseInt(req.body.idNormaSubtipo) : null;
    request.normaNumero = parseInt(req.body.normaNumero);
    request.normaAnio = parseInt(req.body.normaAnio);
    request.normaSumario = String(req.body.normaSumario);
    request.tags = String(req.body.tags);
    request.fechaSugerida = req.body.fechaSugerida;
    request.fechaLimite = req.body.fechaLimite;
    request.fechaDesde = req.body.fechaDesde;
    request.fechaHasta = req.body.fechaHasta;
    request.idTipoProceso = req.body.idTipoProceso;
    request.numeroReparto = req.body.numeroReparto;
    request.procedimiento = String(req.body.procedimiento);
    request.numeroEdicionSubtipo = req.body.numeroEdicionSubtipo;
    request.normaArchivoOriginal = request.normaAcronimoReferencia + '.pdf';
    request.normaDocumento = String(req.body.normaDocumento).trim();
    request.reparticiones = req.body.reparticiones;
    request.siglasReparticiones = req.body.siglasReparticiones;
    request.anexos = [];

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    const archivoNorma = await subirArchivo(req.body.archivo, request?.cuit, process.env.S3_BO_NORMAS + request.normaAcronimoReferencia + '.pdf')
      .catch(e => { throw e })
    request.normaArchivoOriginalS3Key = String(archivoNorma.Key.replace(process.env.S3_BO_NORMAS, ''))

    for (let i = 0; i < req.body.anexos.length; i++) {
      const archivoAnx = await subirArchivo(req.body.anexos[i].base64, request?.cuit, process.env.S3_BO_NORMAS + request.normaAcronimoReferencia + (i === 0 ? '-ANX.pdf' : `-ANX-${i}.pdf`))
        .catch(e => { throw "Error al subir el archivo " + req.body.anexos[i].nombre })
      request.anexos.push({
        normaAnexoDescripcion: null,
        normaAnexoArchivo: request.normaAcronimoReferencia + (i === 0 ? '-ANX.pdf' : `-ANX-${i}.pdf`),
        normaAnexoArchivoS3Key: archivoAnx.Key.replace(process.env.S3_BO_NORMAS, '')
      })
    }

    await crearNorma(request).catch(e => { throw e })

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Solicitud de Norma creada con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: 'PIN: La solicitud no pudo ser cargada.', data: e }))
    res.end();
    return;
  }
}

async function crearFeriadoController(req, res, next) {

  try {
    let request = {};
    request.feriadoFecha = req.body.feriadoFecha;
    request.feriado = req.body.feriado;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await crearFeriado(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Feriado creado con éxito.', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Feriado.", data: String(e) }))
    res.end();
    console.log("error:", e)
    return;
  }
}
async function borrarFeriadoPorIdController(req, res, next) {

  try {
    let request = {};
    request.idFeriado = req.body.idFeriado;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarFeriadoPorId(request)
      .catch((e) => {
        throw e
      });
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Feriado borrado con éxito.', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Feriado.", data: String(e) }))
    res.end();
    console.log("error: ", e)
    return;
  }
}
async function traerFeriadosPorAnioController(req, res, next) {

  try {
    let request = {};
    request.fechaAnio = req.body.fechaAnio;

    let respuesta = await traerFeriadosPorAnio(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Feriados.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Feriados del Año ' + request.fechaAnio + '.', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Feriados.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerFeriadoPorFechaController(req, res, next) {

  try {
    let request = {};
    request.feriadoFecha = req.body.feriadoFecha;

    let respuesta = await traerFeriadoPorFecha(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Feriados.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Feriados del Año ' + request.fechaAnio + '.', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Feriados.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerSumarioItemPorIdController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTipo = req.body.idSumarioNormasTipo;

    let respuesta = await traerSumarioItemPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerSeccionPorIdController(req, res, next) {

  try {
    let request = {};
    request.idSeccion = req.body.idSeccion;

    let respuesta = await traerSeccionPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer Seccion.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Seccion:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Seccion.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearSumarioItemController(req, res, next) {

  try {
    let request = {};
    request.idSeccion = req.body.idSeccion;
    request.idNormaTipo = req.body.idNormaTipo;
    request.normaTipoOrden = req.body.normaTipoOrden;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await crearSumarioItem(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearSumarioSubtipoController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTipo = req.body.idSumarioNormasTipo;
    request.idNormaSubtipo = req.body.idNormaSubtipo;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearSumarioSubtipo(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function borrarSumarioSubtipoController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTiposSubtipo = req.body.idSumarioNormasTiposSubtipo;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarSumarioSubtipo(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}
async function reactivarSumarioSubtipoController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTiposSubtipo = req.body.idSumarioNormasTiposSubtipo;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await reactivarSubtipo(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearSumarioReparticionController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTipo = req.body.idSumarioNormasTipo;
    request.idReparticion = req.body.idReparticion;
    request.idSeccion = req.body.idSeccion;
    request.idUsuario = req.body.idUsuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearSumarioReparticion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function borrarSumarioReparticionController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTiposReparticion = req.body.idSumarioNormasTiposReparticion;
    request.idSumarioSeccionReparticiones = req.body.idSumarioSeccionReparticiones;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarSumarioReparticion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Item Sumario creado con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Item Sumario.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearSeccionController(req, res, next) {

  try {
    let request = {};
    request.seccion = req.body.seccion ? req.body.seccion : null;
    request.seccionSigla = req.body.seccionSigla ? req.body.seccionSigla : null;
    request.seccionOrden = req.body.seccionOrden ? req.body.seccionOrden : null;
    request.es_poder = req.body.es_poder;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await crearSeccion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al crear Sección.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección creada con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Sección.", data: String(e) }))
    res.end();
    return;
  }
}

async function mostrarSeccionController(req, res, next) {

  try {
    let request = {};
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await mostrarSeccion()
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar Sección.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección mostrada con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al mostrar Sección.", data: String(e) }))
    res.end();
    return;
  }
}

async function borrarSeccionController(req, res, next) {

  try {
    let request = {};
    request.idSeccion = req.body.idSeccion
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarSeccion(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección borrada con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
    res.end();
    return;
  }
}

async function borrarSeccionPorIdController(req, res, next) {

  try {
    let request = {};
    request.idSeccion = req.body.idSeccion;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarSeccionPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección borrada con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
    res.end();
    return;
  }
}

async function actualizarSeccionPorIdController(req, res, next) {

  try {
    let request = {};
    request.seccion = req.body.seccion;
    request.seccionSigla = req.body.seccionSigla;
    request.seccionOrden = req.body.seccionOrden;
    request.idSeccion = req.body.idSeccion;
    request.es_poder = req.body.es_poder;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await actualizarSeccionPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sección borrada con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sección.", data: String(e) }))
    res.end();
    return;
  }
}

async function borrarSumarioItemPorIdController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTipo = req.body.idSumarioNormasTipo;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await borrarSumarioItemPorId(request)
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sumario Item.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sumario Item borrada con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sumario Item.", data: String(e) }))
    res.end();
    return;
  }
}

async function reactivarSumarioItemPorIdController(req, res, next) {

  try {
    let request = {};
    request.idSumarioNormasTipo = req.body.idSumarioNormasTipo;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await reactivarSumarioItemPorId(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Sumario Item borrada con éxito:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar Sumario Item.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearObservacionController(req, res, next) {

  try {
    let request = {};
    request.idNorma = req.body.idNorma;
    request.observacion = req.body.observacion;
    request.idObservacionMotivo = req.body.idObservacionMotivo;
    request.usuario = req.body.usuario;
    request.idNormasEstadoTipo = 3; // BO OBSERVADA
    let datosEmail = {}
    datosEmail.solicitud = req.body.solicitud
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await crearObservacion(request)
      .then(respuesta => {
        if (respuesta.length > 0 && respuesta[0]?.email && datosEmail) {
          observacion(res, respuesta[0].email, datosEmail)
        }
      })
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Observación creada con éxito:', data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear Observación.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerObservacionesMotivosController(req, res, next) {

  try {

    let respuesta = await traerObservacionesMotivos()
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Motivo traído con éxito:', respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer motivo.", data: String(e) }))
    res.end();
    return;
  }
}

async function revisionController(req, res, next) {
  let request = {}
  request.checkPreRevisado = req.body?.checkPreRevisado
  request.idNorma = req.body?.idNorma

  try {
    let ok = await revision(request)
      .catch((e) => {
        throw (e)
      })
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Revisado con éxito:', ok }))
    res.end();
    return;
  } catch (error) {
    console.log(error)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al revisar.", data: String(error) }))
    res.end();
    return;
  }
}

async function traerPrioridadesController(req, res, next) {
  try {
    let respuesta = await traerPrioridades()
      .catch((e) => {
        res.status(409)
        res.send(JSON.stringify({ mensaje: "PIN: Error al traer prioirdades.", data: String(e) }))
        res.end();
        return;
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Prioirdades traídas con éxito:', respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer prioridades.", data: String(e) }))
    res.end();
    return;
  }
}

async function asignarPrioridadController(req, res, next) {

  try {
    let request = {};
    request.idPrioridadTipo = parseInt(req.body.idPrioridadTipo);
    request.idUsuario = req.body.idUsuario;
    request.idNorma = parseInt(req.body.idNorma);
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await asignarPrioridad(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Prioirdad asignada con éxito:', request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al asignar prioridad.", data: String(e) }))
    res.end();
    return;
  }
}

async function cotizarNormaController(req, res, next) {
  try {
    let request = {};
    request.valorCotizacion = parseFloat(req.body.valorCotizacion);
    request.idNorma = parseInt(req.body.idNorma);
    request.idNormasEstadoTipo = 6;
    request.usuario = req.body.usuario;
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let respuesta = await cotizarNorma(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Norma cotizada con éxito:', request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al cotizar norma.", data: String(e) }))
    res.end();
    return;
  }
}

async function aprobarNormaParaCotizacionController(req, res, next) {
  try {
    let request = {};
    request.idNorma = parseInt(req.body.idNorma);
    request.idNormasEstadoTipo = parseInt(req.body.idNormasEstadoTipo);
    request.usuario = parseInt(req.body.usuario);

    let respuesta = await aprobarNormaParaCotizacion(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Norma cotizada con éxito:', request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al cotizar norma.", data: String(e) }))
    res.end();
    return;
  }
}

async function aprobarNormaController(req, res, next) {
  try {
    let request = {};
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    request.idNorma = parseInt(req.body.idNorma);
    request.idNormasEstadoTipo = 7;
    request.usuario = parseInt(req.body.usuario);
    request.fechaPublicacion = String(req.body.fechaPublicacion)
    request.numeroBUI = String(req.body.numeroBUI)

    let boletines = await existeBoletinPorFecha(request.fechaPublicacion)
      .catch((e) => {
        throw e
      });

    //Pone el Estado en BO_EN_REDACCION si ya hay un boletin para esa fecha
    if (boletines.length > 0 && boletines.find((n) => n.idBoletinEstadoTipo === 1)) {
      const index = boletines.findIndex((n) => n.idBoletinEstadoTipo === 1)
      request.idNormasEstadoTipo = 8;
      request.idBoletin = boletines[index].idBoletin;
    }

    await aprobarNorma(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Norma aprobada con éxito:', request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al aprobar norma.", data: String(e) }))
    res.end();
    return;
  }
}

async function desaprobarNormaController(req, res, next) {
  try {
    let request = {};
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    request.idNorma = parseInt(req.body.idNorma);
    request.idNormasEstadoTipo = 1; //debe volver a en_redaccion
    request.usuario = parseInt(req.body.usuario);

    await desaprobarNorma(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Norma desaprobada con éxito:', request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al aprobar norma.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerObservacionesPorIdUsuarioController(req, res, next) {
  try {
    let request = {};
    request.idUsuario = parseInt(req.body.idUsuario);

    let respuesta = await traerObservacionesPorIdUsuario(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Observaciones propias traídas con éxito:', respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer Observaciones propias.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerObservacionesDeReparticionesDelUsuarioController(req, res, next) {

  try {
    const usuario = req.body.usuario;
    const idUsuario = req.body.idUsuario
    let request = {};
    request.usuario = usuario;
    request.idUsuario = idUsuario;
    let repas = {};

    await traerReparticionesUsuario(request)
      .then(
        (response) => {
          if (response.lenght === 0) {
            throw "El usuario no tiene reparticiones asignadas"
          }
          else {
            repas = JSON.parse(response[0].usuarioReparticiones)
          }

        }
      )
      .catch((e) => {
        throw "PIN: Error al traer Normas de Reparticiones del Usuario."
      });

    let normasRepas = []

    for await (const repa of repas) {

      let requestB = {};
      requestB.idOrgJerarquia = repa.idOrgJerarquia;
      requestB.idUsuario = idUsuario

      const nnn = await traerNormasDeReparticiones(requestB);
      for await (const n of nnn) {
        console.log(n)
        normasRepas.push(n)
      }
    }

    let observaciones = []

    for await (const norma of normasRepas) {
      let requestC = {
        idNorma: norma.idNorma
      }

      const observacionesQuery = await traerObservacionPorIdNorma(requestC);
      for await (const o of observacionesQuery) {
        observaciones.push(o)
      }
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Observaciones de Reparticiones del Usuario.', data: observaciones }))
    res.end();
    return;

  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Observaciones de Reparticiones del Usuario.", data: String(e) }))
    res.end();
    return;
  }
}

async function crearBoletinController(req, res, next) {

  let request = {};
  request.usuario = req.body.usuario;
  request.fechaPublicacion = req.body.fechaPublicacion;
  request.boletinSecciones = { secciones: [] }
  request.boletinNombre = null;
  request.boletinNumero = null;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await traerNormasPorFechaPublicacionOrdenadasPorSumario(request.fechaPublicacion)
      .then(results => {
        request.normas = results.filter(n => n.fechaLimite !== null && n.fechaSugerida !== null).map(n => n.idNorma)
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer normas para el boletin.", data: String(e) })
      });

    await traerSecciones()
      .then(results => {
        for (const seccion of results) {
          request.boletinSecciones.secciones.push(seccion.idSeccion)
        }
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer secciones para el boletin.", data: String(e) })
      });

    JSON.stringify(request.secciones);

    await crearBoletin(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al crear Boletin Oficial.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletin Oficial para la fecha ${request.fechaPublicacion} creado con éxito:`, request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e.data.slice(0, 100))
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al Crear Boletin Oficial para la fecha ${req.body.fechaPublicacion}.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerNormasPorFechaLimiteController(req, res, next) {
  try {
    let request = {};
    request.usuario = req.body.usuario;
    request.fechaLimite = (req.body.fechaLimite).split('T')[0];

    let respuesta = await traerNormasPorFechaLimite(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Normas:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer las normas.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerNormasBoletinDesdeHastaController(req, res, next) {
  try {
    let request = {};
    request.usuario = req.body.usuario;
    request.fechaPublicacionDelBoletin = req.body.fechaPublicacion;

    let respuesta = await traerNormasBoletinDesdeHasta(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Normas:', data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer las normas.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerBoletinesEnEdicionController(req, res, next) {
  try {
    let request = {};
    //Paginacion (viene tambien en el req.body)
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;

    let { totalBoletines, boletines } = await traerBoletinesEnEdicion(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Boletines:', data: boletines, totalBoletines: totalBoletines[0]['COUNT(a.idBoletin)'] }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer los boletines.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerVistaPreviaNormaController(req, res, next) {
  try {
    let request = {}
    request.idNorma = req.body.idNorma;

    let respt = await traerNormaParaPDF(request)
      .catch((e) => {
        throw e
      });

    if (respt.meta) {

      request.norma = respt.meta[0].normaDocumento

      let pdfVistaPrevia = await traerVistaPreviaNorma(request)
        .catch((e) => {
          throw e
        });

      res.status(200)
      res.send(pdfVistaPrevia)
      res.end();
      return;
    }
    else {
      throw new Error('sin norma')
    }
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al generar Vista Previa del Norma.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerVistaPreviaBoletinController(req, res, next) {
  try {
    let request = {}
    request.idBoletin = req.body.idBoletin;

    let respt = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

    if (respt.normas) {
      request.normas = respt.normas
      request.fechaPublicacion = respt.meta[0].fechaPublicacion;
      request.boletinNumero = respt.meta[0].boletinNumero;

      let pdfVistaPrevia = await traerVistaPreviaBoletin(request)
        .catch((e) => {
          throw e
        });

      res.status(200)
      //res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfVistaPrevia.length })
      res.send(pdfVistaPrevia)
      res.end();
      return;
    }
    else {
      throw new Error('Boletín sin normas')
    }


  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al generar Vista Previa del Boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerVistaPreviaDocBoletinController(req, res, next) {
  try {
    let request = {}
    request.idBoletin = req.body.idBoletin;

    let respt = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

    if (respt.normas) {
      request.normas = respt.normas
      request.fechaPublicacion = respt.meta[0].fechaPublicacion;
      request.boletinNumero = respt.meta[0].boletinNumero;

      let docVistaPrevia = await traerVistaPreviaDocBoletin(request)
        .catch((e) => {
          throw e
        });

      res.status(200)
      //res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfVistaPrevia.length })
      res.send(docVistaPrevia)
      res.end();
      return;
    }
    else {
      throw new Error('sin normas')
    }


  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al generar Vista Previa del Boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerNormasDeUnBoletinController(req, res, next) {
  try {
    let request = {};
    request.idBoletin = req.body.idBoletin;
    //request.fechaPublicacion = req.body.fechaPublicacion;

    let respt = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

    respt.anexos = [];
    if (respt?.normas?.length > 0) {
      for (const n of respt.normas) {
        await traerAnexosPorIdNorma(n)
          .then(response => {
            if (response.length > 0) {
              respt.anexos = [...respt.anexos, ...response]
            }
          })
          .catch((e) => {
            throw ({ mensaje: "PIN: Error al traer Anexos.", data: e })
          });
      }
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: "Normas del Boletin.", data: respt }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer normas del boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerBoletinPorIdController(req, res, next) {
  try {
    let request = {};
    request.idBoletin = req.body.idBoletin;

    let respuesta = await traerBoletinPorId(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: "Boletin.", data: respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerNormasPorFechaPublicacionSeccionController(req, res, next) {
  try {
    let request = {};
    request.fechaPublicacion = req.body.fechaPublicacion;
    request.seccion = req.body.seccion;
    let respt = await traerNormasPorFechaPublicacionSeccion(request)
      .catch((e) => {
        throw e
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: "Normas del Boletin.", data: respt }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer normas del boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function editarBoletinController(req, res, next) {

  let request = {};
  request.usuario = req.body.usuario;
  request.idBoletin = req.body.idBoletin;
  request.idBoletinEstadoTipo = req.body.idBoletinEstadoTipo;
  request.fechaPublicacion = req.body.fechaPublicacion;
  request.normas = req.body.normas;
  request.boletinSecciones = String(req.body.boletinSecciones);
  request.boletinNombre = null;
  request.boletinNumero = null;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {
    let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Boletin Oficial.", data: String(e) })
      });

    request.normasNoAsignadas = boletin.normas.filter(n => (req.body.normas).includes(n) === false);
    request.normasParaAsignar = request.normas.filter(n => !(boletin.normas.includes(n)));

    await editarBoletin(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar Boletin Oficial.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletin Oficial editado con éxito:`, request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al Editar Boletin Oficial ${req.body.idBoletin}.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerAnexosPorIdNormaController(req, res, next) {

  let request = {};
  request.usuario = req.body.usuario;
  request.idNorma = req.body.idNorma;

  try {
    let respuesta = await traerAnexosPorIdNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Anexos.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Anexos:`, respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer anexos.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerEstadosNormasController(req, res, next) {

  try {
    let estados = await traerEstadosNormas()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Estados.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Estados:`, estados }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer estados.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerNormasController(req, res, next) {
  let request = {};
  request.esUsuarioExterno = req.route.path.split('/').slice(-1)[0] === 'externos';
  request.idCuenta = req.usuario.cuenta.idCuenta;
  request.usuario = req.body.usuario;
  request.idUsuario = req.body.idUsuario;
  request.idNorma = req.body.idNorma;
  request.idBoletin = req.body.idBoletin;
  request.boletinNumero = req.body.boletinNumero;
  request.idSeccion = req.body.idSeccion;
  request.normaAcronimoReferencia = req.body.normaAcronimoReferencia;
  request.idReparticion = req.body.idReparticionOrganismo;
  request.idReparticionUsuario = req.usuario.cuenta.idReparticion;
  request.idNormasEstadoTipo = req.body.idNormasEstadoTipo;
  request.normaNumero = req.body.normaNumero;
  request.normaAnio = req.body.normaAnio;
  request.fechaLimite = req.body.fechaLimite;
  request.fechaCarga = req.body.fechaCarga;
  request.fechaSugerida = req.body.fechaSugerida;
  request.fechaAprobacion = req.body.fechaAprobacion;
  request.userCarga = req.body.userCarga;
  request.cuenta = req.body.cuenta;
  request.idNormaTipo = req.body.idNormaTipo;
  request.idNormaSubtipo = req.body.idNormaSubtipo;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
  request.organismoEmisor = req.body.organismoEmisor;

  try {
    let normas;
    let totalNormas;
    await traerNormasConFiltro(request)
      .then(response => {
        normas = response.normas;
        totalNormas = response.totalNormas[0].total;
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

    let anexos = [];
    for (const n of normas) {
      await traerAnexosPorIdNorma(n)
        .then(response => {
          if (response.length > 0) {
            anexos = [...anexos, ...response]
          }
        })
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer Anexos.", data: e })
        });
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, normas, anexos, totalNormas }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerSeparata(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    let normas = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: String(e) })
      });

    /* let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw ({ mensaje: `PIN: Error al traer el Boletin con id:${request.idBoletin}.`, data: String(e) })
      }); */

    let separata = [];

    normas.normas = normas.normas.map(({ idNormasMetadato, idUsuarioCarga, idPrioridadTipo, normaAcronimoReferencia, idReparticionOrganismo, normaTexto,
      normaArchivoOriginal, normaArchivoOriginalS3Key, fechaLimite, fechaSugerida, fechaCarga, fechaBorrado, usuarioBorrado,
      valorCotizacion, numeroBUI, estado, normaDocumento, siglaOrganismo, ...norma }) =>
      norma
    );

    for (const norma of normas.normas) {
      let anexos = await traerAnexosPorIdNorma(norma)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al traer Anexos.", data: String(e) })
        });
      norma.anexos = anexos.map(({ normaAnexoDescripcion, fechaCreacion, fechaBorrado, usuarioCreacion, usuarioBorrado, estado, ...anexo }) =>
        anexo
      );
      separata.push(norma)
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, separata }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer normas.`, data: String(e) }))
    res.end();
    return;
  }
}

async function descargarBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.usuario = req.body.usuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    //Numera contra el anterior Publicado
    let ultimoBoletinPublicado = await traerUltimoBoletinPublicado()
      .catch((e) => {
        throw (e)
      })
    // console.log(ultimoBoletinPublicado)
    if (ultimoBoletinPublicado[0].boletinNumero !== null && ultimoBoletinPublicado[0].idBoletinEstadoTipo === 4) {
      request.boletinNumero = parseInt(ultimoBoletinPublicado[0].boletinNumero) + 1;
    }
    else {
      if (ultimoBoletinPublicado[0].boletinNumero !== null) {
        request.boletinNumero = parseInt(ultimoBoletinPublicado[0].boletinNumero);
      }
      else {
        request.boletinNumero = 1;
      }
    }

    let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      })

    request.fechaPublicacion = boletin.fechaPublicacion;
    request.normas = boletin.normas;
    request.boletinSecciones = boletin.boletinSecciones;

    let normas = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw (e)
      })

    let htmlBoletin;
    if (normas.normas) {
      htmlBoletin = await generarHTMLBoletin(normas.normas)
        .catch((e) => {
          throw (e)
        })
    }
    else {
      htmlBoletin = await generarHTMLBoletin([])
        .catch((e) => {
          throw (e)
        })
    }

    /*     let htmlSeparata = await generarHTMLSeparata(normas.normas)
          .catch((e) => {
            throw (e)
          }) */

    request.boletinDocumento = String(htmlBoletin);

    await descargarBoletin(request)
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletin descargado con éxito` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al descargar boletín.`, data: String(e) }))
    res.end();
    return;
  }
}

async function anularDescargaBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.idBoletinEstadoTipo = 1;
  request.usuario = req.body.usuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    const boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      });

    request.fechaPublicacion = boletin.fechaPublicacion;
    request.normas = boletin.normas;
    request.boletinSecciones = boletin.boletinSecciones;

    await anularDescargaBoletin(request)
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Descarga anulada con éxito` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al anular descarga.`, data: String(e) }))
    res.end();
    return;
  }
}

async function anularFirmaBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.idBoletinEstadoTipo = 2;
  request.usuario = req.body.usuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    const boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      });

    request.boletinNormas = JSON.parse(boletin[0].boletinNormas);

    await anularFirma(request)
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Firma anulada con éxito` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al anular Firma.`, data: String(e) }))
    res.end();
    return;
  }
}

async function borrarBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.usuario = req.body.usuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await borrarBoletin(request)
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletin borrado con éxito` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al borrar Boletin.`, data: String(e) }))
    res.end();
    return;
  }
}

// Firma "Manual": usa los documentos que subió el usuario ya firmados
async function firmarBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.idBoletinEstadoTipo = 3;
  request.usuario = req.body.usuario;
  request.idUsuario = req.body.usuario;
  request.cuit = req.body.cuit;
  request.anexos = req.body.anexos;
  request.normas = [];
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    let boletin = await traerBoletinPorId(request)

    request.fechaPublicacion = boletin.fechaPublicacion;
    request.normas = boletin.normas;
    request.boletinSecciones = JSON.parse(boletin.boletinSecciones);
    request.boletinNombre = boletin.boletinNombre;
    request.boletinNumero = boletin.boletinNumero;
    request.boletinDocumento = boletin.boletinDocumento;

    let momentoActual = moment().format("DDMMYYYYHHmmss");

    console.log("Obteniendo data de normas...")
    //Traigo la data de las normas para publicarlas
    for (let i = 0; i < request.normas.length; i++) {
      let idNorma = parseInt(request.normas[i]);

      console.log("Obteniendo norma por id...")
      let normaCompleta = await traerNormaPorId({ idNorma })

      console.log("Obteniendo los anexos de la norma...")
      let anexosNorma = await traerAnexosPorIdNorma({ idNorma })

      console.log("Obteniendo la digitalización de la norma...")
      const digi = await traerDigitalizacionPorIdNorma({ idNorma });
      
      console.log("Obteniendo la vista previa de la norma...")
      let pdfNorma = await traerVistaPreviaNorma({ norma: digi.normaDocumento })

      // pdfNorma = 'data:application/pdf;base64,' + pdfNorma;
      let nombrePdfSinRuta = normaCompleta[0].normaAcronimoReferencia + `-${request.boletinNumero}-${momentoActual}.pdf`
      let nombrePdfNormaS3 = process.env.S3_BO_FIRMADOS + normaCompleta[0].normaAcronimoReferencia + `-${request.boletinNumero}-${momentoActual}.pdf`

      console.log("SUBIENDO: pdf de la norma al bucket")
      const pdfNormaS3 = await subirPdfBucketS3(pdfNorma, request.cuit, nombrePdfNormaS3, true)

      normaCompleta[0].pdfNormaS3 = normaCompleta[0].normaAcronimoReferencia + `-${request.boletinNumero}-${momentoActual}.pdf`;

      console.log("entrando al bucle en busca de anexos para copiarlos...")
      for (let j = 0; j < anexosNorma.length; j++) {
        console.log(`en proceso de copiar anexos... ${j}/${anexosNorma.length}`)
        let nombreAnexo = normaCompleta[0].normaAcronimoReferencia + `-${request.boletinNumero}-${momentoActual}` + (j === 0 ? '-ANX.pdf' : `-ANX-${j}.pdf`)
        
        console.log(`Copiando`)
        await copiarArchivo(process.env.S3_BO_NORMAS + anexosNorma[j].normaAnexoArchivoS3Key, process.env.S3_BO_FIRMADOS + nombreAnexo)

        console.log("copiado, paso al siguiente...")
        anexosNorma[j].archivoPublico = nombreAnexo;
      }

      normaCompleta[0].anexos = anexosNorma;

      request.normas[i] = normaCompleta[0];
    }

    console.log("SUBIENDO: boletin firmado al bucket...")
    let boletinFirmado = await subirPdfBucketS3(req.body.archivoBoletin.base64[1], request.cuit, process.env.S3_BO_FIRMADOS + moment(request.fechaPublicacion).format('YYYYMMDD') + momentoActual + '.pdf', true)
    console.log("bueno ahora sigo con el proceso, abajo esta el request")
    request.boletinFirmado = moment(request.fechaPublicacion).format('YYYYMMDD') + momentoActual + '.pdf';
    //Separata y otros anexos del boletin
    console.log("entro a buscar las separatas...")
    if (request.anexos.length > 0) {
      for (let i = 0; i < request.anexos.length; i++) {
        let nombre_del_anexo = moment(request.fechaPublicacion).format('YYYYMMDD') + momentoActual + (request.anexos[i].principal ? `ax.pdf` : request.anexos[i].archivo);
        console.log("SUBIENDO: Separata con el nombre del anexo -> " + nombre_del_anexo)
        let anexoS3 = await subirPdfBucketS3(request.anexos[i].base64[1], request.cuit, process.env.S3_BO_FIRMADOS + nombre_del_anexo, true) // agrego la ruta porque sino guarda en el path general "/"
        request.anexos[i].archivoS3 = anexoS3['Key'].replace(process.env.S3_BO_FIRMADOS, '');
      }
    }
    console.log("Firmando boletin...")
    await firmarBoletin(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletin firmado con éxito.` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al firmar Boletin.`, data: String(e) }))
    res.end();
    return;
  }
}

// Firma "Automatica": realiza la firma por integración con GEDO
async function firmarBoletinGEDOController(req, res, next) {
  let progreso = []
  const enviarMensaje = (msg) => {
    progreso.push(msg)
  };

  console.log("-----------Firma BO con Integración GEDO-------------")
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.idBoletinEstadoTipo = 3;
  request.usuario = req.body.usuario;
  request.idUsuario = req.body.usuario;
  request.cuit = req.body.cuit;
  let pdfBoletin = '';
  let pdfSeparata = '';

  let momentoActual = moment().format("DDMMYYYYHHmmss");


  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    //1.Trae metadatos actuales del BO
    
    console.log("Obteniendo metadatos del Boletín Oficial...")
    enviarMensaje("Obteniendo metadatos del Boletín Oficial...")
    let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      })
    request.fechaPublicacion = boletin.fechaPublicacion;
    // request.boletinNormas = boletin.normas;
    request.boletinSecciones = JSON.parse(boletin.boletinSecciones);
    request.boletinNombre = boletin.boletinNombre;
    request.boletinNumero = boletin.boletinNumero;
    request.boletinDocumento = boletin?.boletinDocumento || null;
    request.anexos = [];

    console.log("Obteniendo el PDF del Boletín Oficial...")
    enviarMensaje("Obteniendo el PDF del Boletín Oficial...")
    //2. Trae el pdf del Boletin
    let htmlBoletin = await traerHTMLDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

      console.log("Obteniendo normas ordenadas del Boletín Oficial...")
      enviarMensaje("Obteniendo normas ordenadas del Boletín Oficial...")
    let normas = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw (e)
      })

    if (htmlBoletin && normas) {
      console.log("Documento y normas obtenidas, procesando datos...")
      enviarMensaje("Documento y normas obtenidas, procesando datos...")
      request.htmlBoletin = htmlBoletin[0].boletinDocumento;
      request.normas = normas.normas;

      for (let i = 0; i < request.normas.length; i++) {
        console.log(`Cargando normas... (${i}/${request.normas.length})`)
        enviarMensaje(`Cargando normas...`)

        let idNorma = parseInt(request.normas[i].idNorma);

        console.log("Obteniendo la digitalización de la norma...")
        enviarMensaje("Obteniendo la digitalización de la norma...")
        const digi = await traerDigitalizacionPorIdNorma({ idNorma });

        console.log("Obteniendo la vista previa de la norma...")
        enviarMensaje("Obteniendo la vista previa de la norma...")
        let pdfNorma = await traerVistaPreviaNorma({ norma: digi.normaDocumento, boletin: boletin })
        //  pdfNorma = 'data:application/pdf;base64,' + pdfNorma;

        console.log("Asignando el nombre del archivo de la norma...")
        enviarMensaje("Asignando el nombre del archivo de la norma...")
        let nombre_norma = request.normas[i].normaAcronimoReferencia + `-${request.boletinNumero}-${momentoActual}.pdf`;

        console.log("Subiendo el pdf al bucket...")
        enviarMensaje("Subiendo el PDF al almacenamiento del bucket...")
        const pdfNormaS3 = await subirPdfBucketS3(pdfNorma, request.cuit, process.env.S3_BO_FIRMADOS + nombre_norma, true)

        // Manejo el error si no se puede subir un archivo (accion limitante para continuar, ya que se pierde info)
        .catch(e=>{
          console.error(`Error en subir al bucket el archivo de la norma:${request.normas[i]}`,e)
          enviarMensaje(`Error en subir al bucket el archivo de la norma:${request.normas[i]}`)
          res.status(409)
          res.send(JSON.stringify({ mensaje: `Error al subir el archivo de la norma: ${request.normas[i].idNorma}`, error: String(e), exito:false,progreso:progreso}))
          res.end();
          return;
        })

        request.normas[i].pdfNormaS3 = nombre_norma;

        console.log("Obteniendo anexos de la norma...")
        enviarMensaje("Obteniendo anexos de la norma...")
        let anexos = await traerAnexosPorIdNorma({ idNorma })

        if (anexos.length > 0) {
          for (let index = 0; index < anexos.length; index++) {
            let nombreAnexo = request.normas[i].normaAcronimoReferencia + `-${request.boletinNumero}` + (index === 0 ? `-ANX-${momentoActual}.pdf` : `-ANX-${index}-${momentoActual}.pdf`)

            // copiarArchivo que retorne true si salio bien, false si ocurrio un error
            let copiaExitosa = await copiarArchivo(process.env.S3_BO_NORMAS + anexos[index].normaAnexoArchivoS3Key, process.env.S3_BO_FIRMADOS + nombreAnexo)

            // Si sale mal la copia, corto el proceso, y envio al front donde fallo (que archivo)
            if (!copiaExitosa.copiaS3) {
              console.error(`Error al copiar el anexo de la norma ${anexos[index]?.idNorma}: ${nombreAnexo}`);
              enviarMensaje(`Error al copiar el archivo de la norma ${anexos[index]?.idNorma} : ${nombreAnexo}`);
              res.status(409)
              res.send(JSON.stringify({ mensaje: `No se encontro el anexo de la norma ${anexos[index].idNorma} :${nombreAnexo}`, error: String(copiaExitosa.error), progreso:progreso,exito:false }))
              res.end();
              return;
            }

            anexos[index].archivoPublico = nombreAnexo;
          }

        }
        request.normas[i].anexos = anexos;
      }
      console.log("PROCESO TERMINADO: Obteniendo la vista previa del Boletín Oficial...")
      enviarMensaje("Obteniendo la vista previa del Boletín Oficial...")
      pdfBoletin = await traerVistaPreviaBoletin(request)
        .catch((e) => {
          throw e
        });
    }

    //3. Trae el pdf de la Separata
    console.log("Obteniendo el PDF de la separata...")
    enviarMensaje("Obteniendo el PDF de la Separata...")
    pdfSeparata = await traerSeparataPDF(request)
      .catch((e) => {
        throw e
      });


    //4. Manda a firmar el BO por integracion GEDO
    console.log("Obteniendo la firma de GEDO al Boletín...")
    enviarMensaje("Obteniendo la firma de GEDO al Boletín...")
    let boletinGEDO = await firmaDirectaDocumento(pdfBoletin, 'BO', request.cuit)
      .catch((e) => {
        throw (e)
      })

    //5. Manda a firmar separata
    console.log("Obteniendo la firma de GEDO a la separata...")
    enviarMensaje("Obteniendo la firma de GEDO a la separata...")
    let separataGEDO = await firmaDirectaDocumento(pdfSeparata, 'SEPBO', request.cuit)
      .catch((e) => {
        throw (e)
      })

    console.log("Comprobando si el boletín tiene segunda edición...")
    enviarMensaje("Comprobando si el boletín tiene segunda edición...")
    let esSegundaEdicion = await traerBoletinPorFechaPublicacion({ fechaPublicacion: request.fechaPublicacion })
    let nombreBoletin = moment(boletin.fechaPublicacion).format('YYYYMMDD');
    if (esSegundaEdicion?.length > 0) {
      nombreBoletin += boletin.boletinNumero;
    }


    //6. Sube pdf's al Bucket
    console.log("Subiendo los PDF al bucket...")
    enviarMensaje("Subiendo los PDF al bucket...")
    let archivoBoletinSinRuta = nombreBoletin + momentoActual
    let nombreArchivoBoletin = process.env.S3_BO_FIRMADOS + nombreBoletin + momentoActual
    await subirPdfBucketS3(boletinGEDO.base64, request.cuit, nombreArchivoBoletin + '.pdf', true) // aca hago unico el archivo q subo al s3
      .catch((e) => {
        throw (e)
      });

    await subirPdfBucketS3(separataGEDO.base64, request.cuit, nombreArchivoBoletin + "ax.pdf", true) // aca hago unico el archivo q subo al s3
      .catch((e) => {
        throw (e)
      });

    request.boletinFirmado = archivoBoletinSinRuta + '.pdf';
    request.anexos.push({
      nombre: null,
      archivo: archivoBoletinSinRuta + "ax.pdf",
      archivoS3: archivoBoletinSinRuta + "ax.pdf",
      principal: 1
    })

    //7. Actualizacion de estado y metadatos en la DB
    console.log("Actualizando el estado del boletín...")
    enviarMensaje("Actualizando el estado del boletín...")
    await firmarBoletin(request)
      .catch((e) => {
        throw (e)
      });

    return res.status(200).send(JSON.stringify({ mensaje: `PIN: Boletin firmado con éxito`, exito: true, progreso}))
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al firmar Boletin.`, data: String(e), progreso }))
    res.end();
    return;
  }
}

async function publicarBoletinController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;
  request.usuario = req.body.usuario;
  request.idUsuario = req.body.usuario;
  request.normas = [];
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      })

    request.fechaPublicacion = boletin.fechaPublicacion;
    request.normas = boletin.normas;
    request.boletinSecciones = JSON.parse(boletin.boletinSecciones);

    let { normas } = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw (e)
      })
    // await copiarArchivo(process.env.S3_BO_FIRMADOS + boletin.boletinFirmado, process.env.S3_BO_PUBLICO + moment(boletin.fechaPublicacion).format('YYYYMMDD') + '.pdf')
    await copiarArchivo(process.env.S3_BO_FIRMADOS + boletin.boletinFirmado, process.env.S3_BO_PUBLICO + boletin.boletinFirmado)

    //Copio los anexos
    for (let index = 0; index < boletin.anexos.length; index++) {
      // await copiarArchivo(process.env.S3_BO_FIRMADOS + boletin.anexos[index].archivoS3, process.env.S3_BO_PUBLICO + moment(boletin.fechaPublicacion).format('YYYYMMDD') + `ax${index + 1}.pdf`)
      await copiarArchivo(process.env.S3_BO_FIRMADOS + boletin.anexos[index].archivoS3, process.env.S3_BO_PUBLICO + boletin.anexos[index].archivoS3)
    }

    //Copio los documentos de la carpeta de firmados a la carpeta pública
    for (let index = 0; index < normas.length; index++) {
      await copiarArchivo(process.env.S3_BO_FIRMADOS + normas[index].archivoPublicado, process.env.S3_BO_PUBLICO + normas[index].archivoPublicado)
      let anexos = await traerAnexosPorIdNorma({ idNorma: normas[index].idNorma })
      if (anexos.length > 0) {
        for (let index = 0; index < anexos.length; index++) {
          await copiarArchivo(process.env.S3_BO_FIRMADOS + anexos[index].archivoPublico, process.env.S3_BO_PUBLICO + anexos[index].archivoPublico)
        }

      }
    }

    await publicarBoletin(request) //También cambia estado de las normas a BO_PUBLICADO
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Boletín publicado con éxito` }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al publicar Boletín.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerBoletinPDFController(req, res, next) {
  try {
    let request = {}
    request.idBoletin = req.body.idBoletin;
    request.fechaPublicacion = req.body.fechaPublicacion;
    request.boletinNumero = req.body.boletinNumero;

    let respt = await traerHTMLDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

    let normas = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw (e)
      })


    if (respt) {


      request.htmlBoletin = respt[0].boletinDocumento
      request.normas = normas.normas

      //request.htmlSeparata = respt[0].separataDocumento


      let pdfVistaPrevia = await traerVistaPreviaBoletin(request)
        .catch((e) => {
          throw e
        });

      res.status(200)
      //res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfVistaPrevia.length })
      res.send(pdfVistaPrevia)
      res.end();
      return;
    }
    else {
      throw new Error('Error en la creación del boletín')
    }


  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al generar Vista Previa del Boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerSeparataPDFController(req, res, next) {
  try {
    let request = {}
    request.idBoletin = req.body.idBoletin;
    request.fechaPublicacion = req.body.fechaPublicacion;
    request.boletinNumero = req.body.boletinNumero;

    let respt = await traerHTMLDeUnBoletin(request)
      .catch((e) => {
        throw e
      });

    let normas = await traerNormasOrdenadasDeUnBoletin(request)
      .catch((e) => {
        throw (e)
      })


    if (respt) {
      //request.htmlSeparata = respt[0].separataDocumento
      request.normas = normas.normas

      //request.htmlSeparata = respt[0].separataDocumento


      let pdfVistaPrevia = await traerSeparataPDF(request)
        .catch((e) => {
          throw e
        });

      res.status(200)
      //res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfVistaPrevia.length })
      res.send(pdfVistaPrevia)
      res.end();
      return;
    }
    else {
      throw new Error('Error en la creación del boletín')
    }


  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al generar Vista Previa del Boletín.", data: String(e) }))
    res.end();
    return;
  }
}

async function traerDocumentosPublicadosController(req, res, next) {
  let request = {};
  request.idBoletin = req.body.idBoletin;

  try {

    let boletin = await traerBoletinPorId(request)
      .catch((e) => {
        throw (e)
      })

    request.fechaPublicacion = boletin.fechaPublicacion;
    request.normas = boletin.normas;
    request.boletinSecciones = boletin.boletinSecciones;
    request.boletinNombre = boletin.boletinNombre;
    request.boletinNumero = boletin.boletinNumero;
    request.boletinDocumento = boletin.boletinDocumento;
    request.anexos = boletin.anexos;

    let documentos = await traerDocumentosPublicados(request)
      .catch((e) => {
        throw (e)
      });

    res.status(200)
    res.send(documentos)
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer documentos del Boletin.`, data: String(e) }))
    res.end();
    return;
  }
}

async function reemplazarDocumentoController(req, res, next) {
  let request = {};
  request.documento = req.body.documento;
  request.base64 = req.body.base64;
  request.nombreArchivo = req.body.nombreArchivo;
  request.cuit = req.body.cuit;
  request.usuario = req.body.usuario;
  request.idUsuario = req.body.usuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    let archivoBucket = await subirPdfBucketS3(request.base64, request.cuit, request.nombreArchivo)
      .catch((e) => {
        throw (e)
      });

    switch (true) {
      case (request.documento).hasOwnProperty('archivoBoletin'):
        request.archivoBoletin = archivoBucket['Key'];
        await republicarBoletin(request)
          .catch((e) => {
            throw (e)
          });
        break;

      case (request.documento).hasOwnProperty('archivoAnexo'):
        request.archivoAnexo = archivoBucket['Key'];
        await republicarSeparata(request)
          .catch((e) => {
            throw (e)
          });
        break;

      case (request.documento).hasOwnProperty('archivoNorma'):
        /* let norma = traerNormaPorId(request.documento)
          .catch((e) => {
            throw (e)
          });
        console.log(norma) */
        request.archivoNorma = archivoBucket['Key'];
        await republicarNorma(request)
          .catch((e) => {
            throw (e)
          });
        break;
    }

    res.status(200)
    res.send()
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer documentos del Boletin.`, data: String(e) }))
    res.end();
    return;
  }
}

async function editarFechaLimiteController(req, res, next) {
  let request = {};
  request.normas = '(' + ([...req.body.normas]).join(',') + ')';
  request.fechaLimite = req.body.fechaLimite;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await editarFechaLimite(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Normas modificadas con éxito.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al editar la fecha limite de las normas.`, data: String(e) }))
    res.end();
    return;
  }
}

async function asociarAvisoController(req, res, next) {
  let request = {};
  request.idNormaAviso = req.body.idNormaAviso;
  request.motivoAsociacion = req.body.motivoAsociacion;
  request.idNorma = req.body.idNorma;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    const aviso = await traerAvisoAsociado(request)
      .catch(e => {
        throw e
      })

    if (aviso.length > 0) {
      throw ('Ya existe un aviso asociado a la norma')
    }

    await asociarAviso(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Normas asociadas con éxito.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al asociar el aviso ${request.idNormaAviso} con la norma ${request.idNorma}.`, data: String(e) }))
    res.end();
    return;
  }
}

async function revisarNormaController(req, res, next) {
  let request = {};
  request.idNorma = req.body.idNorma;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await revisarNorma(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Norma revisada con éxito.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al registrar la revisión de la norma.`, data: String(e) }))
    res.end();
    return;
  }
}

async function ultimosUsuariosEdicionController(req, res, next) {
  let request = {};
  request.idNorma = req.body.idNorma;
  request.idUsuario = req.body.idUsuario;
  fechaHora = moment().subtract(5, "minutes").format('YYYY-MM-DD HH:mm:ss');

  try {

    const ingresos = await traerUsuariosActivosPorIdNorma(request)
      .catch((e) => {
        throw (e)
      })

    let edicionNormaBO = {};
    let ultimosUsuarios = [];

    if (ingresos.length > 0) {
      edicionNormaBO = (JSON.parse(ingresos[0].edicionNormaBO)).ingresos;

      for (const ingreso of edicionNormaBO) {
        //Lo agrego si está dentro de los úlitmos 5 min. y no está repetido el usuario
        if (ingreso.fechaIngreso >= fechaHora && !(ultimosUsuarios.map(n => n.idUsuario).includes(ingreso.idUsuario))) {
          ultimosUsuarios.push(ingreso)
        }
      }

    }

    for (const ingreso of ultimosUsuarios) {
      await traerUsuarioPorId({ idUsuario: ingreso.idUsuario })
        .then(datosUsuario => {
          ingreso.apellidoNombre = datosUsuario[0].apellidoNombre
          ingreso.cuit = datosUsuario[0].cuit
        })
        .catch((e) => {
          throw (e)
        })
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Últimos usuarios conectados a la pantalla de Edición.`, data: ultimosUsuarios }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer los ultimos usuarios conectados a la pantalla de Edición.`, data: String(e) }))
    res.end();
    return;
  }
}

async function registrarIngresoEdicionController(req, res, next) {
  let request = {};
  request.idNorma = req.body.idNorma;
  let fechaHora = moment().format('YYYY-MM-DD HH:mm:ss');
  let edicionNormaBO = { idUsuario: req.body.idUsuario, fechaIngreso: fechaHora };
  request.edicionNormaBO = {};
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    const ingresos = await traerUsuariosActivosPorIdNorma(request)
      .catch((e) => {
        throw (e)
      })

    if (ingresos.length > 0) {
      ingresos[0].edicionNormaBO = (JSON.parse(ingresos[0].edicionNormaBO));
      ((ingresos[0].edicionNormaBO).ingresos).push(edicionNormaBO);
      request.edicionNormaBO = ingresos[0].edicionNormaBO;
    }
    else {
      request.edicionNormaBO = { ingresos: [edicionNormaBO] }
    }

    await registrarIngresoEdicion(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Ingreso a la pantalla de Edición registrado.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al registrar el ingreso a la pantalla de Edición.`, data: String(e) }))
    res.end();
    return;
  }
}

async function ordenarSeccionesController(req, res, next) {
  let request = {
    secciones: req.body.secciones,
    usuario: req.body.usuario,
    idUsuario: req.body.idUsuario
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await ordenarSecciones(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Secciones ordenadas.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al ordenar Secciones.`, data: String(e) }))
    res.end();
    return;
  }
}

async function ordenarNormaTiposSumarioController(req, res, next) {
  let request = {
    normaTipos: req.body.normaTipos,
    usuario: req.body.usuario,
    idUsuario: req.body.idUsuario,
    idSeccion: req.body.idSeccion
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await ordenarNormaTiposSumario(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Secciones ordenadas.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al ordenar Secciones.`, data: String(e) }))
    res.end();
    return;
  }
}

async function ordenarSubtiposSumarioController(req, res, next) {
  let request = {
    subtiposNorma: req.body.subtiposNorma,
    usuario: req.body.usuario,
    idUsuario: req.body.idUsuario,
    idSumarioNormasTipo: req.body.idSumarioNormasTipo
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await ordenarSubtiposSumario(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Subtipos ordenados.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al ordenar Subtipos.`, data: String(e) }))
    res.end();
    return;
  }
}
async function ordenarReparticionesSumarioController(req, res, next) {
  let request = {
    reparticiones: req.body.reparticiones,
    usuario: req.body.usuario,
    idUsuario: req.body.idUsuario,
    idSumarioNormasTipo: req.body.idSumarioNormasTipo,
    idSeccion: req.body.idSeccion
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await ordenarReparticiones(request)
      .catch((e) => {
        throw (e)
      })

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Reparticiones ordenadas.`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al ordenar reparticiones.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerTodosNormaTipoController(req, res, next) {

  try {
    let request = {};
    //Paginacion (viene tambien en el req.body)
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;

    const data = await traerTodosNormaTipos(request)
    const totalTipos = data.totalTipos
    const totalPaginas = Math.ceil(totalTipos / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `Tipos de Normas.`, data: data.tipos, totalTipos, totalPaginas }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer todos los tipos de norma.`, data: String(e) }))
    res.end();
    return;
  }
}

async function exportarNormas(req, res, next) {
  let request = {};
  request.idNorma = req.body.idNorma;
  request.idBoletin = req.body.idBoletin;
  request.boletinNumero = req.body.boletinNumero;
  request.idSeccion = req.body.idSeccion;
  request.idReparticionOrganismo = req.body.idReparticionOrganismo;
  request.idNormasEstadoTipo = req.body.idNormasEstadoTipo;
  request.normaNumero = req.body.normaNumero;
  request.normaAnio = req.body.normaAnio;
  request.fechaLimite = req.body.fechaLimite;
  request.fechaCarga = req.body.fechaCarga;
  request.fechaSugerida = req.body.fechaSugerida;
  request.fechaAprobacion = req.body.fechaAprobacion;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.registroHasta - req.body.registroDesde + 1;
  request.offset = req.body.registroDesde - 1;
  //Ordenamiento
  request.campo = 'idNorma';
  request.orden = 'DESC';

  try {
    let normas;
    await traerNormasConFiltro(request)
      .then(response => {
        normas = response.normas.map(({ idNormaAviso, normaTipoSigla, motivoAsociacion, ...n }) => n);
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

    //Crea el excel desde el json de las normas, el 2do param. especifica el orden de las columnas
    let worksheet = XLSX.utils.json_to_sheet(normas, { header: ["idNorma", "normaTipo", "normaNumero", "normaSubtipo", "seccionSigla", "siglaReparticionOrganismo", "siglaReparticion", "normaAnio", "fechaLimite", "fechaSugerida", "fechaDesde", "fechaHasta", "fechaCarga", "normasEstadoTipo"], skipHeader: false });
    //Piso los nombres de las columnas
    XLSX.utils.sheet_add_aoa(worksheet, [["id", "Tipo de Norma", "Número", "Subtipo", "Sección", "Organismo", "Repartición", "Año", "Fecha Límite", "Fecha Sugerida", "Fecha Desde", "Fecha Hasta", "Fecha de Carga", "Estado"]], { origin: "A1" })
    //Config. del ancho de las columnas (en orden)
    worksheet["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    worksheet['!ref'] = worksheet['!ref'].replace('motivoAsociacion', 'Estado');

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Normas BO");

    //Crea el base64 del archivo
    const data = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    res.status(200)
    res.send({ data })
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function exportarBoletines(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.registroHasta - req.body.registroDesde + 1;
  request.offset = req.body.registroDesde - 1;
  //Ordenamiento
  /*   request.campo = 'idNorma';
    request.orden = 'DESC'; */

  try {
    let boletines;
    await traerBoletinesEnEdicion(request)
      .then(response => {
        boletines = response.boletines.map(({ idBoletinEstadoTipo, ...b }) => b)
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer los Boletines.", data: e })
      });

    //Crea el excel desde el json de las normas, el 2do param. especifica el orden de las columnas
    let worksheet = XLSX.utils.json_to_sheet(boletines);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Boletines oficiales");
    //Config. del ancho de las columnas (en orden)
    worksheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    //Crea el base64 del archivo
    const data = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    res.status(200)
    res.send({ data })
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function exportarBoletinesPublicados(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.registroHasta - req.body.registroDesde + 1;
  request.offset = req.body.registroDesde - 1;
  //Ordenamiento
  /*   request.campo = 'idNorma';
    request.orden = 'DESC'; */

  try {
    let boletines;
    await traerBoletinesPublicados(request)
      .then(response => {
        boletines = response.boletines.map(({ idBoletinEstadoTipo, ...b }) => b)
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer los Boletines.", data: e })
      });

    //Crea el excel desde el json de las normas, el 2do param. especifica el orden de las columnas
    let worksheet = XLSX.utils.json_to_sheet(boletines);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Boletines oficiales");
    //Config. del ancho de las columnas (en orden)
    worksheet["!cols"] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 20 }];

    //Crea el base64 del archivo
    const data = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    res.status(200)
    res.send({ data })
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerOrganismosEmisoresController(req, res, next) {
  let request = {};
  request.busqueda = req.body?.busqueda,
    request.paginaActual = req.body?.paginaActual,
    request.limite = req.body?.limite

  let respuesta = await traerOrganismosEmisores(request)
    .catch((e) => {
      console.log(e)
      res.status(409)
      res.send(JSON.stringify({ mensaje: `Error al traer organismos.`, data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Organismos.', data: respuesta?.data, totalOrg: respuesta?.totalOrg[0]['COUNT(idOrgEmisor)'] }))
  res.end();
  return;
}

async function traerOrganismosEmisoresExternoController(req, res, next) {
  let request = {};
  request.busqueda = req.body?.busqueda
  request.paginaActual = req.body?.paginaActual
  request.limite = req.body?.limite
  request.idCuenta = req.body?.idCuenta

  let respuesta = await traerOrganismosEmisoresExterno(request)
    .catch((e) => {
      console.log(e)
      res.status(409)
      res.send(JSON.stringify({ mensaje: `Error al traer organismos.`, data: String(e) }))
      res.end();
      return;
    });

  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Organismos.', data: respuesta?.data}))
  res.end();
  return;
}

async function crearOrganismosEmisoresController(req, res, next) {
  let request = {}
  request.nombre = req.body?.nombre,
    request.sigla = req.body?.sigla

  try {
    let data = await crearOrganismosEmisores(request)
      .then((n) => {
        res.data = n
      })
      .catch((e) => {
        throw (e)
      })
    /* res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Organismos.', data}))
    res.end();
    return;
  } catch (error) {
    
  } */

    res.status(200);
    res.send('{"Pin":' + JSON.stringify(res.data) + '}');
  } catch (error) {
    res.status(400).send(`"message":${JSON.stringify(error)}}`)
  }

}

async function editarOrganismosEmisoresController(req, res, next) {
  let request = {}
  request.nombre = req.body?.nombre,
    request.sigla = req.body?.sigla,
    request.idOrgEmisor = req.body?.idOrgEmisor

  try {
    let data = await editarOrganismosEmisores(request)
      .then((n) => {
        res.data = n
      })
      .catch((e) => {
        throw (e)
      })

    res.status(200);
    res.send('{"Pin":' + JSON.stringify(res.data) + '}');
  } catch (error) {
    res.status(400).send(`"message":${JSON.stringify(error)}}`)
  }

}

async function eliminarOrganismosEmisoresController(req, res, next) {
  let request = {}
  request.idOrgEmisor = req.body?.idOrgEmisor

  try {
    let data = await eliminarOrganismosEmisores(request)
      .then((n) => {
        res.data = n
      })
      .catch((e) => {
        throw (e)
      })

    res.status(200);
    res.send('{"Pin":' + JSON.stringify(res.data) + '}');
  } catch (error) {
    res.status(400).send(`"message":${JSON.stringify(error)}}`)
  }

}

async function traerBoletinesPublicadosController(req, res, next) {
  try {
    let request = {};
    //Paginacion (viene tambien en el req.body)
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;

    let { totalBoletines, boletines } = await traerBoletinesPublicados(request)
      .catch((e) => {
        throw e
      });
    let totalPaginas = Math.ceil(totalBoletines[0]['COUNT(a.idBoletin)'] / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Boletines:', data: boletines, totalBoletines: totalBoletines[0]['COUNT(a.idBoletin)'], totalPaginas }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error al traer los boletines.", data: String(e) }))
    res.end();
    return;
  }
}

//Trae todas las publicaciones y republicaciones de una norma desde hasta en boletines
async function traerPublicacionesNormaDesdeHastaController(req, res) {
  try {
    let request = { idNorma: req.body.idNorma }

    let result = await traerPublicacionesNormaDesdeHasta(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Publicaciones de la norma ${request.idNorma}:`, data: result }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer las publicaciones de la norma ${req.body.idNorma}.`, data: String(e) }))
    res.end();
    return;
  }
}

//Da de alta las nuevas fechas de republicacion de la norma y elimina las que no correspondan
async function guardarRepublicacionesController(req, res) {
  try {
    let request = { idNorma: req.body.idNorma, fechas: req.body.fechas, idUsuario: req.body.idUsuario }
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await guardarRepublicaciones(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Publicaciones de la norma ${request.idNorma}:`, data: request.fechas }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al guardar las publicaciones de la norma ${req.body.idNorma}.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerUsuariosController(req, res, next) {

  let request = {};
  request.idUsuario = req.body.idUsuario;

  try {
    let respuesta = await traerUsuarios(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer usuarios.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: usuarios:`, respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer usuarios.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerPerfilController(req, res, next) {

  let request = {};
  request.idUsuario = req.body.idUsuario;

  try {
    let respuesta = await traerPerfil(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer el perfil.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: perfil:`, respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer el perfil.`, data: String(e) }))
    res.end();
    return;
  }
}

async function traerCuentaController(req, res, next) {

  let request = {};
  request.idUsuario = req.body.idUsuario;

  try {
    let respuesta = await traerCuenta(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la cuenta.", data: String(e) })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: cuenta:`, respuesta }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409)
    res.send(JSON.stringify({ mensaje: `Error al traer la cuenta.`, data: String(e) }))
    res.end();
    return;
  }
}

module.exports = {
  crearNormaTipoController, borrarNormaTipoController, editarNormaTipoController,
  traerNormaTipoController, traerNormasTiposController,
  crearNormaSubtipoController, borrarNormaSubtipoController,
  traerNormaSubtipoController, traerNormasSubtiposController,
  traerNormaController, traerNormasPropiasController,
  traerNormaDeCuentaController, borrarNormaController, crearNormaController,
  traerSumarioController, traerSumarioSeccionController, traerSumarioSeccionesController, traerSumarioSeccionTipoReparticionesController,
  traerSumarioSeccionSubtiposController,
  traerFeriadosPorAnioController,
  traerFeriadoPorFechaController,
  crearFeriadoController,
  borrarFeriadoPorIdController,
  traerNormasDeReparticionController,
  traerNormasDeReparticionesController,
  editarNormaController,
  editarNormaMetaController,

  traerSumarioItemPorIdController,
  traerSeccionPorIdController,
  crearSumarioItemController,
  crearSeccionController,
  mostrarSeccionController,
  borrarSeccionController,
  borrarSumarioItemPorIdController,
  borrarSeccionPorIdController,

  traerObservacionesMotivosController,
  crearObservacionController,

  revisionController,

  traerPrioridadesController,
  asignarPrioridadController,
  cotizarNormaController,
  aprobarNormaParaCotizacionController,
  aprobarNormaController,
  desaprobarNormaController,
  traerObservacionesPorIdUsuarioController,
  traerObservacionesDeReparticionesDelUsuarioController,
  crearBoletinController,

  traerVistaPreviaBoletinController,
  traerNormasDeUnBoletinController,

  traerNormasPorFechaLimiteController,
  traerBoletinesEnEdicionController,
  traerBoletinPorIdController,
  traerNormasPorFechaPublicacionSeccionController,
  editarBoletinController,
  traerAnexosPorIdNormaController,

  editarNormaDigitalizacionController,
  traerVistaPreviaNormaController,
  traerEstadosNormasController,
  traerNormasController,
  traerSeparata,
  descargarBoletinController,
  anularDescargaBoletinController,
  anularFirmaBoletinController,
  borrarBoletinController,
  publicarBoletinController,
  firmarBoletinController,
  traerBoletinPDFController,
  traerSeparataPDFController,
  firmarBoletinGEDOController,
  traerDocumentosPublicadosController,
  reemplazarDocumentoController,
  traerNormasBoletinDesdeHastaController,
  editarFechaLimiteController,
  asociarAvisoController,
  revisarNormaController,
  ultimosUsuariosEdicionController,
  ultimosUsuariosEdicionController,
  registrarIngresoEdicionController,
  borrarSumarioSubtipoController,
  crearSumarioSubtipoController,
  crearSumarioReparticionController,
  borrarSumarioReparticionController,
  actualizarSeccionPorIdController,
  editarNormaSubtipoController,
  ordenarSeccionesController, ordenarNormaTiposSumarioController, traerTodosNormaTipoController,
  exportarNormas, exportarBoletinesPublicados,
  exportarBoletines, ordenarSubtiposSumarioController, ordenarReparticionesSumarioController, traerSumarioSeccionReparticionesController,
  traerOrganismosEmisoresController, traerBoletinesPublicadosController, traerPublicacionesNormaDesdeHastaController,
  guardarRepublicacionesController,
  traerUsuariosController, reactivarSumarioSubtipoController,
  reactivarSumarioItemPorIdController, traerPerfilController, traerCuentaController,
  crearOrganismosEmisoresController, editarOrganismosEmisoresController, eliminarOrganismosEmisoresController,
  traerOrganismosEmisoresExternoController
}
