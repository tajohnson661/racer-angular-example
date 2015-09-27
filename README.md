# racer-angular-example

This project is a sample application that integrates [Racer](https://github.com/derbyjs/racer) with
[AngularJS](http://angularjs.org/).

The goal of the application is to show how multiple racer controlled
text areas (via ng-repeat) on multiple pages (or "rooms" in this application) can synchronize to a MongoDb data store and
to other clients accessing the same data.  Racer seems to be the best solution out there for true collaborative editing,
so getting it to work nicely with angularjs would be ideal.  I'm surprised by how little information about this
combination is available.

I've tried to keep everything about as simple as possible in terms of angular features to try to isolate the
integration between Racer and AngularJS.  Everything is kind of crammed into a controller for the page.  I suppose
I should move the racer stuff to the service that's currently in stub form.  Also, creating a directive for the
textarea would seem to make sense.

## Dependencies
The application uses Racer without Derby.  It's a node.js application and uses [Express](http://expressjs.com/) as the web
application framework.  It also uses the following:

* MongoDB
* Redis
* Browserchannel
* Browserify (as part of Racer for getting racer down to the client)

Naturally, the package.json file will install the appropriate dependencies, but you'll also need access to a MongoDB
database server and a Redis server.

## Getting started

 1. Clone the application
 2. npm install
 3. bower install
 4. Point to the correct MongoDb database
 5. Set up redis locally and run the server.

## Run the Application

You can use gulp to run the application by running the default task, or you can use node directly

```
node server.js
```

The default port is 3000, so the application should be available at  `http://localhost:3000`

## Testing

This is just a sample application so there are no automatic tests for this.  Sorry about that.

## Known problems

The application seems to work ok, but if I switch rooms a few times (6 seems to be the exact number) things
get wonky and no longer work.  More research is needed to figure out what's going on.  If you can figure it out,
I'd much appreciate it.
