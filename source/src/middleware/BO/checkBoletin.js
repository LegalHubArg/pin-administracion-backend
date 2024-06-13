const { existeBoletinPorFecha, traerBoletinPorId } = require('../../models/BO/BoletinModel')

async function checkBoletinCrear(req, res, next) {
    let fechaPublicacion = req.body.fechaPublicacion;
    if (req.body.confirmaFecha === true) {
        next()
    }
    else {
        await existeBoletinPorFecha(fechaPublicacion)
            .then(results => {
                if (results.length === 0) {
                    next()
                }
                else {
                    res.status(409)
                    res.send(JSON.stringify({ mensaje: 'PIN: Ya existe un boletín con esa fecha de publicación.', existeBoletin: true, boletin: results[0] }))
                    res.end();
                }
            })
            .catch(err => { throw new Error(err) })
    }
}

async function checkBoletinEstado(req, res, next) { //Deja pasar si el estado del Boletin es BO_EN_REDACCION
    let request = {};
    request.idBoletin = req.body.idBoletin;

    await traerBoletinPorId(request)
        .then(results => {
            if (results.idBoletinEstadoTipo === 1) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: El Boletin ya no puede modificarse porque su estado es: ${results.boletinEstadoTipo}.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkBoletinDescargado(req, res, next) {
    let request = {};
    request.idBoletin = req.body.idBoletin;

    await traerBoletinPorId(request)
        .then(results => {
            if (results.idBoletinEstadoTipo === 2) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: El Boletin no se encuentra en estado BO_DESCARGADO` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkBoletinFirmado(req, res, next) {
    let request = {};
    request.idBoletin = req.body.idBoletin;

    await traerBoletinPorId(request)
        .then(results => {
            if (results.idBoletinEstadoTipo === 3) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: El Boletin no se encuentra en estado BO_FIRMADO` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

module.exports = { checkBoletinCrear, checkBoletinEstado, checkBoletinDescargado, checkBoletinFirmado }