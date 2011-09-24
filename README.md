tadagraph --  open-source micro-messaging w/ Markup
=============================================

Install
-------

1. Clone repository

2. Install [CouchDB](http://couchdb.apache.org/). Required version 1.1.0+

3. Install [couchapp](http://www.couchapp.org/page/installing).

4. Go to couchdb utilities page (by default [http://localhost:5984/_utils](http://localhost:5984/_utils)) and create a database where you want to push tadagraph core couchapp

Usage
-----

Go to core couchapp 

    $ cd tadagraph/core

Push core app to your database

    $ couchapp push http://localhost:5984/yourdb 

Visit tadagraph core

http://localhost:5984/yourdb/_design/core/index.html
