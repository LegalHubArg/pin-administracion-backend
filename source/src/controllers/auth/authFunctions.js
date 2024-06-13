//----------------- operaciones
const authModel = require('../../models/auth/authModel')

async function getUsuario(request) {
    let response = {}
    await authModel.buscarUsuarioPorCuit(request)
            .then(results => {
                response = results
            })
            .catch(err => {
                throw new Error(err);

            })
        return response;
    }


module.exports = { getUsuario }