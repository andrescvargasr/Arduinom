# Arduinom
Este proyecto emplea un servidor websocket en Node.js para comunicar nuestro PC con dispositivos Arduino compatibles.

## Requisitos

Para la correcta ejecución del proyecto se han empleado los siguientes programas con sus respectivas versiones:

\* [NVM](https://github.com/creationix/nvm) (v0.33.6).
\* Node.js (v8.9.1 LTS).
\* [Serialport](https://github.com/node-serialport/node-serialport) (v6.0.4).
\* MongoDB (2.2.30)

## Instalación



### Windows
```bash
npm install --global --production windows-build-tools
```
Then follow unix installation procedure


### Unix
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
