const { checkRama, checkPatologias, checkCausales, checkRelacionesTipos, 
    checkClases, checkTemas, checkBoletin} = require('../../models/SDIN/checksModel')

async function checkRamaController(req, res, next) { 
    let request = {};
    request.rama = req.body.rama;

    await checkRama(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: La rama no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkPatologiasController(req, res, next) { 
    let request = {};
    request.nombre = req.body.nombre;

    await checkPatologias(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: Esta patología no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkCausalesController(req, res, next) { 
    let request = {};
    request.nombre = req.body.nombre;

    await checkCausales(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: Este causal no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkRelacionesTiposController(req, res, next) { 
    let request = {};
    request.relacion = req.body.relacion;

    await checkRelacionesTipos(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: Esta accion no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkClasesController(req, res, next) { 
    let request = {};
    request.clase = req.body.clase;

    await checkClases(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: Esta accion no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkTemasController(req, res, next) { 
    let request = {};
    request.tema = req.body.tema;

    await checkTemas(request)
    .then(results => {
            if (results.length == 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: Esta accion no puede crearse porque ya existe.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkBoletinController(req, res, next) { 
    let request = {};
    request.idNormaSDIN = req.body.idNormaSDIN;

    await checkBoletin(request)
    .then(data => {
            if (data.length > 0) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ mensaje: `PIN: La norma no se puede publicar porque no esta publicada en BO.` }))
                res.end()
            }
        })
        .catch(err => { throw new Error(err) })
}

module.exports = { checkRamaController, checkPatologiasController, checkCausalesController,
    checkRelacionesTiposController, checkClasesController, checkTemasController, checkBoletinController }