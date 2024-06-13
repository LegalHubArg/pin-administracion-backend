const { traerNormasNoPublicadasBO, traerNormasPublicadasBO, importarNormasNoPublicadasBO,
  traerNormas, importarNormasPublicadasBO, traerNorma, crearNormaSDIN, traerClases,
  traerGestion, editarNormasSDIN, traerTemas, traerDescriptoresPorIdNormaSDIN,
  traerTiposPublicaciones, asignarNormas, traerRelacionesTipos, crearRelacion, traerRelacionesDeNorma,
  editarRelacion, eliminarRelacion, agregarDescriptor, traerDescriptores, agregarDescriptorNorma,
  eliminarDescriptorNorma, traerTemasPorIdNormaSDIN, traerRamaPorIdNormaSDIN,
  traerRamas, agregarTemaNorma, eliminarTemaNorma,
  agregarRamaNorma, eliminarRamaNorma, checkAprobadoDocumental,
  editarTextoOriginal, editarTextoActualizado, editarEstadoNormas, borrarDescriptor,
  traerTemasABM, agregarTemas, editarTemas, eliminarTemas, habilitarTema,
  traerClasesABM, agregarClases, editarClases, eliminarClases,
  traerRelacionesTiposABM, agregarRelacionesTipos, editarRelacionesTipos, eliminarRelacionesTipos, traerJerarquiaTemas, traerJerarquiaNorma,
  traerRamasABM, agregarRamas, editarRamas, eliminarRamas,
  traerCausalesABM, agregarCausales, editarCausales, eliminarCausales,
  traerPatologiasABM, agregarPatologias, editarPatologias, eliminarPatologias, crearJerarquiaTemas,
  borrarJerarquiaTemas, publicarNormaFront, normaTiposSDIN, borrarNormasSDIN, borrarPublicacion,
  normaSubtiposSDIN, agregarAnexo, borrarAnexo, traerDependencias, traerOrganismos, traerHistorial, traerHistorialDJ,
  editarNormasTiposSDIN, eliminarNormasTiposSDIN, agregarNormasTiposSDIN,
  agregarDependenciasSDIN, editarDependenciasSDIN, eliminarDependenciasSDIN, agregarDependenciaNormas, traerEstadosSDIN,
  traerNiveles, editarArchivoTextoActualizadoSDIN, traerTrazabilidadUsuarios,
  traerTrazabilidad, traerImagenesPorIdNormaSDIN, traerImagenPorIdNormaSDIN,
  traerTiposTrazabilidad, agregarAdjunto, borrarAdjunto, borrarDependenciaNormas, editarDescriptor, comprobarDependenciaRepetida, traerJerarquiaTemasArbol

} = require('./NormasFunctions')
const { traerAnexosPorIdNorma, traerNormaPorId } = require('../BO/NormasFunctions');
const { subirArchivo, subirArchivoBucketS3, copiarArchivo } = require('../../helpers/functionsS3');
let XLSX = require("xlsx");

