async function guardarLog(connection, sql, params, request) {
    let operacion = sql;
    let usuario = request?.idUsuario;
    if (usuario === null || usuario === undefined) { usuario = request.usuario };
    if (usuario === null || usuario === undefined) {
        usuario = request.idUsuarioCarga
    }
    else {
        usuario = null;
    };
    for (const p of params) {
        operacion = operacion.replace(/[?]/, String(p))
    }
    await connection.query(`INSERT INTO logs (operacion, idUsuario, ip) VALUES (?,?,?)`, [operacion, usuario, request.ip])
        .catch((e) => {
            throw e
        })
    return;
}

module.exports = { guardarLog }