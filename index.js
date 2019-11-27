const Http = require('https');
const fs = require('fs');


const port = 3001;

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
const CFG = require("./config.js");
const mysql = require('mysql')
const DBClient = mysql.createPool({
  connectionLimit : 10,
  host: CFG.HOST,
  user: CFG.USER,
  password: CFG.PWD,
  database: CFG.DB,
  dateStrings: true
});

/*
CREATE TABLE web_mock (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
	verb varchar(200),
	url_path varchar(2000),
	url_full_path varchar(2000),
	query_params text,
	headers text,
	body text,
  date_insert timestamp NOT NULL DEFAULT current_timestamp() ,
  PRIMARY KEY (id)
) ENGINE=MyISAM AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;
*/


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
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})



