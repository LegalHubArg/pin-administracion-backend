const httpError = (res, err, mensaje) => {
    console.log(err)
    res.status(500)
    res.send(JSON.stringify({ mensaje: mensaje, error: error }))
    res.end();
}

module.exports = { httpError }