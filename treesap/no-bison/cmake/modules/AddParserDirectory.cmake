# Filename: AddParserDirectory.cmake
# Description: This file defines the function add_parser_directory which
#   adds a bison target to the parser.yxx file and a flex target to the
#   lexer.lxx file found in the directory.
#
# Usage:
#   add_parser_directory(prefix dirname)
#

include(AddBisonTarget)
include(AddFlexTarget)

# Define add_parser_directory()
function(add_parser_directory prefix dirname)
  file(MAKE_DIRECTORY ${CMAKE_BINARY_DIR}/${dirname})
  add_bison_target(
    ${dirname}/parser.cxx
    ${dirname}/parser.yxx
    DEFINES ${dirname}/parser.dxx)
  set_source_files_properties(
    ${dirname}/parser.cxx
    PROPERTIES COMPILE_FLAGS
	"-I${CMAKE_SOURCE_DIR}/${dirname}")
  add_flex_target(
    ${dirname}/lexer.cxx
    ${dirname}/lexer.lxx
    PREFIX ${prefix})
  set_source_files_properties(
    ${dirname}/lexer.cxx
    PROPERTIES COMPILE_FLAGS
	"-I${CMAKE_SOURCE_DIR}/${dirname}")
endfunction()