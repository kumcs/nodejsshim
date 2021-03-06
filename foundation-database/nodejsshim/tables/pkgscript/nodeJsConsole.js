/* This file is part of the Node.js shims extension package for xTuple ERP, and is
 * Copyright (c) 1999-2018 by OpenMFG LLC, d/b/a xTuple.
 * It is licensed to you under the Common Public Attribution License
 * version 1.0, the full text of which (including xTuple-specific Exhibits)
 * is available at www.xtuple.com/CPAL.  By using this software, you agree
 * to be bound by its terms.
 */

include('nodejsshim');

var _exampleList = mywindow.findChild("_exampleList");
var _consoleLog = mywindow.findChild("_consoleLog");
var _commandLine = mywindow.findChild("_commandLine");
var _commandButton = mywindow.findChild("_commandButton");

_exampleList.append(0, "Select and example...");
_exampleList.append(1, "HTTP GET Request");
_exampleList.append(2, "HTTP Request");
_exampleList.append(3, "Loop of HTTP Requests");
_exampleList.append(4, "HTTP Server");
_exampleList.append(5, "Promise");
_exampleList.append(6, "TCP Server");
_exampleList.append(7, "WebSocket Server");
_exampleList.append(8, "XT.dataSource.Query()");

/*
 * Map the _exampleList selection to an example.
 */
function handleExampleListChange (index) {
  var examples = [
    function listPlaceholder(){},
    exampleHttpGet,
    exampleHttpRequest,
    exampleLoopHttpRequest,
    exampleHttpServer,
    examplePromise,
    exampleTcpServer,
    exampleWebSocketServer,
    exampleXTdataSourceQuery
  ];

  if (index > 0) {
    _exampleList.setEnabled(false);
    examples[index]();
  }
}

/*
 * Test http.get() Request.
 */
function exampleHttpGet () {
  var http = require('http');

  var options = {
    hostname: 'www.google.com',
    path: '/'
  };

  startQueryTimer = new Date().getTime();
  var req = http.get(options, function (res) {
    res.on('data', function (chunk) {
      _consoleLog.append(qsTr('STATUS: %1').arg(res.statusCode));
      _consoleLog.append(qsTr('STATUS MESSAGE: %1').arg(res.statusMessage));
      _consoleLog.append(qsTr('BODY: %1').arg(chunk));
    });
    res.on('end', function () {
      _consoleLog.append(qsTr('No more data in response.'));
      _consoleLog.append(qsTr('Execution time: %1').arg((new Date().getTime()) - startQueryTimer));
    });
  });
}

/*
 * Test http.request().
 */
function exampleHttpRequest () {
  var http = require('http');

  var options = {
    hostname: 'www.google.com',
    path: '/'
  };

  startQueryTimer = new Date().getTime();
  var req = http.request(options, function (res) {
    res.on('data', function (chunk) {
      _consoleLog.append(qsTr('STATUS: %1').arg(res.statusCode));
      _consoleLog.append(qsTr('STATUS MESSAGE: %1').arg(res.statusMessage));
      _consoleLog.append(qsTr('BODY: %1').arg(chunk));
    });
    res.on('end', function () {
      _consoleLog.append(qsTr('No more data in response.'));
      _consoleLog.append(qsTr('Execution time: %1').arg((new Date().getTime()) - startQueryTimer));
    });
  });

  req.end();
}

/*
 * Test loop of http.request().
 */
