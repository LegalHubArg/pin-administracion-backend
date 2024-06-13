const express = require('express');
const router = express.Router();

const { checkAuth } = require('../../middleware/auth/authMW');
const { checkUsuarioPIN } = require('../../middleware/usuarios/checkUsuarioPIN');
const { checkRamaController, checkPatologiasController, checkCausalesController, checkRelacionesTiposController,
    checkClasesController, checkTemasController, checkBoletinController } = require('../../middleware/SDIN/checks');

const { traerNormasNoPublicadasBOController, traerHistorialSDINController,
    importarNormasNoPublicadasBOController,
    traerNormasPublicadasBOController,
    traerNormasController, importarNormasPublicadasBOController,
    traerNormaController, crearNormaSDINController, traerClasesController,
    traerGestionesController, traerTiposPublicacionesSDINController,
    editarNormasSDINController, borrarNormasSDINController, asignarNormasSDINController,
    traerRelacionesTiposSDINController, crearRelacionSDINController,
    traerRelacionesDeNormaSDINController, editarRelacionSDINController,
    eliminarRelacionSDINController, traerTemasController,
    traerDescriptoresPorIdNormaSDINController, traerDescriptoresController,
    agregarDescriptorPorIdNormaSDINController, eliminarDescriptorPorIdNormaSDINController,
    traerTemasPorIdNormaSDINController, traerRamaPorIdNormaSDINController,
    traerRamasController, agregarTemaPorIdNormaSDINController,
    eliminarTemaPorIdNormaSDINController, eliminarRamaPorIdNormaSDINController,
    agregarRamaPorIdNormaSDINController, editarTextoOriginalSDINController,
    editarTextoActualizadoSDINController, checkAprobadoDocumentalController,
    editarEstadoNormasSDINController, agregarDescriptorController,
    borrarDescriptorController, traerTemasABMController, agregarTemasController,
    editarTemasController, eliminarTemasController, habilitarTemaController,
    traerClasesABMController, agregarClasesController,
    editarClasesController, eliminarClasesController,
    traerRelacionesTiposABMController, agregarRelacionesTiposController,
    editarRelacionesTiposController, eliminarRelacionesTiposController, traerJerarquiaTemasController,
    crearJerarquiaTemasController, borrarJerarquiaTemasController, traerJerarquiaNormaController,
    traerRamasABMController, agregarRamasController,
    editarRamasController, eliminarRamasController,
    traerCausalesABMController, agregarCausalesController,
    editarCausalesController, eliminarCausalesController,
    traerPatologiasABMController, agregarPatologiasController,
    editarPatologiasController, eliminarPatologiasController, publicarNormaFrontController,
    normasTiposSDINController, exportarExcelNormas, borrarPublicacionController,
    normasSubtiposSDINController, agregarAnexoController, borrarAnexoController, traerDependenciasSDINController, traerOrganismosSDINController,
    editarNormasTiposSDINController, eliminarNormasTiposSDINController, agregarNormasTiposSDINController,
    agregarDependenciasSDINController, editarDependenciasSDINController, eliminarDependenciasSDINController,
    agregarDependenciaNormasController, traerEstadosSDINController, traerNivelesController, editarArchivoTextoActualizadoSDINController,
    traerTrazabilidadController, traerUsuariosParaTrazabilidad, traerHistorialDigestoController,
    traerImagenesPorIdNormaSDINController, traerImagenPorIdNormaSDINController, 
    traerTiposParaTrazabilidad, agregarAdjuntoController, borrarAdjuntoController, borrarDependenciaNormasController,editarDescriptorController, traerJerarquiaTemasArbolController } = require('../../controllers/SDIN/sdin_controller');
const { checkAdminSDIN } = require('../../middleware/usuarios/checkUsuarioPINRoles');
const { traerArchivoNormaSDIN } = require('../../helpers/functionsS3');

