const {existeNormaSubtipoEnPINPorId, existeNormaSubtipoEnPINPorSigla} = require('../../models/BO/NormasSubtiposModel')

async function checkNormaSubtipoCrear(req, res, next) {
    //MODIFICO ESTA FUNCION PARA QUE SI VALIDA TRAIGA EL USUARIO. HACE DE PUENTE ENTRE CUIT Y USERPIN
    //Validar que sea un numero entero. Si es string u otro que rebote
    let siglaNormaTipo = String(req.body.sigla).trim();
    await existeNormaSubtipoEnPINPorSigla(siglaNormaTipo)
        .then(results => {
            if (results.length === 0) { 
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: 'PIN: El subtipo de norma ingresada ya existe en PIN.', error: 'Petición no permitida.' }))
                res.end(); 
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkExisteNormaSubtipo(req, res, next) {
    let idNormaSubtipo = parseInt(req.body.idNormaSubtipo);
    await existeNormaSubtipoEnPINPorId(idNormaSubtipo)
        .then(results => {
            if (results.length === 0) { 
                res.status(409)
                res.send(JSON.stringify({ mensaje: 'PIN: El subtipo de norma que desea borrar no existe o no esta activa en PIN.', error: 'Petición no permitida.' }))
                res.end(); 
            }
            else {
                //req.tipoData = results[0];
                next() // Existe, se borra
            }
        })
        .catch(err => { throw new Error(err) })
}

module.exports = { checkNormaSubtipoCrear, checkExisteNormaSubtipo };