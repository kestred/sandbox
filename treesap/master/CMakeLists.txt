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

option(ENABLE_PROFILING
  "This option enables the -pg compile flag,
   such that binaries will output a gmon.out for gprof."
  OFF)

# Add per-compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "Clang" OR
   CMAKE_CXX_COMPILER_ID MATCHES "GNU")

  set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -g -Wall")
  set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 -Wall -Werror")
  set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -g -Wall -Wextra")

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

  if(ENABLE_PROFILING)
    set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -pg")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -pg")
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -pg")
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
  src/util/strings.cxx)

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
add_test(parse_simple_classes test_simple_classes)

add_executable(test_template_declarations src/tests/test_template_declarations.cxx)
target_link_libraries(test_template_declarations treesap)
add_test(parse_template_declarations test_template_declarations)

add_executable(test_macro_expansion src/tests/test_macro_expansion.cxx)
target_link_libraries(test_macro_expansion treesap pthread)
add_test(parse_macro_expansion test_macro_expansion)

add_executable(test_system_stl src/tests/test_system_stl.cxx)
target_link_libraries(test_system_stl treesap)
add_test(parse_system_stl test_system_stl)

# The executable test_parse can be used to parse any random file passed as the first argument
add_executable(test_parse src/tests/test_parse.cxx)
target_link_libraries(test_parse treesap)
