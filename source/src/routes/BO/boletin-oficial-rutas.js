const express = require('express');
const router = express.Router();

//Middlewares
const { checkAuth, usuarioFirmaMW } = require('../../middleware/auth/authMW');
const { checkUsuarioPIN } = require('../../middleware/usuarios/checkUsuarioPIN');
const { checkUsuarioPINAdminBO } = require('../../middleware/usuarios/checkUsuarioPINRoles');
const { checkNormaTipoCrear, checkExisteNormaTipo } = require('../../middleware/BO/checkNormaTipo')
const { checkExisteNormaSubtipo, checkNormaSubtipoCrear } = require('../../middleware/BO/checkNormaSubtipo')
const { checkNormaAcronimo } = require('../../middleware/BO/checkNormaAcronimo')
const { checkBoletinCrear, checkBoletinEstado, checkBoletinDescargado,
    checkBoletinFirmado } = require('../../middleware/BO/checkBoletin')
//Controllers
const { crearNormaTipoController, borrarNormaTipoController, traerNormaTipoController, traerNormasTiposController,
    traerNormasSubtiposController, traerNormaSubtipoController, borrarNormaSubtipoController, crearNormaSubtipoController,
    traerNormaController, traerNormasPropiasController,
    traerNormaDeCuentaController,
    traerNormasDeReparticionesController,
    traerNormasDeReparticionController,
    crearNormaController, borrarNormaController,
    traerSumarioSeccionTipoReparticionesController, traerSumarioSeccionController, traerSumarioSeccionesController,
    traerSumarioSeccionSubtiposController, traerSumarioController, traerFeriadosPorAnioController,
    traerFeriadoPorFechaController, crearFeriadoController, borrarFeriadoPorIdController,
    traerSumarioItemPorIdController, traerSeccionPorIdController, crearSumarioItemController,
    crearSeccionController, borrarSeccionController,
    borrarSumarioItemPorIdController, borrarSeccionPorIdController, revisionController,
    traerObservacionesMotivosController, crearObservacionController, traerPrioridadesController, asignarPrioridadController,
    cotizarNormaController, aprobarNormaParaCotizacionController, editarNormaController, editarNormaMetaController,
    aprobarNormaController, desaprobarNormaController, traerObservacionesPorIdUsuarioController, traerObservacionesDeReparticionesDelUsuarioController,
    crearBoletinController, actualizarSeccionPorIdController,
    traerVistaPreviaBoletinController,
    traerVistaPreviaDocBoletinController,
    traerNormasDeUnBoletinController, traerNormasPorFechaLimiteController, traerBoletinesEnEdicionController, traerBoletinPorIdController,
    traerNormasPorFechaPublicacionSeccionController, editarBoletinController, traerAnexosPorIdNormaController,
    editarNormaDigitalizacionController,
    traerVistaPreviaNormaController,

    traerEstadosNormasController,
    traerNormasController, descargarBoletinController, anularDescargaBoletinController,
    anularFirmaBoletinController, borrarBoletinController, publicarBoletinController,
    firmarBoletinController,
    traerBoletinPDFController,
    traerSeparataPDFController,
    editarNormaSubtipoController,
    firmarBoletinGEDOController,
    traerDocumentosPublicadosController,
    reemplazarDocumentoController, traerNormasBoletinDesdeHastaController, asociarAvisoController, editarFechaLimiteController,
    revisarNormaController, ultimosUsuariosEdicionController, registrarIngresoEdicionController, crearSumarioSubtipoController,
    borrarSumarioSubtipoController, crearSumarioReparticionController, borrarSumarioReparticionController, editarNormaTipoController, 
    ordenarSeccionesController, ordenarNormaTiposSumarioController, traerTodosNormaTipoController, exportarNormas, exportarBoletines,
    ordenarSubtiposSumarioController, exportarBoletinesPublicados,
    ordenarReparticionesSumarioController,
    traerSumarioSeccionReparticionesController, traerOrganismosEmisoresController, traerBoletinesPublicadosController, traerPublicacionesNormaDesdeHastaController, guardarRepublicacionesController,
    traerUsuariosController, traerPerfilController, traerCuentaController, crearOrganismosEmisoresController,
    reactivarSumarioSubtipoController, editarOrganismosEmisoresController, eliminarOrganismosEmisoresController,
    reactivarSumarioItemPorIdController,
    traerOrganismosEmisoresExternoController
} = require('../../controllers/BO/bo-controller');
const { subirArchivoBucketS3, traerArchivoBucketS3, eliminarArchivoBucketS3, traerArchivoFirmadoBucketS3 } = require('../../helpers/functionsS3');
const { traerPdfGEDO, traerPdfGEDONumeroEspecial, firmaDirectaDocumento } = require('../../helpers/consultaGEDO');
const { convertirConLibreOffice } = require('../../helpers/convertirArchivos');
const { esEditable } = require('../../middleware/BO/checkNormaEditable');
const { traerCuentasController,crearCuentaController , traerCuentaPorIdController, traerPermisosCuentaController, traerUsuariosBOController,
    crearUsuarioBOController, borrarUsuarioBOController, editarUsuarioBOController, borrarCuentaController,deshacerEliminarCuentaController } = require('../../controllers/BO/cuentas');


