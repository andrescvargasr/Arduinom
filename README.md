# NodeTest
=============

This is a repo to test nodejs and Electron

##TO BE DONE
============

The purpose is to interface the openspectro and the bioreactor v4 with a nodejs/electron interface that is both modular (adaptable to other devices) and user friendly.

- Manage the auto queue completion (non interactive logging) --> only for the devices that allow for it (eg. bioreactor)
- Manage the log to pouchdb locally and then to an external couchDB database and db map/reduce
- Manage user queue completion (interactive logging) --> ok with the dedicated wrapper for the open spectro
- Add support for event logging to log errors in the DB as well 

##To install the interface run:
npm install —global —production windows-build-tools (if running it on windows)
npm install 
npm start

