function paginarQuery(request, query) {
    if ((!(request.limite) && !(request.paginaActual)) || (!(request.limite) && !(request.offset))) return query;
    const limit = `LIMIT ${String(request.limite)}`;
    let offset = ``;

    if (request.paginaActual > 1) {
        offset = `OFFSET ${String((parseInt(request.paginaActual) * parseInt(request.limite)) - request.limite)}`;
    }

    if (!request.hasOwnProperty('paginaActual') && request.offset) {
        offset = `OFFSET ${request.offset}`
    }

    let queryPaginada = String(query) + ' ' + String(limit) + ' ' + String(offset);

    // console.log('paginaActual', request.paginaActual)
    return queryPaginada;
}
module.exports = {
    paginarQuery
}