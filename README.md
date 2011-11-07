Tadagraph - real-time micro-blogging for your team with markup syntax
=====================================================================

Tadagraph is the core of [Team.FM](https://team.fm) collaboration platform. We build Team.FM based on tadagraph.

Requirements
------------

* [CouchDB](http://couchdb.apache.org) 1.1.0+
* [CouchApp](http://www.couchapp.org/page/installing)

Install
-------

1. Clone this repository
2. Create a database where you want to push tadagraph core couchapp:

    `$ curl -XPUT http://localhost:5984/yourdb`

Or go to couchdb utilities page (by default [http://localhost:5984/_utils](http://localhost:5984/_utils)) and create a database.

3. Go to core couchapp

    `$ cd tadagraph/core`

4. Push core app to your database

    `$ couchapp push http://localhost:5984/yourdb`

5. Visit tadagraph core

    `http://localhost:5984/yourdb/_design/core/index.html`


Demo
----
You can check out Tadagraph application here: [http://opensource.team.fm](http://opensource.team.fm).

Other resources
---------------
* [CouchDB](http://couchdb.apache.org)
* [CouchApp](http://www.couchapp.org)
* [Evently](http://couchapp.org/page/evently)
