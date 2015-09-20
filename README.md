# MySensors InfluxDB bridge

A tiny node.js script to read from a serial [MySensors](http://mysensors.org) gateway, and send the received data on to InfluxDB 0.9+.  **THIS IS A HACK - Don't expect pretty code**

## Usage

Starting: `npm run start`

Be sure to define the following ENV vars:

- INFLUXDB_HOST
- INFLUXDB_PORT
- INFLUXDB_DATABASE
- SERIAL_PORT *the usb serial port device for your mysensors gateway.  Mine is `/dev/ttyASM0`.  Make sure you have the right permissions on it.*

I'm using [dokku](https://github.com/progrium/dokku) to run this on my local LAN, for home automation purposes.

## License

Released under the [MIT License](https://opensource.org/licenses/MIT)