async function traerNormasNoPublicadasBOController(req, res, next) {
  let request = {};

  request.idSeccion = req.body.idSeccion;
  request.idNormaTipo = req.body.idNormaTipo;
  request.idNormaSubtipo = req.body.idNormaSubtipo;
  request.idNormasEstadoTipo = req.body?.idNormasEstadoTipo;
  request.analista = req.body?.analista;
  request.normaNumero = req.body.normaNumero;
  request.fechaLimite = req.body.fechaLimite;
  request.fechaRevisado = req.body?.fechaRevisado;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;

  try {
    let normas;
    let totalNormas;
    let anexos;
    await traerNormasNoPublicadasBO(request)
      .then(response => {
        normas = response.normas;
        totalNormas = response.totalNormas[0]['COUNT(a.idNorma)'];
        anexos = response.anexos;
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

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

async function traerNormasPublicadasBOController(req, res, next) {
  let request = {};
  request.idNorma = req.body.idNorma;
  request.idSeccion = req.body.idSeccion;
  request.idReparticionOrganismo = req.body?.idReparticionOrganismo;
  request.idNormasEstadoTipo = req.body?.idNormasEstadoTipo;
  request.normaNumero = req.body?.normaNumero;
  request.idNormaTipo = req.body?.idNormaTipo;
  request.idNormaSubtipo = req.body?.idNormaSubtipo;
  request.normaAnio = req.body?.normaAnio;
  request.analista = req.body?.analista;
  request.fechaLimite = req.body.fechaLimite;
  request.fechaCarga = req.body?.fechaCarga;
  request.fechaSugerida = req.body?.fechaSugerida;
  request.boletinNumero = req.body?.boletinNumero;
  request.fechaPublicacion = req.body?.fechaPublicacion;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;

  try {
    let normas;
    let totalNormas;
    let anexos;
    await traerNormasPublicadasBO(request)
      .then(response => {
        normas = response.normas;
        totalNormas = response.totalNormas[0]['COUNT(*)'];
        anexos = response.anexos;
      })
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

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

async function importarNormasNoPublicadasBOController(req, res, next) {
  let request = {};
  request.normas = req.body.normas;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    for (const norma of request.normas) {
      await traerNormaPorId({ idNorma: norma })
        .then(res => {
          if (res[0].idNormasEstadoTipo !== 8 || res[0].normaRevisada !== 1) {
            throw `La norma ${norma} no está revisada o no está en estado BO_EN_REDACCION`
          }
          // Proceso de copia de documentos de BO a SDIN.
          copiarArchivo(process.env.S3_BO_NORMAS + res[0].normaArchivoOriginalS3Key, process.env.S3_SDIN_NORMAS + res[0].normaArchivoOriginalS3Key)
        })
        .catch((e) => {
          throw e
        });
        // copio los anexos que tiene la norma
        await traerAnexosPorIdNorma({idNorma: norma}).then(res => {
          if (res.length > 1) {
            for(let i = 0; i < res.length; i++) {
              console.log("copiando anexos...")
              copiarArchivo(process.env.S3_BO_NORMAS + res[i].normaAnexoArchivoS3Key, process.env.S3_SDIN_NORMAS + res[i].normaAnexoArchivoS3Key)
            }
          } else if (res.length === 1) {
            console.log("copiando anexos...")
            copiarArchivo(process.env.S3_BO_NORMAS + res[0].normaAnexoArchivoS3Key, process.env.S3_SDIN_NORMAS + res[0].normaAnexoArchivoS3Key)
          }
          
        }).catch(e => console.log(e))
        
    }

    await importarNormasNoPublicadasBO(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al importar las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, normas: request.normas }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    console.log(e)
    return;
  }
}

async function importarNormasPublicadasBOController(req, res, next) {
  let request = {};
  /* Van a venir los ID de las normas a importar */
  request.normas = req.body.normas;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {
    for (const norma of request.normas) {
      await traerNormaPorId({ idNorma: norma })
        .then(res => {
          if (res[0].idNormasEstadoTipo !== 11) {
            throw `La norma ${norma} no está publicada o no está en estado BO_PUBLICADO`
          }
          // Proceso de copia de documentos de BO a SDIN.
          copiarArchivo(process.env.S3_BO_NORMAS + res[0].normaArchivoOriginalS3Key, process.env.S3_SDIN_NORMAS + res[0].normaArchivoOriginalS3Key)


          // copiarArchivo(process.env.S3_BO_NORMAS + "DESDE" , process.env.S3_SDIN_NORMAS + "OBJETIVO")
        })
        .catch((e) => {
          throw e
        });
        // copio los anexos que tiene la norma
        await traerAnexosPorIdNorma({idNorma: norma}).then(res => {
          if (res.length > 1) {
            for(let i = 0; i < res.length; i++) {
              console.log("copiando anexos...")
              copiarArchivo(process.env.S3_BO_NORMAS + res[i].normaAnexoArchivoS3Key, process.env.S3_SDIN_NORMAS + res[i].normaAnexoArchivoS3Key)
            }
          } else if (res.length === 1) {
            console.log("copiando anexos...")
            copiarArchivo(process.env.S3_BO_NORMAS + res[0].normaAnexoArchivoS3Key, process.env.S3_SDIN_NORMAS + res[0].normaAnexoArchivoS3Key)
          }
          
        }).catch(e => console.log(e))
        
    }

    await importarNormasPublicadasBO(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al importar las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, normas: request.normas }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerNormasController(req, res, next) {
  let request = {};

  let palabras = req.body?.palabras?.split(' ')
  request.normaNumero_desde = req.body.normaNumero_desde;
  request.normaNumero_hasta = req.body.normaNumero_hasta;
  request.idSeccion = req.body.idSeccion;
  request.idNormaTipo = req.body.idNormaTipo;
  request.idClase = req.body.idClase;
  request.idRama = req.body.idRama;
  request.idNormaSDIN = req.body.idNormaSDIN;
  request.temas = req.body.temas;
  request.descriptores = req.body.descriptores;
  request.dependencias = req.body.dependencias;
  request.idOrganismo = req.body.idOrganismo;
  request.idDependencia = req.body.idDependencia;
  request.idNormasEstadoTipo = req.body?.idNormasEstadoTipo;
  request.normaNumero = req.body.normaNumero;
  request.normaAnio = req.body?.normaAnio;
  request.fechaSancion = req.body?.fechaSancion;
  request.checkDigesto = req.body?.checkDigesto;
  request.checkConsolidado = req.body?.checkConsolidado;
  request.idGestion = req.body?.idGestion
  request.idTipoPublicacion = req.body?.idTipoPublicacion;
  request.usuarioAsignado = req.body?.usuarioAsignado;
  request.observaciones = req.body?.observaciones;
  request.alcance = req.body?.alcance;
  request.tiposPalabras = req.body?.tiposPalabras;
  request.palabras = (req.body.tiposPalabras === 4) ? palabras : req.body?.palabras;
  request.tipoFecha = req.body?.tipoFecha;
  request.fechaDesde = req.body?.fechaDesde;
  request.fechaHasta = req.body?.fechaHasta;
  request.idBoletin = req.body?.idBoletin;
  request.boletinNumero = req.body?.boletinNumero;
  request.user = req.body?.user;
  request.numeroAD = req.body?.numeroAD;
  request.numeroCD = req.body?.numeroCD;
  request.checkPlazoDeterminado = req.body?.checkPlazoDeterminado;
  request.checkVigenciaEspecial = req.body?.checkVigenciaEspecial;
  request.vigente = req.body?.vigente;
  request.idRelacion = req.body?.idRelacion
  request.idCausal = req.body?.idCausal
  request.tieneFormulario = req.body?.tieneFormulario
  request.idAnexoDJ = req.body?.idAnexoDJ
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  request.calcularTotal = req.body?.calcularTotal === false ? false : true;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
  // console.log(request)
  try {
    const { normas, totalNormas } = await traerNormas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, normas, totalNormas: request.calcularTotal ? totalNormas[0]['COUNT(*)'] : 0 }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerNormaController(req, res, next) {
  let request = {};
  request.idNormaSDIN = req.body.idNormaSDIN;

  try {

    const norma = await traerNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Norma:`, norma }))
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

async function crearNormaSDINController(req, res, next) {
  let request = {};
  request.firmantes = req.body.firmantes;
  request.checkTA = req.body.checkTA;
  request.aprobadoNormativamente = req.body.aprobadoNormativamente;
  request.plazoDeterminado = req.body.plazoDeterminado;
  request.numeroAD = req.body.numeroAD;
  request.numeroCD = req.body.numeroCD;
  request.temasGenerales = req.body.temasGenerales;
  request.checkDigesto = req.body.checkDigesto;
  request.normaAnio = req.body.normaAnio;
  request.numeroBO = req.body.numeroBO;
  request.alcance = req.body.alcance;
  request.idClase = req.body.idClase;
  request.idGestion = req.body.idGestion;
  request.fechaPublicacion = String(req.body.fechaPublicacion).length > 0 ? req.body.fechaPublicacion : null;
  request.fechaSancion = String(req.body.fechaSancion).length > 0 ? req.body.fechaSancion : null;
  request.fechaPromulgacion = String(req.body.fechaPromulgacion).length > 0 ? req.body.fechaPromulgacion : null;
  request.fechaRatificacion = String(req.body.fechaRatificacion).length > 0 ? req.body.fechaRatificacion : null;
  request.titulo = req.body.titulo;
  request.archivo = req.body.archivo;
  request.idReparticion = req.body.idDependencia;
  request.idReparticionOrganismo = req.body.idOrganismo;
  request.idNormaTipo = req.body.idNormaTipo;
  request.idNormaSubtipo = req.body.idNormaSubtipo;
  request.normaNumero = (req.body.normaNumero !== '') ? Number(req.body.normaNumero) : '';
  request.normaSumario = req.body.normaSumario;
  request.vigenciaEspecial = req.body.vigenciaEspecial;
  request.vigenciaEspecialDescripcion = req.body.vigenciaEspecialDescripcion;
  request.vigencia = req.body.vigencia;
  request.usuarioCarga = req.body.idUsuario;
  request.observaciones = req.body.observaciones;
  request.clausulaDerogatoria = req.body.clausulaDerogatoria;
  request.clausulaDerogatoriaDescripcion = req.body.clausulaDerogatoriaDescripcion;
  request.linkPublicacionBO = req.body.linkPublicacionBO;
  request.generaTA = req.body.generaTA;
  request.textoOriginal = req.body.textoOriginal;
  request.idTipoPublicacion = req.body.idTipoPublicacion;
  request.archivo = req.body.archivo;
  request.archivoS3 = null;
  request.anexos = [];
  request.dependencias = req.body.dependencias;
  request.nombreAdjunto = req.body?.nombreAdjunto;
  request.adjuntoS3 = null;
  request.adjunto = req.body.adjunto;
  request.nombreTextoActualizado = req.body?.nombreTextoActualizado;
  request.textoActualizadoS3 = null;
  request.textoActualizado = req.body?.textoActualizado
  request.contenidoEditorTextoActualizado = req.body?.contenidoEditorTextoActualizado

  for (const key in request) {
    if (request[key] === undefined) {
      request[key] = null
    }
  }

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    if (req.body.documento && request.archivo) {
      const docNormaSubido = await subirArchivo(req.body.documento, req.body.cuit, process.env.S3_SDIN_NORMAS + request.archivo)
        .catch(err => {
          console.log(err)
        })
      request.archivoS3 = docNormaSubido['Key'].replace(process.env.S3_SDIN_NORMAS, '');
    }

    if (req.body.adjunto && request.adjunto) {
      const adjuntoSubido = await subirArchivo(req.body.adjunto, req.body.cuit, process.env.S3_SDIN_NORMAS + request.nombreAdjunto)
        .catch(err => {
          console.log(err, "Error en subir ADJUNTO")
        })
      request.adjuntoS3 = adjuntoSubido['Key'].replace(process.env.S3_SDIN_NORMAS, '')
    }

    if (req.body.textoActualizado && request.textoActualizado) {
      const taSubido = await subirArchivo(req.body.textoActualizado, req.body.cuit, process.env.S3_SDIN_NORMAS + request.nombreTextoActualizado)
        .catch(err => {
          console.log(err, "Error en subir TA")
        })
      request.textoActualizadoS3 = taSubido['Key'].replace(process.env.S3_SDIN_NORMAS, '')
    }

    for (const ax of req.body.anexos) {
      let aux = {}
      const archivoSubido = await subirArchivo(ax.base64, req.body.cuit, process.env.S3_SDIN_NORMAS + ax.archivo)
        .catch(err => {
          console.log(err)
        })
      aux.archivoS3 = archivoSubido['Key'].replace(process.env.S3_SDIN_NORMAS, '');
      aux.archivo = ax.archivo;
      (request.anexos).push(aux)
    }

    const normaCreada = await crearNormaSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al importar las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Norma creada con éxito`, norma: request, idNormaSDIN: normaCreada }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerClasesController(req, res, next) {

  try {

    const clases = await traerClases()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Clases.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas:`, clases }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerGestionesController(req, res, next) {

  try {

    const nombre = await traerGestion()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Gestiones.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Nombres:`, nombre }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}
async function traerTiposPublicacionesSDINController(req, res, next) {

  try {

    const tiposPublicaciones = await traerTiposPublicaciones()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Gestiones.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: tipos de publicaciones:`, tiposPublicaciones }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function editarNormasSDINController(req, res, next) {
  try {
    let request = {};

    //Recibe el array de ids en req.body.normas y el objeto con los metadatos a editar en req.body.metadatos
    request.normas = req.body?.normas;
    request.metadatos = req.body?.metadatos;
    request.idUsuario = req.body?.idUsuario;
    request.apellidoNombre = req.usuario.apellidoNombre

    //Validación:
    if (!request.normas || ((!request.metadatos || Object.values(request.metadatos).length === 0) && (!req.body.dependenciasBorradas && !req.body.dependenciasAgregadas))) {
      throw 'Debe especificar las normas/metadatos a modificar.'
    }

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    if (req.body.base64 && req.body.metadatos.archivo) {
      let archivoS3 = await subirArchivo(req.body.base64, req.body.usuario, process.env.S3_SDIN_NORMAS + req.body.metadatos.archivo)
      if (request.metadatos.archivo) { request.metadatos.archivoS3 = archivoS3['Key'].replace(process.env.S3_SDIN_NORMAS, '') }
    }

    if (req.body.dependenciasBorradas?.length > 0) {
      for (const dep of req.body.dependenciasBorradas) {
        await borrarDependenciaNormas({ ...request, idDependencia: dep })
          .catch((e) => {
            throw ({ mensaje: "PIN: Error al editar las dependencias de la Norma.", data: e })
          });
      }
    }

    if (req.body.dependenciasAgregadas?.length > 0) {
      for (const dep of req.body.dependenciasAgregadas) {
        await agregarDependenciaNormas({ ...request, idDependencia: dep })
          .catch((e) => {
            throw ({ mensaje: "PIN: Error al editar las dependencias de la Norma.", data: e })
          });
      }
    }

    if (request.normas.length > 0 && Object.values(request.metadatos).length > 0) {
      await editarNormasSDIN(request)
        .catch((e) => {
          throw ({ mensaje: "PIN: Error al editar la Norma.", data: e })
        });
    }

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Norma editada con éxito`, norma: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(e)
    res.end();
    return;
  }
}

async function editarArchivoTextoActualizadoSDINController(req, res, next) {
  try {
    let request = {};
    //Recibe el array de ids en req.body.normas y el objeto con los metadatos a editar en req.body.metadatos
    request.normas = req.body?.normas;
    request.metadatos = req.body?.metadatos;
    request.idUsuario = req.body?.idUsuario;
    if (!request.normas || !request.metadatos || Object.values(request.metadatos).length === 0) throw 'Debe especificar las normas/metadatos a modificar.'

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    if (req.body.base64 && req.body.metadatos.archivo) {
      let archivoS3 = await subirArchivo(req.body.base64, req.body.usuario, process.env.S3_SDIN_NORMAS + req.body.metadatos.archivo)
      if (request.metadatos.archivo) { request.metadatos.archivoS3 = archivoS3['Key'].replace(process.env.S3_SDIN_NORMAS, '') }
    }

    await editarArchivoTextoActualizadoSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Norma editada con éxito`, norma: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function agregarAnexoController(req, res, next) {
  try {
    let request = { ...(req.body) };

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let archivoS3 = await subirArchivo(req.body.base64, req.body.idUsuario, process.env.S3_SDIN_NORMAS + request.archivo)
    if (request.archivo) { request.archivoS3 = archivoS3['Key'].replace(process.env.S3_SDIN_NORMAS, '') }

    await agregarAnexo(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el anexo a la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Anexo agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function borrarAnexoController(req, res, next) {
  try {
    let request = { ...(req.body) };

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarAnexo(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el anexo a la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Anexo agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function agregarAdjuntoController(req, res, next) {
  try {
    let request = { ...(req.body) };

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    let archivoS3 = await subirArchivo(req.body.base64, req.body.idUsuario, process.env.S3_SDIN_NORMAS + request.archivo)
    if (request.archivo) { request.archivoS3 = archivoS3['Key'].replace(process.env.S3_SDIN_NORMAS, '') }

    await agregarAdjunto(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el adjunto a la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Adjunto agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function borrarAdjuntoController(req, res, next) {
  try {
    let request = { ...(req.body) };

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarAdjunto(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el adjunto a la Norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Adjunto agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function borrarNormasSDINController(req, res, next) {
  try {
    let request = {};

    //Recibe el array de ids en req.body.normas
    request.normas = req.body?.normas;
    request.metadatos = req.body?.metadatos;
    request.idUsuario = req.body?.idUsuario;
    if (!request.normas || request.length === 0) throw 'Debe especificar las normas a borrar.'

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }

    await borrarNormasSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al borrar las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas borradas con éxito`, norma: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerTemasController(req, res, next) {

  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;

  try {

    const {temas, totalTemas} = await traerTemas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas:`, temas, totalTemas: totalTemas[0]["COUNT(idTema)"]}))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerRamasController(req, res, next) {
  try {
    const ramas = await traerRamas()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Ramas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Ramas:`, ramas }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerDescriptoresPorIdNormaSDINController(req, res, next) {
  try {
    let request = {}
    request.idNormaSDIN = req.body.idNormaSDIN;

    let descriptores = await traerDescriptoresPorIdNormaSDIN(request)
      .catch((e) => {
        throw (e)
      })

    res.send(JSON.stringify({ mensaje: "OK", descriptores }))

    res.status(200)
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "Error", data: String(e) }))
    res.end();
    return;
  }
}

async function agregarDescriptorController(req, res, next) {
  let request = { descriptor: req.body.descriptor };
  try {
    await agregarDescriptor(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar descriptor.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: descriptor.`, request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function borrarDescriptorController(req, res, next) {
  let request = { id: req.body.id };
  try {
    await borrarDescriptor(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al borrar descriptor.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: descriptor.`, request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}
async function editarDescriptorController(req, res) {
  let request = {
    idDescriptor: req.body.idDescriptor,
    descriptor: req.body.descriptor
  };
  try {
    await editarDescriptor(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar descriptor.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: descriptor.`, request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function asignarNormasSDINController(req, res, next) {
  let request = {
    normas: req.body.normas,
    usuarioAsignado: req.body.usuarioAsignado,
    idUsuario: req.body.idUsuario
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await asignarNormas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al asignar las Normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Normas asignadas con éxito`, norma: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerRelacionesTiposSDINController(req, res, next) {
  try {

    const relaciones = await traerRelacionesTipos()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Relaciones.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Relaciones traidas con éxito`, relaciones: relaciones }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerHistorialSDINController(req, res, next) {
  try {

    let request = {
      idNormaSDIN: req.body.idNormaSDIN
    };

    const historial = await traerHistorial(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Historial.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Historial traido con éxito`, historial: historial }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerHistorialDigestoController(req, res, next) {
  let request = {}
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  request.norma = Number(req.query.norma);

  try {
    const historialDJ = await traerHistorialDJ(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer el historial de Digesto.", data: e })
      });

    // let paginacion = {
    //   limite: 5,
    //   totalPaginas: 3,
    //   pagina: 1
    // }

    // let auxPaginacion = paginacion;
    // auxPaginacion.totalPaginas = Math.ceil(historialDJ[0].totalHistorial / auxPaginacion.limite);

    // let historiales = []
    // let ultimo = 0
    // for(let i = ultimo; i <= auxPaginacion.totalPaginas; i++) {

    //   for(let j = 0; j <= paginacion.limite; j++) {
    //     // let destino = [...historialDJ, pagina: i]
    //     historiales.push(historialDJ[i])
    //     ultimo = i
    //   }
    //   paginacion.pagina = paginacion.pagina + 1
    // }

    // console.log(historiales)
    //const paginacion = historialDJ.total
    //total: historialDJ.total[0]['COUNT(H.id)']

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Historial Digesto traido con éxito`, historialDJ: historialDJ.historial }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function crearRelacionSDINController(req, res, next) {
  let request = {
    idNormaOrigen: req.body.idNormaOrigen,
    idNormaDestino: req.body.idNormaDestino,
    detalle: req.body.detalle,
    idRelacion: req.body.idRelacion,
    idUsuario: req.body.idUsuario,
    idNormaSDIN: req.body.idNormaSDIN
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await crearRelacion(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al crear la relacion.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Relación creada con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409); console.log(e)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerRelacionesDeNormaSDINController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN
  };

  try {

    const relaciones = await traerRelacionesDeNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer relaciones.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Relaciones`, relaciones: relaciones }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409); console.log(e)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function editarRelacionSDINController(req, res, next) {
  let request = {
    idNormasRelaciones: req.body.idNormasRelaciones,
    idRelacion: req.body.idRelacion,
    detalle: req.body.detalle,
    idUsuario: req.body.idUsuario
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await editarRelacion(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar la relacion.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Relación editada con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409); console.log(e)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function eliminarRelacionSDINController(req, res, next) {
  let request = {
    idNormasRelaciones: req.body.idNormasRelaciones
  };

  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await eliminarRelacion(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al eliminar la relacion.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Relación eliminada con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409); console.log(e)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerDescriptoresController(req, res, next) {
  let request = {
  };

  request.textInput = '%' + req.body.textInput + '%'

  //Paginacion
  request.limite = req?.body?.limite;
  request.paginaActual = req?.body?.paginaActual;

  try {

    let { results, totalDescriptores } = await traerDescriptores(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer los descriptores.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Descriptores traidos con éxito`, descriptores: results, totalDescriptores }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function agregarDescriptorPorIdNormaSDINController(req, res, next) {
  let request = {
    idDescriptor: req.body.descriptor,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await agregarDescriptorNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el descriptor.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Descriptor agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function eliminarDescriptorPorIdNormaSDINController(req, res, next) {
  let request = {
    idDescriptor: req.body.descriptor,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await eliminarDescriptorNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al eliminar el descriptor.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Descriptor eliminado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerTemasPorIdNormaSDINController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN,
    idTema: req.body.idTema
  };

  try {

    let temas = await traerTemasPorIdNormaSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer los temas.", data: e })
      });
    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: temas tridos con éxito`, temas }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerImagenesPorIdNormaSDINController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN
  };

  try {

    let imagenes = await traerImagenesPorIdNormaSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las imagenes.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: imagenes traidas con éxito`, imagenes }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerImagenPorIdNormaSDINController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN,
    numero: req.body.numero
  };

  try {

    let imagen = await traerImagenPorIdNormaSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la imagen.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: imagen traida con éxito`, imagen }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerRamaPorIdNormaSDINController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN
  };

  try {

    let ramas = await traerRamaPorIdNormaSDIN(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer los temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: temas tridos con éxito`, ramas }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409); console.log(e)
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function agregarTemaPorIdNormaSDINController(req, res, next) {
  let request = {
    idTema: req.body.idTema,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await agregarTemaNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar el tema.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Tema agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function eliminarTemaPorIdNormaSDINController(req, res, next) {
  let request = {
    idTema: req.body.idTema,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }

  try {

    await eliminarTemaNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al eliminar el tema.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Tema eliminado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function agregarRamaPorIdNormaSDINController(req, res, next) {
  let request = {
    idRama: req.body.idRama,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await agregarRamaNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al agregar la rama.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Rama agregado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function eliminarRamaPorIdNormaSDINController(req, res, next) {
  let request = {
    idRama: req.body.idRama,
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await eliminarRamaNorma(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al eliminar la rama.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Rama eliminada con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function editarTextoOriginalSDINController(req, res, next) {
  let request = {
    textoOriginal: String(req.body.textoOriginal),
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await editarTextoOriginal(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar el texto original de la norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Texto original editado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function editarTextoActualizadoSDINController(req, res, next) {
  let request = {
    textoActualizado: String(req.body.textoActualizado),
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario
  };

  try {

    await editarTextoActualizado(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar el texto actualizado de la norma.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Texto actualizado editado con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function editarEstadoNormasSDINController(req, res, next) {
  let request = {
    idNormasEstadoTipo: parseInt(req.body.idNormasEstadoTipo),
    normas: req.body.normas,
    idUsuario: req.body.idUsuario
  };

  try {

    await editarEstadoNormas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al editar el estado de las normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Estados editados con éxito`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function checkAprobadoDocumentalController(req, res, next) {
  let request = {};
  request.aprobadoDocumentalmente = req.body.aprobadoDocumentalmente,
    request.idNormaSDIN = req.body.idNormaSDIN

  for (const key in request) {
    if (request[key] === undefined) {
      request[key] = null
    }
  }

  /* if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  } */

  try {

    await checkAprobadoDocumental(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al aprobarlo documentalmente.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: aprobado documentalmente con éxito`, norma: request }))
    res.end();
    return;
  }
  catch (e) {
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerTemasABMController(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;

  try {

    const { temas, totalTemas } = await traerTemasABM(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer Temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas:`, temas, totalTemas: totalTemas[0]['COUNT(a.idTema)'] }))
    res.end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Estados.", data: String(err) }))
    res.end();
  }
}

async function agregarTemasController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;
  request.idUsuario = req.body.idUsuario;
  request.tema = req.body.tema;
  request.descripcion = req.body.descripcion;
  request.descripcion = req.body.descripcion;
  request.idRama = req.body.idRama;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarTemas(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear tema.", data: String(err) }))
    res.end();
    return;
  }
  //console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Tema creado con éxito.", data: request })).end();
  return;

}

async function editarTemasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.tema = req.body.tema;
  request.descripcion = req.body.descripcion;
  request.idTema = req.body.idTema;
  request.idUsuario = req.body.idUsuario;
  request.idRama = req.body.idRama;
  request.estado = req.body.estado;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarTemas(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar tema.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Tema actualizado con éxito.", data: req.body })).end();
  return;

}

async function eliminarTemasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idTema = req.body.idTema;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarTemas(request)
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

async function habilitarTemaController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idTema = req.body.idTema;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await habilitarTema(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al habilitar tema.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tema habilitado con Éxito.', data: respuesta })).end();
  return;

}

async function traerClasesABMController(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
  const {respuesta, totalClases} = await traerClasesABM(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer Clases.", data: String(e) }))
      res.end();
      return;
    });
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Clases.', data: respuesta, totalClases: totalClases[0]['COUNT(*)'] }))
  res.end();
  return;

}

async function agregarClasesController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.clase = req.body.clase;
  request.descripcion = req.body.descripcion;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarClases(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear clase.", data: String(err) }))
    res.end();
    return;
  }
  console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Clase creada con éxito.", data: request })).end();
  return;

}

async function editarClasesController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.clase = req.body.clase;
  request.descripcion = req.body.descripcion;
  request.idClase = req.body.idClase;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarClases(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar clase.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Clase actualizado con éxito.", data: req.body })).end();
  return;

}

async function eliminarClasesController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idClase = req.body.idClase;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarClases(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar la clase.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Clase Eliminada con Éxito.', data: respuesta })).end();
  return;

}

async function traerRelacionesTiposABMController(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
  const {respuesta, totalRelacionesTipos} = await traerRelacionesTiposABM(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer relaciones.", data: String(e) }))
      res.end();
      return;
    });
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Relaciones.', data: respuesta, totalRelacionesTipos: totalRelacionesTipos[0]['COUNT(*)'] }))
  res.end();
  return;

}

async function agregarRelacionesTiposController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.relacion = req.body.relacion;
  request.descripcion = req.body.descripcion;
  request.tipo = req.body.tipo;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarRelacionesTipos(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear acción.", data: String(err) }))
    res.end();
    return;
  }
  console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Acción creada con éxito.", data: request })).end();
  return;

}

async function editarRelacionesTiposController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.relacion = req.body.relacion;
  request.descripcion = req.body.descripcion;
  request.tipo = req.body.tipo;
  request.idRelacion = req.body.idRelacion;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarRelacionesTipos(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar relación.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Relación actualizado con éxito.", data: req.body })).end();
  return;

}

async function eliminarRelacionesTiposController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idRelacion = req.body.idRelacion;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarRelacionesTipos(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar la acción.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Acción Eliminada con Éxito.', data: respuesta })).end();
  return;

}

async function traerJerarquiaTemasController(req, res, next) {
  try {
    let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.query.limite;
  request.paginaActual = req.query.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
    const { jerarquia, totalJerarquia } = await traerJerarquiaTemas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la jerarquia de los temas.", data: e })
      });
    
    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas`, jerarquia: jerarquia, totalJerarquia: totalJerarquia[0]['COUNT(*)']}))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerJerarquiaTemasArbolController(req, res, next) {
  try {

    const jerarquia = await traerJerarquiaTemasArbol()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la jerarquia de los temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas`, data: jerarquia }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function crearJerarquiaTemasController(req, res, next) {
  let request = {
    idTema: req.body.idTema,
    idTemaHijo: req.body.idTemaHijo,
    idUsuario: req.body.idUsuario
  }
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  try {

    await crearJerarquiaTemas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al crear jerarquia de los temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function borrarJerarquiaTemasController(req, res, next) {
  let request = {
    idTemasJerarquia: req.body.idTemasJerarquia,
    idUsuario: req.body.idUsuario
  }
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  try {

    await borrarJerarquiaTemas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al borrar jerarquia de los temas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas`, data: request }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerJerarquiaNormaController(req, res, next) {
  try {

    const normas = await traerJerarquiaNorma()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la jerarquia de las normas.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: normas`, data: normas }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerRamasABMController(req, res, next) {
  try {
    let request = {}
    request.limite = req.body?.limite;
    request.paginaActual = req.body?.paginaActual;
    let respuesta = await traerRamasABM(request)
      // .catch((e) => {
      //   res.status(409)
      //   res.send(JSON.stringify({ mensaje: "PIN: Error al traer Ramas.", data: String(e) }))
      //   res.end();
      //   return;
      // });
    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Ramas.', data: respuesta.ramas, total: respuesta.total }))
    res.end();
    return;
  } catch (error) {
    console.log(error)
    res.status(500).send({mensaje: "Error al traer las ramas.", error})
  }


}

async function agregarRamasController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.rama = req.body.rama;
  request.descripcion = req.body.descripcion;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarRamas(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear rama.", data: String(err) }))
    res.end();
    return;
  }
  console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Acción creada con éxito.", data: request })).end();
  return;

}

async function editarRamasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.rama = req.body.rama;
  request.descripcion = req.body.descripcion;
  request.idRama = req.body.idRama;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarRamas(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar rama.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Rama actualizado con éxito.", data: req.body })).end();
  return;

}

async function eliminarRamasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idRama = req.body.idRama;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarRamas(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar la rama.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Rama Eliminada con Éxito.', data: respuesta })).end();
  return;

}

async function traerCausalesABMController(req, res, next) {
  let request = {};
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;
  const {causales, totalCausales} = await traerCausalesABM(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer causales.", data: String(e) }))
      res.end();
      return;
    });
  
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Causales.', data: causales, totalCausales: totalCausales[0]['COUNT(*)'] }))
  res.end();
  return;

}

async function agregarCausalesController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.nombre = req.body.nombre;
  request.causal = req.body.causal;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarCausales(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear causal.", data: String(err) }))
    res.end();
    return;
  }
  console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Causal creada con éxito.", data: request })).end();
  return;

}

async function editarCausalesController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.nombre = req.body.nombre;
  request.causal = req.body.causal;
  request.idCausal = req.body.idCausal;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarCausales(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar causal.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Causal actualizado con éxito.", data: req.body })).end();
  return;

}

async function eliminarCausalesController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idCausal = req.body.idCausal;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarCausales(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar el causal.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Causal Eliminado con Éxito.', data: respuesta })).end();
  return;

}

async function traerPatologiasABMController(req, res, next) {
  let request = {}
    //Paginacion (viene tambien en el req.body)
    request.limite = req.body.limite;
    request.paginaActual = req.body.paginaActual;
  const {data, totalPatologias} = await traerPatologiasABM(request)
    .catch((e) => {
      res.status(409)
      res.send(JSON.stringify({ mensaje: "PIN: Error al traer patologias.", data: String(e)}))
      res.end();
      return;
    });
  res.status(200)
  res.send(JSON.stringify({ mensaje: 'PIN: Patologias.', data: data, totalPatologias: totalPatologias[0]['COUNT(*)']  }))
  res.end();
  return;

}

async function agregarPatologiasController(req, res, next) {


  let request = {};
  let result = [];
  let err = null;

  request.idUsuario = req.body.idUsuario;
  request.nombre = req.body.nombre;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await agregarPatologias(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al crear patologia.", data: String(err) }))
    res.end();
    return;
  }
  console.log("saber si llega===", res.send)
  res.status(200).send(JSON.stringify({ mensaje: "PIN: Patologia creada con éxito.", data: request })).end();
  return;

}

async function editarPatologiasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.nombre = req.body.nombre;
  request.idPatologiaNormativa = req.body.idPatologiaNormativa;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  await editarPatologias(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al actualizar patologia.", data: String(err) }))
    res.end();
    return;
  }

  res.status(200).send(JSON.stringify({ mensaje: "PIN: Patologia actualizada con éxito.", data: req.body })).end();
  return;

}

async function eliminarPatologiasController(req, res, next) {

  let request = {};
  let result = [];
  let err = null;

  request.idPatologiaNormativa = req.body.idPatologiaNormativa;
  request.idUsuario = req.body.idUsuario;
  if ((req.ip).substring(0, 7) === "::ffff:") {
    request.ip = req.ip.substring(7);
  }
  else {
    request.ip = req.ip;
  }
  let respuesta = await eliminarPatologias(request)
    .then((res) => {
    })
    .catch((err) => {
      throw err
    });
  if (err !== null) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al eliminar la patologia.", data: String(err) }))
    res.end();

    console.log("error: ", err)
    return;
  }
  res.status(200).send(JSON.stringify({ mensaje: 'PIN: Patologia Eliminada con Éxito.', data: respuesta })).end();
  return;

}

//Publicar la norma e el frontoffice de Normativa. Si ya está publicada pisa los datos.
async function publicarNormaFrontController(req, res, next) {
  let request = {
    idNormaSDIN: req.body.idNormaSDIN,
    idUsuario: req.body.idUsuario,
    mostrarTA: req.body?.mostrarTA,
    mostrarTC: req.body?.mostrarTC,
    mostrarRamaTema: req.body?.mostrarRamaTema
  };
  try {
    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    await publicarNormaFront(request)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Norma publicada con éxito.' })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al publicar la norma en el FrontOffice.", data: String(err) }))
    res.end();
  }
}

async function borrarPublicacionController(req, res, next) {
  try {
    let request = {
      idNormaSDIN: req.body.idNormaSDIN,
      idUsuario: req.body.idUsuario,
    };

    if ((req.ip).substring(0, 7) === "::ffff:") {
      request.ip = req.ip.substring(7);
    }
    else {
      request.ip = req.ip;
    }
    await borrarPublicacion(request)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Publicación borrada con éxito.' })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al borrar la publicación en el FrontOffice.", data: String(err) }))
    res.end();
  }
}

async function normasTiposSDINController(req, res, next) {
  try {
    let request = {}
    request.paginaActual = req.query?.paginaActual
    request.limite = req.query?.limite
    
    let respuesta = await normaTiposSDIN(request)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tipos de Norma SDIN.', data: respuesta.tipos, total: respuesta.total })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function editarNormasTiposSDINController(req, res, next) {
  try {
    let respuesta = await editarNormasTiposSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma actualizado.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function eliminarNormasTiposSDINController(req, res, next) {
  try {
    let respuesta = await eliminarNormasTiposSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma eliminado.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function agregarNormasTiposSDINController(req, res, next) {
  try {
    let respuesta = await agregarNormasTiposSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Tipo de Norma agregado.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function agregarDependenciasSDINController(req, res, next) {
  try {
    let comprobar = await comprobarDependenciaRepetida(req.body)
    if(comprobar.length > 0) {
      throw new Error("La dependencia que estas intentando agregar ya existe.")
    }
    let respuesta = await agregarDependenciasSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Dependencia agregada.', data: respuesta })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function editarDependenciasSDINController(req, res, next) {
  try {
    let respuesta = await editarDependenciasSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Dependencia editada.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function eliminarDependenciasSDINController(req, res, next) {
  try {
    let respuesta = await eliminarDependenciasSDIN(req.body)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Dependencia eliminada.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}


async function traerOrganismosSDINController(req, res, next) {
  try {
    let request = {};

    let respuesta = await traerOrganismos(request)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Organismos SDIN.', data: respuesta }))
    res.end();
    return;

  }
  catch (er) {
    console.log(er)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Organismos.", data: String(er) }))
    res.end();
    return;

  }
}

async function traerDependenciasSDINController(req, res, next) {
  try {
    let request = {
      padre: req?.query?.padre,
      estado: req?.query?.estado,
      idOrganismoEmisor: req.query?.idOrganismoEmisor ? parseInt(req.query.idOrganismoEmisor) : '',
      idDependencia: req.query?.id ? parseInt(req.query.id) : '',
      texto: req.query?.texto
    };
    if (req.query.limite && req.query.paginaActual) {
      request.limite = parseInt(req.query.limite);
      request.paginaActual = parseInt(req.query.paginaActual);
    }

    let { dependencias, total } = await traerDependencias(request)
    const totalPaginas = Math.ceil(total / request.limite)

    res.status(200)
    res.send(JSON.stringify({ mensaje: 'PIN: Dependencias SDIN.', data: dependencias, total, totalPaginas }))
    res.end();
    return;

  }
  catch (er) {
    console.log(er)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al traer Dependencias SDIN.", data: String(er) }))
    res.end();
    return;

  }
}

async function normasSubtiposSDINController(req, res, next) {
  try {
    let respuesta = await normaSubtiposSDIN()
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Subtipos de Norma SDIN.', data: respuesta })).end();
    return;
  }
  catch (err) {
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error.", data: String(err) }))
    res.end();
  }
}

async function exportarExcelNormas(req, res, next) {
  let request = {};
  request.normaNumero_desde = req.body.normaNumero_desde;
  request.normaNumero_hasta = req.body.normaNumero_hasta;
  request.idSeccion = req.body.idSeccion;
  request.idNormaTipo = req.body.idNormaTipo;
  request.idClase = req.body.idClase;
  request.idRama = req.body.idRama;
  request.idNormaSDIN = req.body.idNormaSDIN;
  request.temas = req.body.temas;
  request.descriptores = req.body.descriptores;
  request.dependencias = req.body.dependencias;
  request.idReparticionOrganismo = req.body?.idReparticionOrganismo;
  request.idReparticion = req.body?.idReparticion;
  request.idNormasEstadoTipo = req.body?.idNormasEstadoTipo;
  request.normaNumero = req.body.normaNumero;
  request.normaAnio = req.body?.normaAnio;
  request.fechaSancion = req.body?.fechaSancion;
  request.checkDigesto = req.body?.checkDigesto;
  request.idTipoPublicacion = req.body?.idTipoPublicacion;
  request.usuarioAsignado = req.body?.usuarioAsignado;
  request.observaciones = req.body?.observaciones;
  request.alcance = req.body?.alcance;
  request.tipoPalabra = req.body?.tipoPalabra;
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.registroHasta - req.body.registroDesde + 1;
  request.offset = req.body.registroDesde - 1;
  //Ordenamiento
  request.campo = 'idNormaSDIN';
  request.orden = 'DESC';

  try {

    const { normas } = await traerNormas(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer las Normas.", data: e })
      });

    //Crea el excel desde el json de las normas, el 2do param. especifica el orden de las columnas
    let worksheet = XLSX.utils.json_to_sheet(normas, { header: ["idNormaSDIN", "normaTipo", "normaNumero", "normaSubtipo", "seccionSigla", "organismo", "normaAnio", "fechaSancion", "normaSumario", "rama", "analista", "fechaCarga", "normasEstadoTipo", "importadaBO", "temasGenerales"], skipHeader: false });
    //Piso los nombres de las columnas
    XLSX.utils.sheet_add_aoa(worksheet, [["id", "Tipo de Norma", "Número", "Subtipo", "Sección", "Organismo", "Año", "Fecha de Sanción", "Síntesis", "Rama", "Analista", "Fecha de Carga en SDIN", "Estado", "Es importada de BO", "Temas Generales"]], { origin: "A1" })
    //Config. del ancho de las columnas (en orden)
    worksheet["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Normas");

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

async function agregarDependenciaNormasController(req, res, next) {
  try {
    let request = {
      normas: req.body.normas,
      idDependencia: req.body.idDependencia,
      idUsuario: req.usuario.idUsuarioSDIN,
      apellidoNombre: req.usuario.apellidoNombre
    }
    await agregarDependenciaNormas(request)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Dependencia agregada con éxito.', data: request })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al agregar dependencias.", data: String(err) }))
    res.end();
  }
}

async function borrarDependenciaNormasController(req, res, next) {
  try {
    let request = {
      normas: req.body.normas,
      idDependencia: req.body.idDependencia,
      idUsuario: req.usuario.idUsuarioSDIN,
      apellidoNombre: req.usuario.apellidoNombre
    }
    await borrarDependenciaNormas(request)
      .catch((err) => {
        throw err
      });
    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Dependencia agregada con éxito.', data: request })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Error al agregar dependencias.", data: String(err) }))
    res.end();
  }
}

async function traerEstadosSDINController(req, res, next) {
  try {
    let results = await traerEstadosSDIN()

    res.status(200).send(JSON.stringify({ mensaje: 'PIN: Estados.', data: results })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Estados.", data: String(err) }))
    res.end();
  }
}

async function traerNivelesController(req, res, next) {
  try {
    let results = await traerNiveles()

    res.status(200).send(JSON.stringify({ mensaje: 'PIN: niveles.', data: results })).end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Estados.", data: String(err) }))
    res.end();
  }
}

async function traerTrazabilidadController(req, res, next) {

  let request = {};
  //Usuario
  request.usuario = req.body.user
  request.idNorma = req.body.idNorma
  request.fechaDesde = req.body.fechaDesde
  request.fechaHasta = req.body.fechaHasta
  request.idTipoOperacion = req.body.idTipoOperacion
  //Paginacion (viene tambien en el req.body)
  request.limite = req.body.limite;
  request.paginaActual = req.body.paginaActual;
  //Ordenamiento
  request.campo = req.body.campo;
  request.orden = req.body.orden;

  try {

    const { logs, totalLogs } = await traerTrazabilidad(request)
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer la trazabilidad.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Logs:`, logs, totalLogs: totalLogs[0]['COUNT(*)'] }))
    res.end();
    return;
  }
  catch (err) {
    console.log(err)
    res.status(409)
    res.send(JSON.stringify({ mensaje: "PIN: Estados.", data: String(err) }))
    res.end();
  }
}

async function traerUsuariosParaTrazabilidad(req, res, next) {
  try {

    const users = await traerTrazabilidadUsuarios()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer usuarios para la jerarquia.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Temas`, data: users }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

async function traerTiposParaTrazabilidad(req, res, next) {
  try {

    const tipos = await traerTiposTrazabilidad()
      .catch((e) => {
        throw ({ mensaje: "PIN: Error al traer tipos para la trazanilidad.", data: e })
      });

    res.status(200)
    res.send(JSON.stringify({ mensaje: `PIN: Tipos`, data: tipos }))
    res.end();
    return;
  }
  catch (e) {
    console.log(e)
    res.status(409);
    res.send(JSON.stringify({ e }))
    res.end();
    return;
  }
}

module.exports = {
  importarNormasNoPublicadasBOController, importarNormasPublicadasBOController,
  traerNormasNoPublicadasBOController, traerNormasPublicadasBOController,
  traerNormasController, traerNormaController, crearNormaSDINController, traerClasesController,
  traerGestionesController, traerTiposPublicacionesSDINController, editarNormasSDINController,
  traerTemasController, traerDescriptoresPorIdNormaSDINController, agregarDescriptorController,
  asignarNormasSDINController, traerRelacionesTiposSDINController, crearRelacionSDINController,
  traerRelacionesDeNormaSDINController, editarRelacionSDINController, eliminarRelacionSDINController,
  traerDescriptoresController, agregarDescriptorPorIdNormaSDINController,
  eliminarDescriptorPorIdNormaSDINController, traerTemasPorIdNormaSDINController,
  traerRamaPorIdNormaSDINController, traerRamasController,
  agregarTemaPorIdNormaSDINController, eliminarTemaPorIdNormaSDINController,
  agregarRamaPorIdNormaSDINController, eliminarRamaPorIdNormaSDINController,
  editarTextoOriginalSDINController, editarTextoActualizadoSDINController,
  editarEstadoNormasSDINController, checkAprobadoDocumentalController, borrarDescriptorController,
  editarEstadoNormasSDINController, checkAprobadoDocumentalController,
  traerTemasABMController, agregarTemasController, editarTemasController, eliminarTemasController, habilitarTemaController,
  traerClasesABMController, agregarClasesController, editarClasesController, eliminarClasesController,
  traerRelacionesTiposABMController, agregarRelacionesTiposController, editarRelacionesTiposController, eliminarRelacionesTiposController,
  traerJerarquiaTemasController, borrarJerarquiaTemasController, crearJerarquiaTemasController, traerJerarquiaNormaController,
  traerRamasABMController, agregarRamasController, editarRamasController, eliminarRamasController,
  traerCausalesABMController, agregarCausalesController, editarCausalesController, eliminarCausalesController,
  traerPatologiasABMController, agregarPatologiasController, editarPatologiasController, eliminarPatologiasController,
  publicarNormaFrontController, normasTiposSDINController, exportarExcelNormas, borrarNormasSDINController,
  borrarPublicacionController, normasSubtiposSDINController, agregarAnexoController, borrarAnexoController, traerDependenciasSDINController, traerOrganismosSDINController, traerHistorialSDINController, traerHistorialDigestoController,
  editarNormasTiposSDINController, eliminarNormasTiposSDINController, agregarNormasTiposSDINController,
  agregarDependenciasSDINController, editarDependenciasSDINController, eliminarDependenciasSDINController, agregarDependenciaNormasController,
  traerEstadosSDINController, traerNivelesController, editarArchivoTextoActualizadoSDINController,
  traerTrazabilidadController, traerUsuariosParaTrazabilidad,
  traerImagenesPorIdNormaSDINController, traerImagenPorIdNormaSDINController,
  traerTiposParaTrazabilidad, agregarAdjuntoController, borrarAdjuntoController, borrarDependenciaNormasController,
  editarDescriptorController, traerJerarquiaTemasArbolController
}