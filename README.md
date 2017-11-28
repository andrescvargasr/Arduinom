# Arduinom
Node.js websocket server to communicate with our arduino devices

## Requirements

To correct execution of project, we recommend install these programs and these versions:

\* [NVM](https://github.com/creationix/nvm) (v0.33.6).
\* Node.js (v8.9.1 LTS).
\* [Serialport](https://github.com/node-serialport/node-serialport) (v6.0.4).
\* MongoDB (v2.2.30)

## Installation

### Windows
```bash
npm install --global --production windows-build-tools
```
Then follow unix installation procedure


### Linux
```bash
git clone https://github.com/Bioreactor/Arduinom.git
```
Go to folder, install project and run server:

```bash
cd Arduinom/
npm install
npm run server
```

## Usage

This library will scan for arduino devices and help to bridge web application
to them.
In order to debug you may use
```
DEBUG=* node/deviceFactor.js
```

## Notes

### Spanish

To see a complete installation guide, please visit: [Documentation in Spanish](../master/Documentation/ES).

## English

Documentation in english is under construction. Please, use: [Documentation in Spanish](../master/Documentation/ES) instead.

##Issues

Refer to section 5. of the [5. Issues](../master/Documentation/ES/ARDUINOM-PREVIOUS-REQUERIMENTS-ES.pdf).
