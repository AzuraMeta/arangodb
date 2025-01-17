import os
import re
import inspect
import cgi

def file_content(filepath):
  """ Fetches and formats file's content to perform the required operation.
  """

  infile = open(filepath, 'r')
  filelines = tuple(infile)
  infile.close()

  comment_indexes = []
  comments = []

  for line in enumerate(filelines):
    if "@startDocuBlock" in line[1]:
      _start = line[0]
    if "@endDocuBlock" in line[1]:
      _end = line[0] + 1
      comment_indexes.append([_start, _end])

  for index in comment_indexes:
    comments.append(filelines[index[0]: index[1]])

  return comments


def example_content(filepath, fh, tag):
  """ Fetches an example file and inserts it using code
  """

  arangosh = False
  curl = False
  first = True
  lastline = None
  long = ""
  longLines = 0
  short = ""
  shortLines = 0
  shortable = False
  showdots = True

  CURL_STATE_CMD = 1
  CURL_STATE_HEADER = 2
  CURL_STATE_BODY = 3

  # read in the context, split into long and short
  infile = open(filepath, 'r')

  for line in infile:
    if first:
      arangosh = line.startswith("arangosh>")
      curl = line.startswith("shell> curl")
      first = False

    if arangosh:
      if line.startswith("arangosh>") or line.startswith("........>"):
        if lastline != None:
          # short = short + lastline
          # shortLines = shortLines + 1
          lastline = None

        short = short + line
        shortLines = shortLines + 1
        showdots = True
      else:
        if showdots:
          if lastline == None:
            # lastline = line
            shortable = True
            showdots = False
            lastline = None
          else:
            # short = short + "~~~hidden~~~\n"
            # shortLines = shortLines + 1
            shortable = True
            showdots = False
            lastline = None

    if curl:
      if line.startswith("shell> curl"):
        curlState = CURL_STATE_CMD
      elif curlState == CURL_STATE_CMD and line.startswith("HTTP/1.1 "):
        curlState = CURL_STATE_HEADER
      elif curlState == CURL_STATE_HEADER and line.startswith("{"):
        curlState = CURL_STATE_BODY

      if curlState == CURL_STATE_CMD or curlState == CURL_STATE_HEADER:
        line = cgi.escape(line)
        short = short + line
        shortLines = shortLines + 1
      else:
        shortable = True

    long = long + line
    longLines = longLines + 1

  if lastline != None:
    short = short + lastline
    shortLines = shortLines + 1

  infile.close()

  if longLines - shortLines < 5:
    shortable = False

  # write example
  fh.write("\n")
  fh.write("<div id=\"%s_container\">\n" % tag)

  longTag = "%s_long" % tag
  shortTag = "%s_short" % tag

  longToggle = "$('#%s').hide(); $('#%s').show();" % (longTag, shortTag)
  shortToggle = "$('#%s').hide(); $('#%s').show();" % (shortTag, longTag)

  if shortable:
    fh.write("<div id=\"%s\" onclick=\"%s\" style=\"Display: none;\">\n" % (longTag, longToggle))
  else:
    fh.write("<div id=\"%s\">\n" % longTag)

  fh.write("<pre>\n")
#  fh.write("```\n")
  fh.write("%s" % long)
#  fh.write("```\n")
  fh.write("</pre>\n")
  fh.write("</div>\n")
  
  if shortable:
    fh.write("<div id=\"%s\" onclick=\"%s\">\n" % (shortTag, shortToggle))
    fh.write("<pre>\n")
#    fh.write("```\n")
    fh.write("%s" % short)
#    fh.write("```\n")

    if arangosh:
      fh.write("</pre><div class=\"example_show_button\">show execution results</div>\n")
    elif curl:
      fh.write("</pre><div class=\"example_show_button\">show response body</div>\n")
    else:
      fh.write("</pre><div class=\"example_show_button\">show</div>\n")
      
    fh.write("</div>\n")

  fh.write("</div>\n")
  fh.write("\n")


def fetch_comments(dirpath):
  """ Fetches comments from files and writes to a file in required format.
  """

  comments_filename = "allComments.txt"
  fh = open(comments_filename, "a")
  shouldIgnoreLine = False;

  for root, directories, files in os.walk(dirpath):
    for filename in files:
      if filename.endswith((".cpp", ".h", ".js")):
        filepath = os.path.join(root, filename)
        file_comments = file_content(filepath)
        for comment in file_comments:
          fh.write("\n<!-- filename: %s -->\n" % filename)
          for _com in comment:
            _text = re.sub(r"//(/)+\s*\n", "<br />", _com)
            _text = re.sub(r"///+(\s+\s+)([-\*\d])", r"  \2", _text)
            _text = re.sub(r"///\s", "", _text)
            _text = _text.strip("\n")
            if _text:
              if not shouldIgnoreLine:
                if ("@startDocuBlock" in _text) or \
                  ("@endDocuBlock" in _text):
                  fh.write("%s\n\n" % _text)
                elif ("@EXAMPLE_ARANGOSH_OUTPUT" in _text or \
                  "@EXAMPLE_ARANGOSH_RUN" in _text):
                  shouldIgnoreLine = True
                  _filename = re.search("{(.*)}", _text).group(1)
                  dirpath = os.path.abspath(os.path.join(os.path.dirname( __file__ ), os.pardir, "Examples", _filename + ".generated"))
                  if os.path.isfile(dirpath):
                    example_content(dirpath, fh, _filename)
                  else:
                    print "Could not find code for " + _filename
                else:
                  fh.write("%s\n" % _text)
              elif ("@END_EXAMPLE_ARANGOSH_OUTPUT" in _text or \
                "@END_EXAMPLE_ARANGOSH_RUN" in _text):
                shouldIgnoreLine = False
  fh.close()

if __name__ == "__main__":
  errorsFile = open("../../lib/Basics/errors.dat", "r")
  commentsFile = open("allComments.txt", "w")
  commentsFile.write("@startDocuBlock errorCodes \n")
  for line in errorsFile:
    commentsFile.write(line + "\n")
  commentsFile.write("@endDocuBlock \n")
  commentsFile.close()
  errorsFile.close()
  path = ["arangod/Cluster","arangod/RestHandler","arangod/V8Server","arangod/RestServer","arangod/Wal",
      "lib/Admin","lib/HttpServer","lib/V8","lib/ApplicationServer","lib/Scheduler","lib/Rest","lib/Basics",
      "js/actions","js/client","js/apps/system/cerberus","js/common","js/server","js/apps"]
  for i in path:
    dirpath = os.path.abspath(os.path.join(os.path.dirname( __file__ ), os.pardir,"ArangoDB/../../"+i))
    fetch_comments(dirpath)
    print "Searching for docublocks in " + i
    os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'templates'))
