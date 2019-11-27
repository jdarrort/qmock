const Http = require('http');
const port = 3001;

const { Client } = require('pg')
const DBClient = new Client({
    user: 'world',
    host: 'localhost',
    database: 'dvdrental',
    password: 'world123'
  });
DBClient.connect();
/*
CREATE TABLE web_mock (
	id serial NOT NULL,
	method varchar(200),
	url_path varchar(2000),
	url_full_path varchar(2000),
	query_params text,
	headers text,
	body text,
	date_insert timestamp NOT NULL DEFAULT now(),
	CONSTRAINT web_mock_pkey PRIMARY KEY (id)
);
*/

const requestHandler = (request, response) => {
 
}

const server = Http.createServer((request, response) => {
    request.body = "";
        // we can access HTTP headers
    request.on('data', chunk => {
        request.body += chunk;
    })
    request.on('end', () => {
      //end of data
      console.log(request.url)

      console.log("Method : " + request.method);
      console.log("FullUrl : " + request.url);
      //  console.log("Url : " + request.url);
  
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
      
      DBClient.query("INSERT INTO web_mock (method, url_path, url_full_path, query_params, headers, body) VALUES ($1,$2,$3, $4, $5, $6)", [
          request.method,
          path,
          request.url,
          JSON.stringify(query_params),
          JSON.stringify(request.headers),
          request.body,
      ], (err, res) => {
          if (err) console.log(err);
          else console.log("Entry inserted");
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



