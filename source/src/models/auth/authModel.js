var connection = require("../../services/conexion-mariadb");

function buscarUsuarioPorCuit(request) {
  return new Promise((resolve, reject) => {
    
    sql = "SELECT * FROM gral_usuarios WHERE usuario=?;";
    params = [request.usuario];

    
    connection.pool.getConnection(function (err, conn) {
      if (err) throw err; // not connected!

      // Use the connection
      conn.query(sql, params, function (error, results, fields) {
        conn.release();
        if (err) {
          reject(err);
        }
        resolve(results);
        
        // Handle error after the release.
        if (error) throw error;
      });
    });
  });
}

module.exports = {
    buscarUsuarioPorCuit
};