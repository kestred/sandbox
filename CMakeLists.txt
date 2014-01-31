cmake_minimum_required(VERSION 2.8)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
project(Treesap)
enable_testing()

# Set path to all of our custom modules
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/modules/")

# Set build type to Release with Debug Info by default
if(NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE RelWithDebInfo)
endif()

# Add per-compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "Clang" OR
   CMAKE_CXX_COMPILER_ID MATCHES "GNU")
  set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -g -Wall")
  set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 -Wall -Werror")
  set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Wall -Wextra")
endif()

if(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_definitions(-std=c++11)
endif()

if(CMAKE_CXX_COMPILER_ID MATCHES "GNU")
  execute_process(COMMAND ${CMAKE_C_COMPILER} -dumpversion OUTPUT_VARIABLE GCC_VERSION)
  message(STATUS "GCC Version: ${GCC_VERSION}")
  if(GCC_VERSION VERSION_GREATER 4.7 OR GCC_VERSION VERSION_EQUAL 4.7)
    add_definitions(-std=c++11) # Enable the new C++ standard
  else()
    add_definitions(-std=c++0x) # Enable the new C++ standard
  endif()
endif()

# Generate parser source files
include(AddParserDirectory)
add_parser_directory(cpp src/cpp/parser)
add_parser_directory(ppr src/cpp/preprocessor)

# List normal source files
set(CPP_SOURCES
  src/cpp/cpp.cxx
  src/cpp/parser/lexer.cxx
  src/cpp/parser/parser.cxx
  src/cpp/preprocessor/lexer.cxx
  src/cpp/preprocessor/parser.cxx)
set(UTIL_SOURCES
  src/strutils.cxx)

# Add include_directories for compiler
include_directories(src)
include_directories(${CMAKE_BINARY_DIR}/src)

# Build the library target
add_library(treesap
  ${CPP_SOURCES}
  ${UTIL_SOURCES})

# Build unittests
set(CMAKE_TEST_DIR ${CMAKE_SOURCE_DIR}/src/tests)

add_executable(test_simple_classes src/tests/test_simple_classes.cxx)
target_link_libraries(test_simple_classes treesap)
add_test(
  NAME parse_simple_classes
  COMMAND test_simple_classes
  WORKING_DIRECTORY ${CMAKE_TEST_DIR})

# The executable test_parse can be used to parse any random file passed as the first argument
add_executable(test_parse src/tests/test_parse.cxx)
target_link_libraries(test_parse treesap)
