# Arduinom
Node.js websocket server to communicate with our arduino devices

## Installation

### Windows
```bash
npm install --global --production windows-build-tools
```
Then follow unix installation procedure


### Unix
```bash
git clone https://github.com/Bioreactor/Arduinom.git
npm install 
npm start
```

## Usage

This library will scan for arduino devices and help to bridge web application
to them.
In order to debug you may use
```
DEBUG=* node/deviceFactor.js
```