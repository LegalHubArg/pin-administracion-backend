const express = require('express');
const router = express.Router();

const { checkAuth } = require('../../middleware/auth/authMW');
const { checkUsuarioPIN } = require('../../middleware/usuarios/checkUsuarioPIN');

const { traerPatologiasNormativasController,
    guardarAnalisisEpistemologicoController, traerAnexosDJController,
    traerAnalisisEpistemologicoController,
    traerCausalesController, traerTiposAbrogacionController,
    traerFormulario1Controller, guardarFormulario1Controller,
    traerFormulario2Controller, guardarFormulario2Controller,
    guardarArbolTematicoController, traerFormulario3Controller,
    guardarFormulario3Controller, traerArbolTematicoController,
    guardarFormulario4Controller, traerFormulario4Controller,
    guardarFormulario5Controller, traerFormulario5Controller,
    guardarFormulario6Controller, traerFormulario6Controller,
    generarListadoAnexoIPrevioController, generarAnexoIPorRamaPrevioController,
    generarAnexoIIPrevioController, generarAnexoIIIPrevioController,
    traerFormulario7Controller, guardarFormulario7Controller,
    generarAnexoIVPrevioController, traerLeyesDigestoController, corteDigestoController,
    traerCortesDigestoController, generarListadoAnexoIController, generarAnexoIPorRamaController,
    generarAnexoIIController, generarAnexoIIIController, generarAnexoIVController,
    traerAnexosFirmadosController, firmarAnexoController, cargarDocumentoFirmadoController,
    editarCorteDigestoController, crearLeyDigestoController } = require('../../controllers/DJ/dj-controller.js');
const { traerArchivoDigesto } = require('../../helpers/functionsS3');

router.get('/patologias-normativas', traerPatologiasNormativasController)
router.get('/anexos', traerAnexosDJController)
router.get('/causales', traerCausalesController)
router.get('/tipos-abrogacion', traerTiposAbrogacionController)
router.post('/analisis-epistemologico', checkAuth, checkUsuarioPIN, traerAnalisisEpistemologicoController)
router.post('/analisis-epistemologico/guardar', checkAuth, checkUsuarioPIN, guardarAnalisisEpistemologicoController)
router.post('/arbol-tematico/guardar', checkAuth, checkUsuarioPIN, guardarArbolTematicoController)
router.get('/arbol-tematico', traerArbolTematicoController)
router.get('/leyes-digesto', traerLeyesDigestoController)

router.post('/crear-ley', checkAuth, checkUsuarioPIN, crearLeyDigestoController)

router.post('/corte-digesto', checkAuth, checkUsuarioPIN, corteDigestoController)
router.post('/cortes', checkAuth, checkUsuarioPIN, traerCortesDigestoController)
router.post('/cortes/editar', checkAuth, checkUsuarioPIN, editarCorteDigestoController)

////////////////// FORMULARIOS \\\\\\\\\\\\\\\\\\\
router.post('/analisis-epistemologico/formulario1', checkAuth, checkUsuarioPIN, traerFormulario1Controller)
router.post('/analisis-epistemologico/formulario1/guardar', checkAuth, checkUsuarioPIN, guardarFormulario1Controller)
router.post('/analisis-epistemologico/formulario2', checkAuth, checkUsuarioPIN, traerFormulario2Controller)
router.post('/analisis-epistemologico/formulario2/guardar', checkAuth, checkUsuarioPIN, guardarFormulario2Controller)
router.post('/analisis-epistemologico/formulario3', checkAuth, checkUsuarioPIN, traerFormulario3Controller)
router.post('/analisis-epistemologico/formulario3/guardar', checkAuth, checkUsuarioPIN, guardarFormulario3Controller)
router.post('/analisis-epistemologico/formulario4', checkAuth, checkUsuarioPIN, traerFormulario4Controller)
router.post('/analisis-epistemologico/formulario4/guardar', checkAuth, checkUsuarioPIN, guardarFormulario4Controller)
router.post('/analisis-epistemologico/formulario5', checkAuth, checkUsuarioPIN, traerFormulario5Controller)
router.post('/analisis-epistemologico/formulario5/guardar', checkAuth, checkUsuarioPIN, guardarFormulario5Controller)
router.post('/analisis-epistemologico/formulario6', checkAuth, checkUsuarioPIN, traerFormulario6Controller)
router.post('/analisis-epistemologico/formulario6/guardar', checkAuth, checkUsuarioPIN, guardarFormulario6Controller)
router.post('/analisis-epistemologico/formulario7', checkAuth, checkUsuarioPIN, traerFormulario7Controller)
router.post('/analisis-epistemologico/formulario7/guardar', checkAuth, checkUsuarioPIN, guardarFormulario7Controller)

////////////////// ANEXOS \\\\\\\\\\\\\\\\\\\
//Vistas Previas
router.post('/anexoI/previo', checkAuth, generarAnexoIPorRamaPrevioController)
router.get('/anexoI/listado/previo', checkAuth, generarListadoAnexoIPrevioController)
router.get('/anexoII/previo', checkAuth, generarAnexoIIPrevioController)
router.get('/anexoIII/previo', checkAuth, generarAnexoIIIPrevioController)
router.get('/anexoIV/previo', checkAuth, generarAnexoIVPrevioController)

//Generacion de anexos finales
router.post('/anexoI', checkAuth, generarAnexoIPorRamaController)
router.post('/anexoI/listado', checkAuth, generarListadoAnexoIController)
router.post('/anexoII', checkAuth, generarAnexoIIController)
router.post('/anexoIII', checkAuth, generarAnexoIIIController)
router.post('/anexoIV', checkAuth, generarAnexoIVController)

router.post('/anexos-firmados', checkAuth, checkUsuarioPIN, traerAnexosFirmadosController)

router.post('/firmar-anexo', checkAuth, checkUsuarioPIN, firmarAnexoController)
router.post('/cargar-anexo-firmado', checkAuth, checkUsuarioPIN, cargarDocumentoFirmadoController)

router.post('/traerArchivoBucketS3', checkAuth, traerArchivoDigesto);

module.exports = router;