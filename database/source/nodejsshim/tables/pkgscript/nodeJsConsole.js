/* This file is part of the Node.js shims extension package for xTuple ERP, and is
 * Copyright (c) 1999-2016 by OpenMFG LLC, d/b/a xTuple.
 * It is licensed to you under the xTuple End-User License Agreement
 * ("the EULA"), the full text of which is available at www.xtuple.com/EULA
 * While the EULA gives you access to source code and encourages your
 * involvement in the development process, this Package is not free software.
 * By using this software, you agree to be bound by the terms of the EULA.
 */

include('nodejsshim');

var _exampleList = mywindow.findChild("_exampleList");
var _consoleLog = mywindow.findChild("_consoleLog");
var _commandLine = mywindow.findChild("_commandLine");
var _commandButton = mywindow.findChild("_commandButton");

_exampleList.append(0, "Select and example...");
_exampleList.append(1, "HTTP GET Request");
_exampleList.append(2, "HTTP Request");
_exampleList.append(3, "HTTP Server");
_exampleList.append(4, "Promise");
_exampleList.append(5, "TCP Server");
_exampleList.append(6, "WebSocket Server");
_exampleList.append(7, "XT.dataSource.Query()");

/*
 * Map the _exampleList selection to an example.
 */
function handleExampleListChange (index) {
  var examples = [
    function listPlaceholder(){},
    exampleHttpGet,
    exampleHttpRequest,
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
      _consoleLog.plainText = _consoleLog.plainText + '\nSTATUS: ' + res.statusCode;
      _consoleLog.plainText = _consoleLog.plainText + '\nSTATUS MESSAGE: ' + res.statusMessage;
      _consoleLog.plainText = _consoleLog.plainText + '\nBODY: ' + chunk;
    });
    res.on('end', function () {
      _consoleLog.plainText = _consoleLog.plainText + '\nNo more data in response.';
      _consoleLog.plainText = _consoleLog.plainText + '\nExecution time: ' + ((new Date().getTime()) - startQueryTimer);
    })
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
      _consoleLog.plainText = _consoleLog.plainText + '\nSTATUS: ' + res.statusCode;
      _consoleLog.plainText = _consoleLog.plainText + '\nSTATUS MESSAGE: ' + res.statusMessage;
      _consoleLog.plainText = _consoleLog.plainText + '\nBODY: ' + chunk;
    });
    res.on('end', function () {
      _consoleLog.plainText = _consoleLog.plainText + '\nNo more data in response.';
      _consoleLog.plainText = _consoleLog.plainText + '\nExecution time: ' + ((new Date().getTime()) - startQueryTimer);
    })
  });

  req.end();
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
    _consoleLog.plainText = _consoleLog.plainText + '\n' + req.headers.host + ' - [' + (new Date().toISOString()) + '] "' + req.method + ' ' + req.url + '"';

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
    _consoleLog.plainText = _consoleLog.plainText + '\nFirst result: ' + firstResult;
    return doSomethingElse(firstResult);
  }).then(function (secondResult) {
    _consoleLog.plainText = _consoleLog.plainText + '\nSecond result: ' + secondResult;
    return secondResult;
  }).then(function (thirdResult) {
    _consoleLog.plainText = _consoleLog.plainText + '\nThird result passed message: ' + thirdResult;
    var message = "Did something that errors. message = " + thirdResult;
    throw new Error(message);
  })["catch"](function (err) {
    _consoleLog.plainText = _consoleLog.plainText + '\nQuery Error: ' + err.message;
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
    _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Server received new TCP Socket Client connection.';
    _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Server writing "Hello World!" to TCP Socket Client';
    clientSocket.end("Hello World!");
  });

  server.listen(options, function () {
    _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Server listening on ' + options.host + '::' + options.port;

    var client = new net.Socket();

    _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Client connecting to TCP Socket Server.';
    client.connect({
      host: options.host,
      port: options.port
    }, function connectListener() {
      _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Client connected.';
    });

    client.on('data', function(data) {
      _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Client received data: ' + data;
      // Kill client after server's response.
      client.destroy();
    });

    client.on('close', function() {
      _consoleLog.plainText = _consoleLog.plainText + '\nTCP Socket Client closed connection.';
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
    _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server socket received client connection. Sending message to client: ping';
    socket.send('ping', function handelSocketSendError(error) {
      if (error) {
        _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server socket.send callback error:' + JSON.stringify(error);
      }
    });

    socket.on('error', function (error) {
      _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server socket error: ' + JSON.stringify(error);
    });

    socket.on('message', function handleSocketMessage(message) {
      _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server socket received message: ' + message;
    });

    socket.on('close', function HandelSocketClose() {
      _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server Client closed WebSocket connection.';
    });
  });

  wsServer.on('error', function handleWSServerError (error) {
    _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server Error: ' + JSON.stringify(error);
  });

  wsServer.on('listening', function handleWSServerListening () {
    _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Server listening on ws://' + options.host + '::' + options.port;
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
      _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Client connected to server. Sending message to server: pong';
      wsClient.send('pong');
    });

    wsClient.on('message', function(data, flags) {
      _consoleLog.plainText = _consoleLog.plainText + '\nWebSocket Client received message: ' + data;
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
      _consoleLog.plainText = _consoleLog.plainText + '\nQuery Error: ' + queryError.message;
    } else {
      _consoleLog.plainText = _consoleLog.plainText + '\nQuery Result: ' + JSON.stringify(result);
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
