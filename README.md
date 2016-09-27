# NodeTest
=============

This is a repo to test nodejs and Electron

##TO BE DONE
============

The purpose is to interface the bioreactor v4 woth a nodejs/electron interface that is both modular (adaptable to other devices) and user friendly.

- Manage the auto queue completion (non interactive logging) --> only for the devices that allow for it (eg. bioreactor)
- Manage the log to pouchdb locally and then to an external couchDB database
- Manage user queue completion (interactive logging) --> ok with the dedicated wrapper for the open spectro
- Add support for event logging to log errors in the DB as well 


To run electron use the command: ./node_modules/.bin/electron src/index.js

