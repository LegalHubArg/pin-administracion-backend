const {existeNormaTipoEnPINPorId, existeNormaTipoEnPINPorSigla} = require('../../models/BO/NormasTiposModel')

async function checkNormaTipoCrear(req, res, next) {
    //MODIFICO ESTA FUNCION PARA QUE SI VALIDA TRAIGA EL USUARIO. HACE DE PUENTE ENTRE CUIT Y USERPIN
    //Validar que sea un numero entero. Si es string u otro que rebote
    let siglaNormaTipo = String(req.body.sigla).trim();
    await existeNormaTipoEnPINPorSigla(siglaNormaTipo)
        .then(results => {
            if (results.length === 0) { 
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: 'PIN: El tipo de norma ingresada ya existe en PIN.', error: 'Petición no permitida.' }))
                res.end(); 
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkExisteNormaTipo(req, res, next) {
    let idNormaTipo = parseInt(req.body.idNormaTipo);
    await existeNormaTipoEnPINPorId(idNormaTipo)
        .then(results => {
            if (results.length === 0) { 
                res.status(409)
                res.send(JSON.stringify({ mensaje: 'PIN: El tipo de norma que desea borrar no existe o no esta activa en PIN.', error: 'Petición no permitida.' }))
                res.end(); 
            }
            else {
                //req.tipoData = results[0];
                next() // Existe, se borra
            }
        })
        .catch(err => { throw new Error(err) })
}

module.exports = { checkNormaTipoCrear, checkExisteNormaTipo };