//////////////////// TIPOS NORMAS \\\\\\\\\\\\\\\\\\\\\
//Rutas ABM de Tipos de Normas
router.post('/normas/tipos', checkAuth, checkUsuarioPIN, /* checkUsuarioPINAdminBO, */ traerNormasTiposController);
router.post('/normas/tipos/todos', checkAuth, checkUsuarioPIN, traerTodosNormaTipoController);
router.post('/normas/tipos/tipo', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaTipo, traerNormaTipoController);
router.post('/normas/tipos/crear', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkNormaTipoCrear, crearNormaTipoController);
router.post('/normas/tipos/borrar', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaTipo, borrarNormaTipoController);
router.post('/normas/tipos/editar', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaTipo, editarNormaTipoController);
//////////////////// SUBTIPOS NORMAS \\\\\\\\\\\\\\\\\\\\\
//Rutas ABM de Subtipos de Normas
router.post('/normas/subtipos', checkAuth, checkUsuarioPIN,/*  checkUsuarioPINAdminBO, */ traerNormasSubtiposController);
router.post('/normas/subtipos/subtipo', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaSubtipo, traerNormaSubtipoController);
router.post('/normas/subtipos/crear', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkNormaSubtipoCrear, crearNormaSubtipoController);
router.post('/normas/subtipos/borrar', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaSubtipo, borrarNormaSubtipoController);
router.post('/normas/subtipos/editar', checkAuth, checkUsuarioPIN, checkUsuarioPINAdminBO, checkExisteNormaSubtipo, editarNormaSubtipoController);

//////////////////// NORMAS \\\\\\\\\\\\\\\\\\\\\
router.post('/normas', checkAuth, checkUsuarioPIN, traerNormasController); //Trae las normas por filtro de busqueda
router.post('/normas/externos', checkAuth, checkUsuarioPIN, traerNormasController); //Buscador para usuarios EXTERNOS (propias y repas que opera)
router.post('/normas/norma', checkAuth, checkUsuarioPIN, traerNormaController); //Chequear que sea del usuario que dice ser
router.post('/normas/normas-propias', checkAuth, checkUsuarioPIN, traerNormasPropiasController); //Chequear que sea del usuario que dice ser
router.post('/normas/normas-cuenta', checkAuth, checkUsuarioPIN, traerNormaDeCuentaController);
router.post('/normas/normas-reparticiones-todas', checkAuth, checkUsuarioPIN, traerNormasDeReparticionesController); //Chequear que sea del usuario que dice ser
router.post('/normas/normas-reparticion', checkAuth, traerNormasDeReparticionController);
router.post('/normas/norma/crear', checkAuth, checkUsuarioPIN, checkNormaAcronimo, crearNormaController);
router.post('/normas/norma/editar', checkAuth, checkUsuarioPIN, checkNormaAcronimo, editarNormaController);
router.post('/normas/norma/editar-meta', checkAuth, checkUsuarioPIN, checkNormaAcronimo, editarNormaMetaController);
router.post('/normas/norma/borrar', checkAuth, checkUsuarioPIN, borrarNormaController);
router.post('/normas/estados', checkAuth, checkUsuarioPIN, traerEstadosNormasController);

