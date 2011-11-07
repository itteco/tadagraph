tadagraph --  open-source micro-messaging w/ Markup
=============================================

Requirements
-------

1. [CouchDB](http://couchdb.apache.org/) 1.1.0+

2. [couchapp](http://www.couchapp.org/page/installing).


Install
-------

1. Clone this repository

2. Create a database where you want to push tadagraph core couchapp:

    $ curl -XPUT http://localhost:5984/yourdb

Or go to couchdb utilities page (by default [http://localhost:5984/_utils](http://localhost:5984/_utils)) and create a database.

3. Go to core couchapp 

    $ cd tadagraph/core

4. Push core app to your database

    $ couchapp push http://localhost:5984/yourdb 

5. Visit tadagraph core

    http://localhost:5984/yourdb/_design/core/index.html
