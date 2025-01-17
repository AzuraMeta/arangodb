module.define("org/arangodb/tutorial", function(exports, module) {
/*jshint strict: false */

////////////////////////////////////////////////////////////////////////////////
/// @brief Shell tutorial
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Jan Steemann
/// @author Copyright 2012-2014, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                    module "org/arangodb/tutorial"
// -----------------------------------------------------------------------------

var index = 0;
var next = "Type 'tutorial' again to get to the next chapter.";

var lessons = [
  {
    title: "Welcome to the tutorial!",
    text:  "This is a user-interactive tutorial on ArangoDB and the ArangoDB shell.\n" +
           "It will give you a first look into ArangoDB and how it works."
  },
  {
    title: "JavaScript Shell",
    text:  "On this shell's prompt, you can issue arbitrary JavaScript commands.\n" +
           "So you are able to do things like...:\n\n" +
           "  number = 123;\n" +
           "  number = number * 10;"
  },
  {
    title: "Running Complex Instructions",
    text:  "You can also run more complex instructions, such as for loops:\n\n" +
           "  for (i = 0; i < 10; i++) { number = number + 1; }"
  },
  {
    title: "Printing Results",
    text:  "As you can see, the result of the last command executed is printed automatically. " +
           "To explicitly print a value at any other time, there is the print function:\n\n" +
           "  for (i = 0; i < 5; ++i) { print(\"I am a JavaScript shell\"); }"
  },
  {
    title: "Creating Collections",
    text:  "ArangoDB is a document database. This means that we store data as documents " +
           "(which are similar to JavaScript objects) in so-called 'collections'. " +
           "Let's create a collection named 'places' now:\n\n" +
           "  db._create('places');\n\n" +
           "Note: each collection is identified by a unique name. Trying to create a " +
           "collection that already exists will produce an error."
  },
  {
    title: "Displaying Collections",
    text:  "Now you can take a look at the collection(s) you just created:\n\n" +
           "  db._collections();\n\n" +
           "Please note that all collections will be returned, including ArangoDB's pre-defined " +
           "system collections."
  },
  {
    title: "Creating Documents",
    text:  "Now we have a collection, but it is stil empty. So let's create some documents!\n\n" +
           "  db.places.save({ _key : \"foo\", city : \"foo-city\" });\n" +
           "  for (i = 0; i <= 10; i++) { db.places.save({ _key: \"example\" + i, zipcode: i }) };"
  },
  {
    title: "Displaying All Documents",
    text:  "You want to take a look at your docs? No problem:\n\n" +
           "  db.places.toArray();"
  },
  {
    title: "Counting Documents",
    text:  "To see how many documents there are in a collection, use the 'count' method:\n\n" +
           "  db.places.count();"
  },
  {
    title: "Retrieving Single Documents",
    text:  "As you can see, each document has some meta attributes '_id', '_key' and '_rev'.\n" +
           "The '_key' attribute can be used to quickly retrieve a single document from " +
           "a collection:\n\n" +
           "  db.places.document(\"foo\");\n" +
           "  db.places.document(\"example5\");"
  },
  {
    title: "Retrieving Single Documents",
    text:  "The '_id' attribute can also be used to retrieve documents using the 'db' object:\n\n" +
           "  db._document(\"places/foo\");\n" +
           "  db._document(\"places/example5\");"
  },
  {
    title: "Modifying Documents",
    text:  "You can modify existing documents. Try to add a new attribute to a document and " +
           "verify whether it has been added:\n\n" +
           "  db._update(\"places/foo\", { zipcode: 39535 });\n" +
           "  db._document(\"places/foo\");"
  },
  {
    title: "Document Revisions",
    text:  "Note that after updating the document, its '_rev' attribute changed automatically.\n" +
           "The '_rev' attribute contains a document revision number, and it can be used for " +
           "conditional modifications. Here's an example of how to avoid lost updates in case " +
           "multiple clients are accessing the documents in parallel:\n\n" +
           "  doc = db._document(\"places/example1\");\n" +
           "  db._update(\"places/example1\", { someValue: 23 });\n" +
           "  db._update(doc, { someValue: 42 });\n\n" +
           "Note that the first update will succeed because it was unconditional. The second " +
           "update however is conditional because we're also passing the document's revision " +
           "id in the first parameter to _update. As the revision id we're passing to update " +
           "does not match the document's current revision anymore, the update is rejected."
  },
  {
    title: "Removing Documents",
    text:  "Deleting single documents can be achieved by providing the document _id or _key:\n\n" +
           "  db._remove(\"places/example7\");\n" +
           "  db.places.remove(\"example8\");\n" +
           "  db.places.count();"
  },
  {
    title: "Searching Documents",
    text:  "Searching for documents with specific attributes can be done by using the " +
           "byExample method:\n\n" +
           "  db._create(\"users\");\n" +
           "  for (i = 0; i < 10; ++i) { " +
              "db.users.save({ name: \"username\" + i, active: (i % 3 == 0), age: 30 + i }); }\n" +
           "  db.users.byExample({ active: false }).toArray();\n" +
           "  db.users.byExample({ name: \"username3\", active: true }).toArray();\n"
  },
  {
    title: "Running AQL Queries",
    text:  "ArangoDB also provides a query language for more complex matching:\n\n" +
           "  db._query(\"FOR u IN users FILTER u.active == true && u.age >= 33 " +
              "RETURN { username: u.name, age: u.age }\").toArray();"
  },
  {
    title: "Using Databases",
    text:  "By default, the ArangoShell connects to the default database. The default database " +
           "is named '_system'. To create another database, use the '_createDatabase' method of the " +
           "'db' object. To switch into an existing database, use '_useDatabase'. To get rid of a " +
           "database and all of its collections, use '_dropDatabase':\n\n" +
           "  db._createDatabase(\"mydb\");\n" +
           "  db._useDatabase(\"mydb\");\n" +
           "  db._dropDatabase(\"mydb\");"
  }
];

// -----------------------------------------------------------------------------
// --SECTION--                                                  public functions
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @brief print tutorial contents
////////////////////////////////////////////////////////////////////////////////

exports._PRINT = function (context) {
  var colors = require("internal").COLORS;

  /*jslint regexp: true */
  function process (text) {
    return text.replace(/\n {2}(.+?)(?=\n)/g,
                        "\n  " + colors.COLOR_MAGENTA + "$1" + colors.COLOR_RESET);
  }
  /*jslint regexp: false */

  var headline = colors.COLOR_BOLD_BLUE + (index + 1) + ". " + lessons[index].title + colors.COLOR_RESET;

  context.output += "\n\n" +
                    headline + "\n\n" +
                    process(lessons[index].text + "\n") + "\n";

  ++index;

  if (index >= lessons.length) {
    context.output += "Congratulations! You finished the tutorial.\n";
    index = 0;
  }
  else {
    context.output += next + "\n";
  }
};

// -----------------------------------------------------------------------------
// --SECTION--                                                       END-OF-FILE
// -----------------------------------------------------------------------------

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// @addtogroup\\|/// @page\\|// --SECTION--\\|/// @\\}\\|/\\*jslint"
// End:
});