router.post('/normas/norma/editar/digitalizacion', checkAuth, checkUsuarioPIN, editarNormaDigitalizacionController);
router.post('/normas/norma/vista-previa', checkAuth, checkUsuarioPIN, traerVistaPreviaNormaController);

router.post('/normas/norma/cotizar', checkAuth, cotizarNormaController);
router.post('/normas/norma/revisar', checkAuth, revisarNormaController);
router.post('/normas/norma/aprobarParaCotizacion', checkAuth, aprobarNormaParaCotizacionController);
router.post('/normas/norma/aprobar', checkAuth, aprobarNormaController);
router.post('/normas/norma/desaprobar', checkAuth, desaprobarNormaController);
router.post('/normas/norma/anexos', checkAuth, traerAnexosPorIdNormaController);
router.post('/normas/norma/asociarAviso', checkAuth, checkUsuarioPIN, asociarAvisoController);
router.post('/normas/norma/registrar-ingreso-edicion', checkAuth, checkUsuarioPIN, registrarIngresoEdicionController);
router.post('/normas/norma/ultimos-usuarios-edicion', checkAuth, checkUsuarioPIN, ultimosUsuariosEdicionController);
router.post('/normas/norma/publicaciones', checkAuth, checkUsuarioPIN, traerPublicacionesNormaDesdeHastaController);
router.post('/normas/norma/guardar-republicaciones', checkAuth, checkUsuarioPIN, guardarRepublicacionesController);
router.post('/normas/editar/fechaLimite', checkAuth, checkUsuarioPIN, editarFechaLimiteController);

router.post('/normas/exportar', checkAuth, checkUsuarioPIN, exportarNormas)

//////////////////// INTEGRACION GEDO \\\\\\\\\\\\\\\\\\\\\
router.post('/normas/traerPdfGEDO', traerPdfGEDO);
router.post('/normas/traerPdfGEDO/numeroespecial', traerPdfGEDONumeroEspecial);

//////////////////// Bucket S3 \\\\\\\\\\\\\\\\\\\\\
router.post('/subirArchivoBucketS3', checkAuth, subirArchivoBucketS3);
router.post('/traerArchivoBucketS3', checkAuth, traerArchivoBucketS3);
router.post('/eliminarArchivoBucketS3', checkAuth, subirArchivoBucketS3);

router.post('/traerArchivoFirmadoBucketS3', checkAuth, traerArchivoFirmadoBucketS3);

//////////////////// PERMISOS \\\\\\\\\\\\\\\\\\\\\
//router.post('/permisos', checkUsuarioPIN, PermisosController);

//////////////////// NOTIFICACIONES \\\\\\\\\\\\\\\\\\\\\
//router.post('/getNotificacionesPorUsuario', getNotificacionesPorUsuarioController);
//router.post('/getNotificacionesPorReparticion', getNotificacionesPorReparticionController);

//////////////////// USUARIOS DE CARGA \\\\\\\\\\\\\\\\\\\\\
router.post('/usuarios/relacion', checkAuth, checkUsuarioPIN, traerUsuariosController); //Trae las normas por filtro de busqueda
router.post('/usuarios/perfil', checkAuth, checkUsuarioPIN, traerPerfilController);
router.post('/usuarios/cuenta', checkAuth, checkUsuarioPIN, traerCuentaController);

//////////////////// SUMARIO \\\\\\\\\\\\\\\\\\\\\

router.post('/sumario/seccion/tipos', traerSumarioSeccionController);
router.post('/sumario/seccion/reparticiones', traerSumarioSeccionReparticionesController); //Para las que no son poder (tabla bo_seccion_reparticiones)
router.post('/sumario/seccion/tipo/reparticiones', traerSumarioSeccionTipoReparticionesController);
router.post('/sumario/seccion/tipo/subtipos', traerSumarioSeccionSubtiposController);
router.post('/sumario/secciones/ordenar', checkAuth, ordenarSeccionesController);
router.post('/sumario/tipos/ordenar', checkAuth, ordenarNormaTiposSumarioController);
router.post('/sumario/subtipos/ordenar', checkAuth, ordenarSubtiposSumarioController);
router.post('/sumario/reparticiones/ordenar', checkAuth, ordenarReparticionesSumarioController);

