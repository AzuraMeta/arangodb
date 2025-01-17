module.define("org/arangodb-common", function(exports, module) {
'use strict';

////////////////////////////////////////////////////////////////////////////////
/// @brief JavaScript base module
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2004-2013 triAGENS GmbH, Cologne, Germany
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
/// @author Dr. Frank Celler
/// @author Copyright 2012-2013, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

var internal = require("internal");

var fs = require("fs");

var mimetypes = require("org/arangodb/mimetypes").mimeTypes;

// -----------------------------------------------------------------------------
// --SECTION--                                                 module "arangodb"
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// --SECTION--                                                  public constants
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @brief errors
////////////////////////////////////////////////////////////////////////////////


Object.keys(internal.errors).forEach(function (key) {
  exports[key] = internal.errors[key].code;
});

exports.errors = internal.errors;

// -----------------------------------------------------------------------------
// --SECTION--                                                      public types
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @brief ArangoError
////////////////////////////////////////////////////////////////////////////////

exports.ArangoError = internal.ArangoError;

// -----------------------------------------------------------------------------
// --SECTION--                                                  public functions
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @brief defines a module
////////////////////////////////////////////////////////////////////////////////

exports.defineModule = function (path, file) {
  var content;
  var m;
  var mc;

  content = fs.read(file);

  mc = internal.db._collection("_modules");

  if (mc === null) {
    mc = internal.db._create("_modules", { isSystem: true });
  }

  path = module.normalize(path);
  m = mc.firstExample({ path: path });

  if (m === null) {
    mc.save({ path: path, content: content });
  }
  else {
    mc.replace(m, { path: path, content: content });
  }
};

////////////////////////////////////////////////////////////////////////////////
/// @brief guessContentType
////////////////////////////////////////////////////////////////////////////////

exports.guessContentType = function (filename, defaultValue) {
  var re = /\.([a-zA-Z0-9]+)$/;
  var match = re.exec(filename);

  if (match !== null) {
    var extension = match[1];

    if (mimetypes.hasOwnProperty(extension)) {
      var type = mimetypes[extension];

      if (type[1]) {
        // append charset
        return type[0] + "; charset=utf-8";
      }

      return type[0];
    }
    // fall-through intentional
  }

  // default mimetype
  if (defaultValue) {
    return defaultValue;
  }
  return "text/plain; charset=utf-8";
};

////////////////////////////////////////////////////////////////////////////////
/// @brief normalizeURL
///
/// If @FA{path} starts with "." or "..", then it is a relative path.
/// Otherwise it is an absolute path. Normalizing will remove `//`,
/// `/./`, `/../` from the url - expect in the beginning, where it keeps
/// `../` and or at most one `./`.
///
/// If @FA{path} is empty, the url `./` will be returned.
////////////////////////////////////////////////////////////////////////////////

exports.normalizeURL = function (path) {
  var i;
  var n;
  var p;
  var q;
  var r;
  var x;

  if (path === "") {
    return "./";
  }

  p = path.split('/');

  // relative path
  if (p[0] === "." || p[0] === "..") {
    r = p[0] + "/";
    p.shift();
    q = p;
  }

  // absolute path
  else if (p[0] === "") {
    r = "/";
    p.shift();
    q = p;
  }

  // assume that the path is relative
  else {
    r = "./";
    q = p;
  }

  // normalize path
  n = [];

  for (i = 0;  i < q.length;  ++i) {
    x = q[i];

    if (x === "..") {
      if (n.length === 0) {
        if (r === "../") {
          n.push(x);
        }
        else if (r === "./") {
          r = "../";
        }
        else {
          throw "cannot use '..' to escape top-level-directory";
        }
      }
      else if (n[n.length - 1] === "..") {
        n.push(x);
      }
      else {
        n.pop();
      }
    }
    else if (x !== "" && x !== ".") {
      n.push(x);
    }
  }

  return r + n.join('/');
};

////////////////////////////////////////////////////////////////////////////////
/// @brief inspect
////////////////////////////////////////////////////////////////////////////////

exports.inspect = internal.inspect;

////////////////////////////////////////////////////////////////////////////////
/// @brief output
///
/// In order to allow "capture" output to work, we cannot assigne the
/// function here.
////////////////////////////////////////////////////////////////////////////////

exports.output = function () {
  internal.output.apply(internal.output, arguments);
};

////////////////////////////////////////////////////////////////////////////////
/// @brief print
////////////////////////////////////////////////////////////////////////////////

exports.print = internal.print;

////////////////////////////////////////////////////////////////////////////////
/// @brief printf
////////////////////////////////////////////////////////////////////////////////

exports.printf = internal.printf;

////////////////////////////////////////////////////////////////////////////////
/// @brief sprintf
////////////////////////////////////////////////////////////////////////////////

exports.sprintf = internal.sprintf;

////////////////////////////////////////////////////////////////////////////////
/// @brief printObject
////////////////////////////////////////////////////////////////////////////////

exports.printObject = internal.printObject;

////////////////////////////////////////////////////////////////////////////////
/// @brief 2D ASCII table printing
////////////////////////////////////////////////////////////////////////////////

exports.printTable = function  (list, columns, options) {
  options = options || { };
  if (options.totalString === undefined) {
    options.totalString = "%s document(s)\n";
  }

  var pad = '...';
  var descriptions, matrix, col, what, j;

  if (columns === undefined) {
    what = list[0];
  }
  else if (Array.isArray(columns)) {
    what = { };

    columns.forEach(function (col) {
      what[col] = null;
    });
  }
  else {
    what = columns;
  }

  j = 0;
  descriptions = [ ];
  matrix = [ [ ] ];

  for (col in what) {
    if (what.hasOwnProperty(col)) {
      var fixedLength = null;

      if (columns && columns.hasOwnProperty(col) && columns[col] > 0) {
        fixedLength = columns[col] >= pad.length ? columns[col] : pad.length;
      }

      // header
      var name = col;

      // rename header?
      if (options.hasOwnProperty("rename")) {
        if (options.rename.hasOwnProperty(col)) {
          name = options.rename[col];
        }
      }

      descriptions.push({
        id: col,
        fixedLength: fixedLength,
        length: fixedLength || name.length
      });

      matrix[0][j++] = name;
    }
  }

  // determine values & max widths
  list.forEach(function (row, i) {
    matrix[i + 1] = [ ];
    descriptions.forEach(function (col) {

      if (row.hasOwnProperty(col.id)) {
        var value;
        if (options.prettyStrings && typeof row[col.id] === 'string') {
          value = row[col.id];
        }
        else {
          value = JSON.stringify(row[col.id]) || "";
        }

        matrix[i + 1].push(value);

        if (value.length > col.length && ! col.fixedLength) {
          col.length = Math.min(value.length, 100);
        }
      }
      else {
        // undefined
        matrix[i + 1].push('');
      }
    });
  });

  var divider = function () {
    var parts = [ ];
    descriptions.forEach(function (desc) {
      parts.push(exports.stringPadding('', desc.length, '-', 'r'));
    });

    if (options.framed) {
      return '+-' + parts.join('-+-') + '-+\n';
    }

    return parts.join('   ') + '\n';
  };

  var compose = function () {
    var result = '';

    if (options.framed) {
      result += divider();
    }
    matrix.forEach(function (row, i) {
      var parts = [ ];

      row.forEach(function (col, j) {

        var len = descriptions[j].length, value = row[j];
        if (value.length > len) {
          value = value.substr(0, len - pad.length) + pad;
        }
        parts.push(exports.stringPadding(value, len, ' ', 'r'));
      });

      if (options.framed) {
        result += '| ' + parts.join(' | ') + ' |\n';
      }
      else {
        result += parts.join('   ') + '\n';
      }

      if (i === 0) {
        result += divider();
      }
    });

    result += divider();

    if (! options.hideTotal) {
      result += internal.sprintf(options.totalString, String(list.length));
    }
    return result;
  };

  if (! Array.isArray(list)) {
    // not an array
    return;
  }

  if (list.length === 0) {
    exports.print(options.emptyString || "no document(s)");
  }
  else {
    exports.print(compose());
  }
};

////////////////////////////////////////////////////////////////////////////////
/// @brief stringPadding
////////////////////////////////////////////////////////////////////////////////

exports.stringPadding = function (str, len, pad, dir) {
  // yes, this is more code than new Array(length).join(chr), but it makes jslint happy
  function fill (length, chr) {
    var result = '', i;
    for (i = 0; i < length; ++i) {
      result += chr;
    }
    return result;
  }

  if (typeof(len) === "undefined") {
    len = 0;
  }
  if (typeof(pad) === "undefined") {
    pad = ' ';
  }

  if (len + 1 >= str.length) {
    switch (dir || "r"){

      // LEFT
      case 'l':
        str = fill(len + 1 - str.length, pad) + str;
        break;

      // BOTH
      case 'b':
        var padlen = len - str.length;
        var right = Math.ceil(padlen / 2);
        var left = padlen - right;
        str = fill(left + 1, pad) + str + fill(right + 1, pad);
        break;

      default:
         str = str + fill(len + 1 - str.length, pad);
         break;
    }
  }

  return str;
};

////////////////////////////////////////////////////////////////////////////////
/// @brief throws an error in case a download failed
////////////////////////////////////////////////////////////////////////////////

exports.throwDownloadError = function (msg) {
  throw new exports.ArangoError({
    errorNum: exports.errors.ERROR_APPLICATION_DOWNLOAD_FAILED.code,
    errorMessage: exports.errors.ERROR_APPLICATION_DOWNLOAD_FAILED.message + ': ' + String(msg)
  });
};

////////////////////////////////////////////////////////////////////////////////
/// @brief throws an error in case of missing file
////////////////////////////////////////////////////////////////////////////////

exports.throwFileNotFound = function (msg) {
  throw new exports.ArangoError({
    errorNum: exports.errors.ERROR_FILE_NOT_FOUND.code,
    errorMessage: exports.errors.ERROR_FILE_NOT_FOUND.message + ': ' + String(msg)
  });
};

////////////////////////////////////////////////////////////////////////////////
/// @brief throws an error in case of a bad parameter
////////////////////////////////////////////////////////////////////////////////

exports.throwBadParameter = function (msg) {
  throw new exports.ArangoError({
    errorNum: exports.errors.ERROR_BAD_PARAMETER.code,
    errorMessage: exports.errors.ERROR_BAD_PARAMETER.message + ': ' + String(msg)
  });
};

////////////////////////////////////////////////////////////////////////////////
/// @brief checks parameter, throws an error if missing
////////////////////////////////////////////////////////////////////////////////

exports.checkParameter = function (usage, descs, vars) {
  var i;

  for (i = 0;  i < descs.length;  ++i) {
    var desc = descs[i];

    if (typeof vars[i] === "undefined") {
      exports.throwBadParameter(desc[0] + " missing, usage: " + usage);
    }

    if (typeof vars[i] !== desc[1]) {
      exports.throwBadParameter(desc[0] + " should be a '" + desc[1] + "', "
                              + "not '" + (typeof vars[i]) + "'");
    }
  }
};

// -----------------------------------------------------------------------------
// --SECTION--                                                       END-OF-FILE
// -----------------------------------------------------------------------------

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// @addtogroup\\|// --SECTION--\\|/// @}\\|/\\*jslint"
// End:
});