function exampleLoopHttpRequest () {
  var http = require('http');
  var https = require('https');
  var Promise = Promise || require('bluebird');

  function timeoutHandler (timeout, req) {
    return function() {
      req._isAborted = true;
      req.abort();
      console.log('Request aborted due to timeout being reached (' + timeout + 'ms)');
    };
  }

  function restApiRequest (
    apiServer,
    req
  ) {
    req.params = req.params || [];
    req.headers = req.headers || {};

    return new Promise(function (resolve, reject) {
      var requestOptions = {
        hostname: apiServer.hostname,
        path: apiServer.path + req.path + req.params.join('/'),
        port: apiServer.port,
        method: req.method,
        headers: req.headers,
      };

      var postBody = '';
      if (req.method === 'POST') {
        postBody = JSON.stringify(req.body);
        requestOptions.headers['content-type'] = 'application/json';
        requestOptions.headers['Content-Length'] = Buffer.byteLength(postBody,'utf8');
      }

      var server = (apiServer.protocol || 'https') === 'https' ? https : http;

      var request = server.request(requestOptions);
      request.setTimeout(120000, timeoutHandler(120000, request));
      request.on('response', function (res) {
        var data = '';

        res.on('data', function (chunk) {
          data = data + chunk;
        });
        res.on('end', function () {
          var isJSON = res.headers['content-type']
            ? res.headers['content-type'].indexOf('application/json') > -1 : false;

          try {
            res.body = isJSON ? JSON.parse(data) : data;
          } catch (err) {
            console.log('restApiRequest res.body error: ', data);
            throw err;
          }

          resolve(res);
        });
        res.on('error', function (err) {
          reject(err);
        });
      });
      request.on('error', function (err) {
        console.log('request error: ' + err);
      });

      if (req.method === 'POST') {
        request.write(postBody);
      }
      request.end();
    })
    .caught(function (err) {
      throw err;
    });
  }

  var processedCount = 0;
  var promiseQuque = [];
  var data = {foo: "bar"};
  var requestData = JSON.stringify({});
  var testApiServer = {
    hostname: 'www.example.com',
    path: '/',
    port: 443,
    protocol: 'https'
  };
  var testHeaders = {};
  var testReq = {
    headers: {},
    method: 'GET',
    path: ''
  };

  for (var i = 0; i < 1200; i++) {
    promiseQuque.push(function () {
      return restApiRequest(testApiServer, testReq)
        .then(function (response) {
          processedCount++;
          console.log('processedCount: ' + processedCount);
          _consoleLog.append(qsTr('STATUS MESSAGE: %1').arg(response.statusMessage));
          return;
        })
        .caught(function (err) {
          console.log('err: ' + err);
          throw err;
        });
    });
  }

  promiseQuque.push(function () {
    return Promise.resolve()
      .then(function () {
        console.log('done!');
      });
  });

  // Call the `promiseQuque` functions in the correct order synchronously.
  var p = Promise.resolve();

  /*
  // Async request loop. Send all at once.
  p.then(function () {
    var promises = [];

    promiseQuque.forEach(function (currentPromise) {
      promises.push(currentPromise());
    });

    return Promise.all(promises);
  })
  .caught(function (error) {
    throw error;
  });
  */

  // Sync request loop. Send one after another.
  promiseQuque.forEach(function (currentPromise) {
    // Call the current Promise, `p`, and then set `p` to the next Promise
    // to be called on the next loop.
    p = p.then(currentPromise)
      .caught(function (error) {
        throw error;
      });
  });
}

/*
 * Test http.createServer().
 */
function exampleHttpServer () {
  var http = require('http');

  var options = {
    port: 1234,
    host: '127.0.0.1'
  };
  var server = http.createServer(function (req, res) {
    _consoleLog.append(qsTr('%1 - [%2] %3 %4').arg(req.headers.host)
                                              .arg(new Date().toISOString())
                                              .arg(req.method)
                                              .arg(req.url));

    if (req.url === '/') {
      var html = '<html><head><title>xTuple exampleHttpServer</title></head><body><h1>It Works!</h1></body></html>';
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(html);
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok');
    }
  });

  server.on('error', function (err) {
    if (err) {
      console.log("Error: " + err.message);
    }
  });

  server.listen(options, function () {
    console.log('http.Server listening on ' + options.host + '::' + options.port);
    setTimeout(function () {
      toolbox.openUrl('http://' + options.host + ':' + options.port + '/');
    }, 50);
  });
}

/*
 * Test Promise.
 */
function examplePromise () {
  function doSomething() {
    return new Promise(function (resolve) {
      var value = 42;

      // Simulate async call.
      setTimeout(function() {
        resolve(value);
      }, 100);
    });
  }

  function doSomethingElse(value) {
    return new Promise(function (resolve) {
      // Simulate async call.
      setTimeout(function() {
        resolve("did something else with " + value);
      }, 100);
    });
  }

  // Note: QtScriptEngine JavaScript parsing throws a parse error on the
  // chained use of the keywork `catch` for some reason. e.g.
  //   `myPromise.then(...).catch(...);`
  // So we use the object key index pattern for `catch`. e.g.
  //   `myPromise.then(...)["catch"](...);`
  // You can also use `caught` when using the Bluebird library for Promise. e.g.
  //   `myPromise.then(...).caught(...);`
  doSomething().then(function (firstResult) {
    _consoleLog.append(qsTr('First result: %1').arg(firstResult));
    return doSomethingElse(firstResult);
  }).then(function (secondResult) {
    _consoleLog.append(qsTr('nSecond result: %1').arg(secondResult));
    return secondResult;
  }).then(function (thirdResult) {
    _consoleLog.append(qsTr('Third result passed message: %1').arg(thirdResult));
    var message = "Did something that errors. message = " + thirdResult;
    throw new Error(message);
  })["catch"](function (err) {
    _consoleLog.append(qsTr('Query Error: %1').arg(err.message));
  });
}