//VER TODO
router.get('/sumario', traerSumarioController);
router.get('/sumario/secciones', traerSumarioSeccionesController);
//VER ITEM
router.post('/sumario/item', checkAuth, traerSumarioItemPorIdController);
router.post('/sumario/secciones/seccion', checkAuth, traerSeccionPorIdController);
//CREAR ITEM
router.post('/sumario/item/crear', checkAuth, crearSumarioItemController);
router.post('/sumario/secciones/seccion/crear', checkAuth, crearSeccionController);
//BORRAR ITEM
router.post('/sumario/item/borrar', checkAuth, borrarSumarioItemPorIdController);
router.post('/sumario/secciones/seccion/borrar', checkAuth, borrarSeccionPorIdController);
router.post('/sumario/secciones/seccion/actualizar', checkAuth, actualizarSeccionPorIdController);

router.post('/sumario/item/reactivar', checkAuth, reactivarSumarioItemPorIdController);
//Rutas de Items del Sumario
//router.post('/nuevoItem', nuevoSumarioItemController);
//router.post('/eliminarItem', eliminarSumarioItemController);
//router.post('/items', getSumarioItemsController);

//Rutas de Items-Subtipos
router.post('/sumario/subtipos/crear', checkAuth, crearSumarioSubtipoController);
router.post('/sumario/subtipos/borrar', checkAuth, borrarSumarioSubtipoController);
router.post('/sumario/subtipos/reactivar', checkAuth, reactivarSumarioSubtipoController);
//router.post('/items/getSubtipos', getSubtiposSumarioItemController);

//Rutas de Items-Reparticiones
router.post('/sumario/reparticiones/crear', checkAuth, crearSumarioReparticionController);
router.post('/sumario/reparticiones/borrar', checkAuth, borrarSumarioReparticionController);
//router.post('/items/getReparticiones', getReparticionesSumarioItemController);

//Rutas de Secciones
//router.post('/nuevaSeccion', nuevaSeccionController);
//router.post('/eliminarSeccion', eliminarSeccionController);
//router.post('/sumario/traerSecciones', getSeccionesSumarioController);
//router.post('/getSeccionesPorUsuario', /* getSeccionesPorUsuarioController */);

//////////////////// FERIADOS \\\\\\\\\\\\\\\\\\\\\
//Rutas ABM de Feriados
router.post('/feriados', checkAuth, traerFeriadosPorAnioController);
router.post('/feriados/feriado', checkAuth, traerFeriadoPorFechaController);
router.post('/feriados/feriado/crear', checkAuth, crearFeriadoController);
router.post('/feriados/feriado/borrar', checkAuth, borrarFeriadoPorIdController);


//////////////////// OBSERVACIONES \\\\\\\\\\\\\\\\\\\\\
router.post('/normas/observaciones/motivos', checkAuth, traerObservacionesMotivosController);
router.post('/normas/observaciones/crear', checkAuth, esEditable, crearObservacionController);
router.post('/normas/observaciones-propias', checkAuth, traerObservacionesPorIdUsuarioController);
router.post('/normas/observaciones-reparticiones', checkAuth, traerObservacionesDeReparticionesDelUsuarioController);

//////////////////// REVISION \\\\\\\\\\\\\\\\\\\\\
router.post('/normas/revision', checkAuth, revisionController);

//////////////////// PRIORIDADES \\\\\\\\\\\\\\\\\\\\\
router.post('/normas/prioridades', checkAuth, traerPrioridadesController);
router.post('/normas/prioridades/asignar', checkAuth, esEditable, asignarPrioridadController);

//////////////////// BOLETIN \\\\\\\\\\\\\\\\\\\\\
router.post('/boletin/crear', checkAuth, checkBoletinCrear, crearBoletinController);

