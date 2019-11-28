const fs = require('fs');
const CFG = require("./config.js");

const mysql = require('mysql')
const DBClient = mysql.createPool({
  connectionLimit : 10,
  host: CFG.DB.HOST,
  user: CFG.DB.USER,
  password: CFG.DB.PWD,
  database: CFG.DB.DBNAME,
  dateStrings: true
});


const Http = CFG.HTTPS ? require('https') : require('http') ;
var options = {};
if (CFG.HTTPS) {
  options = {
          key  : fs.readFileSync(CFG.HTTPS.private_key),
          ca   : fs.readFileSync(CFG.HTTPS.ca),
          cert : fs.readFileSync(CFG.HTTPS.cert)
  };
}


const server = Http.createServer(options, (request, response) => {
    request.body = "";
        // we can access HTTP headers
    request.on('data', chunk => {
        request.body += chunk;
    })
    request.on('end', () => {
      var params = request.url.split("?");
      let path = params[0];
      let query_params = {};
      if (params[1] ){
          let qparams = params[1].split("&");
          qparams.forEach( (qp,i) => {
              let qparam = qp.split("=");
              if (qparam.length == 2) {
                  query_params[ decodeURIComponent( qparam[0] ) ] = decodeURIComponent( qparam[1] );
              }
          });
      }
  
      console.log("PAth : " + path);
      console.log("QueryParams : " + JSON.stringify(query_params));
      DBClient.query( 
        `INSERT INTO web_mock (verb, url_path, url_full_path, query_params, headers, body) 
        VALUES ( ?, ?, ?, ?, ?, ?) 
      `,[
        request.method,
        path,
        request.url,
        JSON.stringify(query_params),
        JSON.stringify(request.headers),
        request.body
      ],  function ( err, rows ){
        if ( err ){
            console.error("DB connection error : " + JSON.stringify(err) );
        }
      });
      response.end('OK');
    })
  })
server.listen(CFG.PORT, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${CFG.PORT}`)
})