router.post('/normas', checkAuth, checkUsuarioPIN, traerNormasController)
router.post('/normas/bo/no-publicadas', checkAuth, checkUsuarioPIN, traerNormasNoPublicadasBOController)
router.post('/normas/bo/publicadas', checkAuth, checkUsuarioPIN, traerNormasPublicadasBOController)
router.post('/normas/bo/no-publicadas/importar', checkAuth, checkUsuarioPIN, importarNormasNoPublicadasBOController)
router.post('/normas/bo/publicadas/importar', checkAuth, checkUsuarioPIN, importarNormasPublicadasBOController)
router.post('/norma', checkAuth, checkUsuarioPIN, traerNormaController)
router.post('/normas/crear', checkAuth, checkUsuarioPIN, crearNormaSDINController)
router.post('/normas/editar', checkAuth, checkUsuarioPIN, editarNormasSDINController)
router.post('/normas/borrar', checkAuth, checkUsuarioPIN, borrarNormasSDINController)
router.post('/normas/editar/texto-original', checkAuth, checkUsuarioPIN, editarTextoOriginalSDINController)
router.post('/normas/editar/texto-actualizado', checkAuth, checkUsuarioPIN, editarTextoActualizadoSDINController)
router.post('/normas/editar/archivo-texto-actualizado', checkAuth, checkUsuarioPIN, editarArchivoTextoActualizadoSDINController)
router.post('/normas/editar/estado', checkAuth, checkUsuarioPIN, editarEstadoNormasSDINController)
router.post('/normas/anexos/agregar', checkAuth, checkUsuarioPIN, agregarAnexoController)
router.post('/normas/anexos/borrar', checkAuth, checkUsuarioPIN, borrarAnexoController)
router.post('/normas/adjuntos/agregar', checkAuth, checkUsuarioPIN, agregarAdjuntoController)
router.post('/normas/adjuntos/borrar', checkAuth, checkUsuarioPIN, borrarAdjuntoController)
router.post('/normas/asignar', checkAuth, checkUsuarioPIN, asignarNormasSDINController)
router.get('/normas/tipos', checkAuth, normasTiposSDINController)
router.get('/normas/subtipos', checkAuth, normasSubtiposSDINController)
router.post('/normas/dependencias/agregar', checkAuth, checkUsuarioPIN, agregarDependenciaNormasController)
router.post('/normas/dependencias/borrar', checkAuth, checkUsuarioPIN, borrarDependenciaNormasController)
router.post('/clases', checkAuth, checkUsuarioPIN, traerClasesController)
router.post('/gestiones', checkAuth, checkUsuarioPIN, traerGestionesController)
router.post('/tipos-publicaciones', checkAuth, checkUsuarioPIN, traerTiposPublicacionesSDINController)
router.post('/relaciones', checkAuth, checkUsuarioPIN, traerRelacionesTiposSDINController)
router.post('/norma/historial', checkAuth, checkUsuarioPIN, traerHistorialSDINController)
router.post('/norma/historialDigesto', checkAuth, traerHistorialDigestoController)
router.post('/norma/relaciones', checkAuth, checkUsuarioPIN, traerRelacionesDeNormaSDINController)
router.post('/norma/relaciones/crear', checkAuth, checkUsuarioPIN, crearRelacionSDINController)
router.post('/norma/relaciones/editar', checkAuth, checkUsuarioPIN, editarRelacionSDINController)
router.post('/norma/relaciones/eliminar', checkAuth, checkUsuarioPIN, eliminarRelacionSDINController)
router.post('/norma/descriptores', checkAuth, checkUsuarioPIN, traerDescriptoresPorIdNormaSDINController)
router.post('/norma/descriptores/crear', checkAuth, checkUsuarioPIN, agregarDescriptorPorIdNormaSDINController)
router.post('/norma/descriptores/eliminar', checkAuth, checkUsuarioPIN, eliminarDescriptorPorIdNormaSDINController)
router.post('/norma/temas', checkAuth, checkUsuarioPIN, traerTemasPorIdNormaSDINController)
router.post('/norma/imagenes', checkAuth, checkUsuarioPIN, checkAdminSDIN, traerImagenesPorIdNormaSDINController)
router.post('/norma/imagen', checkAuth, checkUsuarioPIN, checkAdminSDIN, traerImagenPorIdNormaSDINController)
router.post('/norma/temas/crear', checkAuth, checkUsuarioPIN, checkAdminSDIN, agregarTemaPorIdNormaSDINController)
router.post('/norma/temas/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarTemaPorIdNormaSDINController)
router.post('/norma/rama', checkAuth, checkUsuarioPIN, traerRamaPorIdNormaSDINController)
router.post('/norma/rama/crear', checkAuth, checkUsuarioPIN, checkAdminSDIN, agregarRamaPorIdNormaSDINController)
router.post('/norma/rama/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarRamaPorIdNormaSDINController)
router.post('/norma/publicar', checkAuth, checkUsuarioPIN, checkBoletinController, publicarNormaFrontController)
router.post('/norma/borrar-publicacion', checkAuth, checkUsuarioPIN, borrarPublicacionController)
router.post('/temas', checkAuth, checkUsuarioPIN, traerTemasController)
router.get('/temas/jerarquia', checkAuth, traerJerarquiaTemasController)
router.get('/temas/jerarquia/arbol', checkAuth, traerJerarquiaTemasArbolController)
router.post('/temas/jerarquia/crear', checkAuth, checkUsuarioPIN, checkAdminSDIN, crearJerarquiaTemasController)
router.post('/temas/jerarquia/borrar', checkAuth, checkUsuarioPIN, checkAdminSDIN, borrarJerarquiaTemasController)
router.get('/temas/jerarquia/normas', checkAuth, traerJerarquiaNormaController)
router.post('/ramas', checkAuth, checkUsuarioPIN, traerRamasController)
router.post('/descriptores', checkAuth, checkUsuarioPIN, traerDescriptoresController)
router.post('/descriptores/crear', checkAuth, checkUsuarioPIN, checkAdminSDIN, agregarDescriptorController)
router.post('/descriptores/borrar', checkAuth, checkUsuarioPIN, checkAdminSDIN, borrarDescriptorController)
router.post('/descriptores/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarDescriptorController)
router.post('/aprobado/documentalmente', checkAuth, checkUsuarioPIN, checkAprobadoDocumentalController)
router.post('/abm/temas/traer', checkAuth, checkUsuarioPIN, traerTemasABMController)
router.post('/abm/temas/agregar', checkAuth, checkUsuarioPIN, checkTemasController, checkAdminSDIN, agregarTemasController)
router.post('/abm/temas/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarTemasController)
router.post('/abm/temas/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarTemasController)
router.post('/abm/temas/habilitar', checkAuth, checkUsuarioPIN, checkAdminSDIN, habilitarTemaController)
router.post('/abm/clases/traer', checkAuth, checkUsuarioPIN, traerClasesABMController)
router.post('/abm/clases/agregar', checkAuth, checkUsuarioPIN, checkClasesController, checkAdminSDIN, agregarClasesController)
router.post('/abm/clases/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, checkAdminSDIN, editarClasesController)
router.post('/abm/clases/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarClasesController)
router.post('/abm/relaciones-tipos/traer', checkAuth, checkUsuarioPIN, traerRelacionesTiposABMController)
router.post('/abm/relaciones-tipos/agregar', checkAuth, checkUsuarioPIN, checkAdminSDIN, checkRelacionesTiposController, agregarRelacionesTiposController)
router.post('/abm/relaciones-tipos/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarRelacionesTiposController)
router.post('/abm/relaciones-tipos/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarRelacionesTiposController)
router.post('/abm/ramas/traer', checkAuth, checkUsuarioPIN, traerRamasABMController)
router.post('/abm/ramas/agregar', checkAuth, checkUsuarioPIN, checkRamaController, checkAdminSDIN, agregarRamasController)
router.post('/abm/ramas/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarRamasController)
router.post('/abm/ramas/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarRamasController)
router.post('/abm/causales/traer', checkAuth, checkUsuarioPIN, traerCausalesABMController)
router.post('/abm/causales/agregar', checkAuth, checkUsuarioPIN, checkAdminSDIN, checkCausalesController, agregarCausalesController)
router.post('/abm/causales/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarCausalesController)
router.post('/abm/causales/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarCausalesController)
router.post('/abm/patologias/traer', checkAuth, checkUsuarioPIN, traerPatologiasABMController)
router.post('/abm/patologias/agregar', checkAuth, checkUsuarioPIN, checkAdminSDIN, checkPatologiasController, agregarPatologiasController)
router.post('/abm/patologias/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarPatologiasController)
router.post('/abm/patologias/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarPatologiasController)
router.post('/abm/normas/tipos/agregar', checkAuth, checkUsuarioPIN, checkAdminSDIN, agregarNormasTiposSDINController)
router.post('/abm/normas/tipos/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarNormasTiposSDINController)
router.post('/abm/normas/tipos/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarNormasTiposSDINController)
router.post('/abm/dependencias/agregar', checkAuth, checkUsuarioPIN, checkAdminSDIN, agregarDependenciasSDINController)
router.post('/abm/dependencias/editar', checkAuth, checkUsuarioPIN, checkAdminSDIN, editarDependenciasSDINController)
router.post('/abm/dependencias/eliminar', checkAuth, checkUsuarioPIN, checkAdminSDIN, eliminarDependenciasSDINController)
router.post('/logs/trazabilidad', checkAuth, checkUsuarioPIN, checkAdminSDIN, traerTrazabilidadController)
router.post('/logs/trazabilidad/usuarios', checkAuth, checkUsuarioPIN, checkAdminSDIN, traerUsuariosParaTrazabilidad)
router.post('/logs/trazabilidad/tipos', checkAuth, checkUsuarioPIN, checkAdminSDIN, traerTiposParaTrazabilidad)


//Exportar en xlsx
router.post('/normas/exportar', checkAuth, checkUsuarioPIN, exportarExcelNormas)

router.get('/dependencias', checkAuth, traerDependenciasSDINController);
router.get('/dependencias/niveles', checkAuth, traerNivelesController)
router.get('/organismos', checkAuth, traerOrganismosSDINController);

router.get('/normas/estados', checkAuth, traerEstadosSDINController);

router.post('/traerArchivoNorma', checkAuth, traerArchivoNormaSDIN);

module.exports = router;