router.post('/boletin/vista-previa', checkAuth, checkUsuarioPIN, traerVistaPreviaBoletinController);
//Srouter.post('/boletin/vista-previa-doc', checkAuth, checkUsuarioPIN, traerVistaPreviaDocBoletinController);

router.post('/boletin/traerNormasDeUnBoletin', checkAuth, traerNormasDeUnBoletinController);

router.post('/boletin/traerNormasPorFechaLimite', checkAuth, traerNormasPorFechaLimiteController);

router.post('/boletin/traerNormasBoletinDesdeHasta', checkAuth, traerNormasBoletinDesdeHastaController);

router.post('/boletin/traerBoletinesEnEdicion', checkAuth, traerBoletinesEnEdicionController);

router.post('/boletin/traerBoletinesPublicados', checkAuth, traerBoletinesPublicadosController);

router.post('/boletin', checkAuth, traerBoletinPorIdController);

router.post('/boletin/traerNormasPorFechaPublicacionSeccion', checkAuth, traerNormasPorFechaPublicacionSeccionController);

router.post('/boletin/editar', checkAuth, checkBoletinEstado, editarBoletinController);

router.post('/boletin/descargar', checkAuth, checkBoletinEstado, descargarBoletinController);

router.post('/boletin/descargar-boletin-pdf', checkAuth, traerBoletinPDFController);  //Chequear estado 2 armar fx genérica
router.post('/boletin/descargar-separata-pdf', checkAuth, traerSeparataPDFController);  //Chequear estado 2 armar fx genérica

router.post('/boletin/anularDescarga', checkAuth, checkBoletinDescargado, anularDescargaBoletinController);

router.post('/boletin/anularFirma', checkAuth, checkBoletinFirmado, anularFirmaBoletinController);

router.post('/boletin/borrar', checkAuth, borrarBoletinController);

router.post('/boletin/firmar', checkAuth, usuarioFirmaMW, checkBoletinDescargado, firmarBoletinController);

router.post('/boletin/firmarGEDO', checkAuth, usuarioFirmaMW, checkBoletinDescargado, firmarBoletinGEDOController);

router.post('/boletin/publicar', checkAuth, checkBoletinFirmado, publicarBoletinController);

router.post('/boletin/traerDocumentosPublicados', checkAuth, traerDocumentosPublicadosController);

router.post('/boletin/reemplazarDocumento', checkAuth, reemplazarDocumentoController);

router.post('/boletin/exportar', checkAuth, exportarBoletines);

router.post('/boletin/publicados/exportar', checkAuth, exportarBoletinesPublicados);

/* router.post('/firmarDocumento', checkAuth, firmaDirectaDocumento); */

//////////////////// CONVERTIR DOCUMENTOS \\\\\\\\\\\\\\\\\\\\\
router.post('/convertir-documento', checkAuth, convertirConLibreOffice);


//Cuentas
router.post('/cuentas', checkAuth, traerCuentasController);
router.post('/cuenta', checkAuth, traerCuentaPorIdController); //Trae los datos, los usuarios y los perfiles de la cuenta
router.post('/cuenta/permisos', checkAuth, traerPermisosCuentaController);
router.post('/cuentas/crear', checkAuth, crearCuentaController);
router.post('/cuentas/borrar', checkAuth, borrarCuentaController)
router.post('/usuarios', checkAuth, traerUsuariosBOController);
router.post('/usuarios/crear', checkAuth, crearUsuarioBOController);
router.post('/usuarios/borrar', checkAuth, borrarUsuarioBOController);
router.post('/usuarios/editar', checkAuth, editarUsuarioBOController);
router.post('/cuentas/deshacerEliminar', checkAuth, deshacerEliminarCuentaController)

//Organismos Emisores
router.post('/organismos-emisores', checkAuth, traerOrganismosEmisoresController)
router.post('/organismos-emisores-externo', checkAuth, traerOrganismosEmisoresExternoController)
router.post('/organismos-emisores/crear', checkAuth, crearOrganismosEmisoresController)
router.post('/organismos-emisores/editar', checkAuth, editarOrganismosEmisoresController)
router.post('/organismos-emisores/borrar', checkAuth, eliminarOrganismosEmisoresController)


module.exports = router;