/*
 * Test net.createServer().
 */
function exampleTcpServer () {
  var net = require('net');

  var options = {
    port: 1234,
    host: '127.0.0.1'
  };
  var server = net.createServer(function (clientSocket) {
    _consoleLog.append(qsTr('TCP Socket Server received new TCP Socket Client connection.'));
    _consoleLog.append(qsTr('TCP Socket Server writing "Hello World!" to TCP Socket Client.'));
    clientSocket.end("Hello World!");
  });

  server.listen(options, function () {
    _consoleLog.append(qsTr('TCP Socket Server listening on %1::%2').arg(options.host)
                                                                    .arg(options.port));

    var client = new net.Socket();

    _consoleLog.append(qsTr('TCP Socket Client connecting to TCP Socket Server.'));
    client.connect({
      host: options.host,
      port: options.port
    }, function connectListener() {
      _consoleLog.append(qsTr('TCP Socket Client connected.'));
    });

    client.on('data', function(data) {
      _consoleLog.append(qsTr('TCP Socket Client received data: %1').arg(data));
      // Kill client after server's response.
      client.destroy();
    });

    client.on('close', function() {
      _consoleLog.append(qsTr('TCP Socket Client closed connection.'));
    });
  });
}

/*
 * Test WebSocketServer().
 */
function exampleWebSocketServer(){
  var WebSocketServer = require("ws").Server;

  var options = {
    host: '127.0.0.1',
    port: 1234
  };
  var wsServer = new WebSocketServer(options);

  wsServer.on('connection', function handleWSClientConnection (socket) {
    _consoleLog.append(qsTr('WebSocket Server socket received client connection. Sending message to client: ping'));
    socket.send('ping', function handelSocketSendError(error) {
      if (error) {
        _consoleLog.append(qsTr('WebSocket Server socket.send callback error: %1').arg(JSON.stringify(error)));
      }
    });

    socket.on('error', function (error) {
      _consoleLog.append(qsTr('WebSocket Server socket error: %1').arg(JSON.stringify(error)));
    });

    socket.on('message', function handleSocketMessage(message) {
      _consoleLog.append(qsTr('WebSocket Server socket received message: %1').arg(message));
    });

    socket.on('close', function HandelSocketClose() {
      _consoleLog.append(qsTr('WebSocket Server Client closed WebSocket connection.'));
    });
  });

  wsServer.on('error', function handleWSServerError (error) {
    _consoleLog.append(qsTr('WebSocket Server Error: %1').arg(JSON.stringify(error)));
  });

  wsServer.on('listening', function handleWSServerListening () {
    _consoleLog.append(qsTr('WebSocket Server listening on ws://%1::%2').arg(options.host)
                                                                        .arg(options.port));
    _commandLine.setEnabled(true);
    _commandButton.setEnabled(true);

    /*
     * Test WebSocket Client
     */
    var WebSocketClient = require("ws");
    var wsClient = new WebSocketClient('ws://127.0.0.1:1234');

    function wsClientSendMessage() {
      wsClient.send(_commandLine.text);
      _commandLine.text = '';
    }
    _commandButton.clicked.connect(wsClientSendMessage);

    wsClient.on('open', function open() {
      _consoleLog.append(qsTr('WebSocket Client connected to server. Sending message to server: pong'));
      wsClient.send('pong');
    });

    wsClient.on('message', function(data, flags) {
      _consoleLog.append(qsTr('WebSocket Client received message: %1').arg(data));
    });
  });
}

/*
 * Test XT.dataSource.query().
 */
function exampleXTdataSourceQuery () {
  var sql = "SELECT cust_id FROM custinfo WHERE cust_number = $1;";
  var options = {
    parameters: ["TTOYS"]
  };

  function callback (queryError, result) {
    if (queryError) {
      _consoleLog.append(qsTr('Query Error: %1').arg(queryError.message));
    } else {
      _consoleLog.append(qsTr('Query Result: %1').arg(JSON.stringify(result)));
    }
  }

  XT.dataSource.query(sql, options, function (queryError, result) {
    if (callback) {
      if (!queryError) {
        callback(null, result);
      } else {
        callback(queryError, result);
      }
    }
  });
}

_exampleList["currentIndexChanged(int)"].connect(handleExampleListChange);
