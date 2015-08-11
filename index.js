var P = require('p-promise'),
    SerialPort = require('serialport'),
    Mouth = require('cowboymouth'),
    Sensors = require('sensors');

var getGatewaySerialPort = function() {
  // if (process.env.SERIAL_PORT) {
  //   console.log('Using serial port set in environment variable SERIAL_PORT');
  //   return P(process.env.SERIAL_PORT);
  // }
  // else {
    var deferred = P.defer();
    console.log('Searching for usb serial port');
    SerialPort.list(function (err, ports) {
      // console.log(ports);
      if (err) {
        deferred.reject(err);
      }
      else {
        for (var i = 0, il = ports.length; i < il; ++i) {
          var portname = ports[i].comName;
          if (portname.indexOf('usb') !== -1) {
            console.log('Found usb serial port at', portname);
            deferred.resolve(portname);
          }
        }
        deferred.reject("No gateways found");
      }
    });
    return deferred.promise;
  // }
  // return Promise.reject();
};

var repeatedlyGetGatewaySerialPort = function() {
  var deferred = P.defer();

  var tryGet = function tryGet() {
    getGatewaySerialPort().then(function(portname) {
      deferred.resolve(portname);
    }).fail(function() {
      // retry in a bit
      setTimeout(tryGet, 10000);
    });
  }
  tryGet();
  return deferred.promise;
}

var openSerialPort = function(portname, baudrate) {
  var deferred = P.defer();

  var serialPort = new SerialPort.SerialPort(portname, {
    parser: SerialPort.parsers.readline("\n"),
    baudrate: baudrate
  }, false);

  serialPort.open(function(err) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(serialPort);
    }
  });

  return deferred.promise;
}
// var serial = new SerialPort.SerialPort(settings.portname, {
//     parser: SerialPort.parsers.readline("\n"),
//     baudrate: 115200
// }, false);

// var mouth = new Mouth(stream);

repeatedlyGetGatewaySerialPort()
  .then(function(portname) {
    console.log('found controller at', portname);
    return openSerialPort(portname, 115200);
  })
  .then(function(serialPort) {
    var mouth = new Mouth(serialPort);

    // serialPort.on('data', function(data) {
    //   console.log('raw serial data: ', data, Sensors.parse(data));
    // });
    // var mouthEvents = ['addon', 'log', 'name', 'version', 'battery', 'protocol', 'reading'];
    //
    // for (var i=0; i<mouthEvents.length; i++) {
    //   var eventName = mouthEvents[i];
    //   mouth.on(eventName, function(data) {
    //     var formattedData = { type: data.type, value: data.value, time: data.time };
    //     console.log(eventName, data, formattedData);
    //   });
    // }
    //
    var events = ['battery', 'name', 'version'];
    events.forEach(function (event) {

        mouth.on(event, function (data) {
            console.log("got event", event, data);
            // jenny.updateBoard(data.boardId, data, internals.handleError);
        });
    });

    mouth.on('reading', function (data) {
        var formattedData = { type: data.type, value: data.value, time: data.time };
        // jenny.createReading(data.boardId, data.addonId, formattedData, internals.handleError);
        console.log('reading', data.boardId, data.addonId, formattedData);
    });

    mouth.on('addon', function (data) {
      console.log('addon', data);
        // jenny.updateAddon(data.boardId, data.addonId, { type: data.type }, internals.handleError);
    });

    mouth.on('log', function (message) {
      console.log('log', message);
        // jenny.log(message, internals.handleError);
    });
    mouth.on('register', function (message) {
      console.log('ID request');
      mouth.writeId(101);
    });

    mouth.on('error', function(err) {
      console.error(err);
    });

    console.log('watching events');
  })
  .fail(function(err) {
    console.error(err);
  });
