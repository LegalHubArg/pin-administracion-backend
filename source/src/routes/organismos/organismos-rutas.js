const express = require('express');
const router = express.Router();

//Middlewares
const { checkAuth } = require('../../middleware/auth/authMW');
//Controllers
const { traerJerarquiaController, 
        traerReparticionesBOController,
        traerJerarquiaPorIdController,
        crearJerarquiaController,
        borrarJerarquiaPorIdController,
        traerReparticionPorIdController,
        crearReparticionController,
        borrarReparticionPorIdController } = require('../../controllers/organismos/organismos');
const { existeRepa } = require('../../middleware/organismos/checkOrganismos');


//////////////////// SUMARIO \\\\\\\\\\\\\\\\\\\\\
//Sumario completo
//router.get('/sumario', traerSumarioController);
//VER TODOS
router.get('/jerarquia',checkAuth, traerJerarquiaController);
router.post('/jerarquia',checkAuth, traerJerarquiaController); //PARA LAS VISTAS
router.get('/reparticiones',checkAuth, traerReparticionesBOController);
//VER UNO
router.post('/reparticiones/reparticion',checkAuth, traerReparticionPorIdController);
router.post('/jerarquia/reparticion',checkAuth, traerJerarquiaPorIdController);
//CREAR
router.post('/reparticiones/reparticion/crear',checkAuth, existeRepa, crearReparticionController);
router.post('/jerarquia/reparticion/crear',checkAuth, crearJerarquiaController);
//BORRAR
router.post('/reparticiones/reparticion/borrar',checkAuth, borrarReparticionPorIdController);
router.post('/jerarquia/reparticion/borrar',checkAuth, borrarJerarquiaPorIdController);


module.exports = router;