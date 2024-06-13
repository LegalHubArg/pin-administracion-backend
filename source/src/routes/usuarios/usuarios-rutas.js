const express = require('express');
const router = express.Router();

//Middlewares
const { checkAuth, checkUsuarioAD } = require('../../middleware/auth/authMW');
const { checkJerarquiaPIN, checkPermisoJerarquiaPIN, checkPermisoJerarquiaPINAlta} = require('../../middleware/organismos/checkOrganismos')
const { checkReparticionesAlta, checkJSONValidoPermisosReparticion, checkJSONValidoPermisos, checkUsuarioPIN, checkUsuarioPINAltaDeUsuario, checkExistePerfilDeUsuario, checkExistePerfilDeUsuarioAlta, checkExistenPermisosAlta, checkExistenPermisos } = require('../../middleware/usuarios/checkUsuarioPIN');
const { checkUsuarioSADE } = require('../../middleware/usuarios/checkUsuarioSADE');
//Controllers
const { traerPermisosBOCargaPorIdController, nuevoUsuarioController, 
    eliminarUsuarioController, traerUsuariosController, 
    traerUsuarioController, editarUsuarioController,
getPerfilUsuarioController, getPerfilVistasController, 
traerPerfilesController, asignarPerfilUsuarioController, eliminarPerfilUsuarioController,
asignarPermisosUsuarioController, borrarPermisosUsuarioController,
traerPermisosBOCargaPorIdOrgJerarquiaController,
asignarPermisosReparticionController, borrarPermisosReparticionController,
traerReparticionesUsuarioController,
crearReparticionesUsuarioController, borrarReparticionesUsuarioController,
traerTodosLosPermisosBOCargaPorIdController,  
traerUsuariosSDINController,
editarUsuarioSDINController, borrarUsuarioSDINController, crearUsuarioSDINController,
traerUsuarioSDINController, asignarPerfilUsuarioSDINController, borrarPerfilUsuarioSDINController, reactivarUsuarioSDINController } = require('../../controllers/usuarios/usuarios');
//////////////////// PERMISOS BO \\\\\\\\\\\\\\\\\\\\\
//Rutas ABM Permisos Carga
router.post('/permisos', checkAuth, checkUsuarioPIN, traerTodosLosPermisosBOCargaPorIdController); //Trae todos los permisos de carga
router.post('/permisos/usuario', checkAuth, checkUsuarioPIN, traerPermisosBOCargaPorIdController);
router.post('/permisos/crear', checkAuth, checkUsuarioPIN, checkExistenPermisosAlta, checkJSONValidoPermisos,  asignarPermisosUsuarioController);
router.post('/permisos/borrar', checkAuth, checkUsuarioPIN, checkExistenPermisos, borrarPermisosUsuarioController);
router.post('/permisos/reparticion', checkAuth, checkJerarquiaPIN, checkPermisoJerarquiaPIN, traerPermisosBOCargaPorIdOrgJerarquiaController);
router.post('/permisos/reparticion/crear', checkAuth, checkJerarquiaPIN, /* checkPermisoJerarquiaPINAlta,  */checkJSONValidoPermisosReparticion, asignarPermisosReparticionController);
router.post('/permisos/reparticion/borrar', checkAuth, checkJerarquiaPIN, checkPermisoJerarquiaPIN,  borrarPermisosReparticionController);
//////////////////// REPARTICIONES QUE OPERA \\\\\\\\\\\\\\\\\\\\\
//Rutas ABM REPARTICIONES
router.post('/usuario/reparticiones', checkAuth, checkUsuarioPIN, traerReparticionesUsuarioController);
router.post('/usuario/reparticiones/crear', checkAuth, checkUsuarioPIN, /* checkReparticionesAlta, */ crearReparticionesUsuarioController);
router.post('/usuario/reparticiones/borrar', checkAuth, checkUsuarioPIN, borrarReparticionesUsuarioController);


//////////////////// SADE \\\\\\\\\\\\\\\\\\\\\
router.post('/sade', checkUsuarioSADE, function (req, res, next) {
    console.log(req.metadatosSADE)
    res.status(200);
    res.send(JSON.stringify( { mensaje: 'DATOS SADE', data: req.metadatosSADE}))
  });
//////////////////// USUARIOS ABM \\\\\\\\\\\\\\\\\\\\\
router.post('/usuario/crear', checkAuth, checkUsuarioPINAltaDeUsuario, nuevoUsuarioController);
router.post('/usuarios', checkUsuarioPIN, traerUsuariosController); //Ver todos los usuarios activos
router.post('/usuario', checkUsuarioPIN, traerUsuarioController); //Ver datos de Usuario
router.post('/usuario/borrar', checkUsuarioPIN, eliminarUsuarioController);
router.post('/usuario/editar', checkUsuarioPIN, editarUsuarioController);
router.post('/usuario/vistas', checkUsuarioPIN, getPerfilVistasController);

//////////////////// PERFILES \\\\\\\\\\\\\\\\\\\\\
router.get('/perfiles', /* checkUsuarioPIN,   */traerPerfilesController); //Ver todos los perfiles
router.post('/usuario/perfil', checkUsuarioPIN, getPerfilUsuarioController); //trae el perfil del usuario
router.post('/usuario/perfil/asignar', checkUsuarioPIN, checkExistePerfilDeUsuarioAlta, asignarPerfilUsuarioController); //Ver todos los perfiles
router.post('/usuario/perfil/borrar', checkUsuarioPIN, checkExistePerfilDeUsuario, eliminarPerfilUsuarioController); //Ver todos los perfiles

// SDIN
router.post('/sdin',  checkAuth, checkUsuarioPIN, traerUsuariosSDINController);
router.post('/usuario-sdin', checkAuth, checkUsuarioPIN, traerUsuarioSDINController);
router.post('/usuario-sdin/asignar-perfil', checkAuth, checkUsuarioPIN, asignarPerfilUsuarioSDINController);
router.post('/usuario-sdin/borrar-perfil', checkAuth, checkUsuarioPIN, borrarPerfilUsuarioSDINController);
router.post('/sdin/crear',  checkAuth, checkUsuarioPIN, crearUsuarioSDINController);
router.post('/sdin/editar',  checkAuth, checkUsuarioPIN, editarUsuarioSDINController);
router.post('/sdin/borrar',  checkAuth, checkUsuarioPIN, borrarUsuarioSDINController);
router.post('/sdin/reactivar', checkUsuarioPIN, reactivarUsuarioSDINController);

module.exports = router;