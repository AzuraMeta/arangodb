////////////////////////////////////////////////////////////////////////////////
/// @brief collections of file functions
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2014 ArangoDB GmbH, Cologne, Germany
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
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Copyright 2014, ArangoDB GmbH, Cologne, Germany
/// @author Copyright 2008-2013, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGODB_BASICS_FILE_UTILS_H
#define ARANGODB_BASICS_FILE_UTILS_H 1

#include "Basics/Common.h"

namespace triagens {
  namespace basics {
    class StringBuffer;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection of file functions
////////////////////////////////////////////////////////////////////////////////

    namespace FileUtils {

////////////////////////////////////////////////////////////////////////////////
/// @brief returns a new ifstream or 0
////////////////////////////////////////////////////////////////////////////////

      std::ifstream* createInput (std::string const& filename);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns a new ofstream or 0
////////////////////////////////////////////////////////////////////////////////

      std::ofstream* createOutput (std::string const& filename);

////////////////////////////////////////////////////////////////////////////////
/// @brief reads file into string
////////////////////////////////////////////////////////////////////////////////

      std::string slurp (std::string const& filename);

////////////////////////////////////////////////////////////////////////////////
/// @brief reads file into string buffer
////////////////////////////////////////////////////////////////////////////////

      void slurp (std::string const& filename, StringBuffer&);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates file and writes string to it
////////////////////////////////////////////////////////////////////////////////

      void spit (std::string const& filename, const char* ptr, size_t len);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates file and writes string to it
////////////////////////////////////////////////////////////////////////////////

      void spit (std::string const& filename, std::string const& content);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates file and writes string to it
////////////////////////////////////////////////////////////////////////////////

      void spit (std::string const& filename, StringBuffer const& content);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns true if a file could be removed
////////////////////////////////////////////////////////////////////////////////

      bool remove (std::string const& fileName, int* errorNumber = 0);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns true if a file could be renamed
////////////////////////////////////////////////////////////////////////////////

      bool rename (std::string const& oldName, std::string const& newName, int* errorNumber = 0);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates a new directory
////////////////////////////////////////////////////////////////////////////////

      bool createDirectory (std::string const& name, int* errorNumber = 0);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates a new directory with mask
////////////////////////////////////////////////////////////////////////////////

      bool createDirectory (std::string const& name, int mask, int* errorNumber = 0);

////////////////////////////////////////////////////////////////////////////////
/// @brief copies directories / files recursive
////////////////////////////////////////////////////////////////////////////////

      bool copyRecursive (std::string const& source, std::string const & target, std::string &error);

////////////////////////////////////////////////////////////////////////////////
/// @brief copies directories / files recursive; start source node has to be a directory.
////////////////////////////////////////////////////////////////////////////////

      bool copyDirectoryRecursive (std::string const& source, std::string const & target, std::string &error);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns list of files
////////////////////////////////////////////////////////////////////////////////

      std::vector<std::string> listFiles (std::string const& directory);

////////////////////////////////////////////////////////////////////////////////
/// @brief checks if path is a directory
////////////////////////////////////////////////////////////////////////////////

      bool isDirectory (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief checks if path is a symbolic link
////////////////////////////////////////////////////////////////////////////////

      bool isSymbolicLink (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief checks if path is a regular file
////////////////////////////////////////////////////////////////////////////////

      bool isRegularFile (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief checks if path exists
////////////////////////////////////////////////////////////////////////////////

      bool exists (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the size of a file. will return 0 for non-existing files
///
/// the caller should check first if the file exists via the exists() method
////////////////////////////////////////////////////////////////////////////////

      off_t size (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief strip extension
////////////////////////////////////////////////////////////////////////////////

      std::string stripExtension (std::string const& path, std::string const& extension);

////////////////////////////////////////////////////////////////////////////////
/// @brief changes into directory
////////////////////////////////////////////////////////////////////////////////

      bool changeDirectory (std::string const& path);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the current directory
////////////////////////////////////////////////////////////////////////////////

      std::string currentDirectory (int* errorNumber = 0);

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the home directory
////////////////////////////////////////////////////////////////////////////////

      std::string homeDirectory ();
    }
  }
}

#endif
// -----------------------------------------------------------------------------
// --SECTION--                                                       END-OF-FILE
// -----------------------------------------------------------------------------

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// {@inheritDoc}\\|/// @page\\|// --SECTION--\\|/// @\\}"
// End:
