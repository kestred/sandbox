cmake_minimum_required(VERSION 2.8)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
project(Treesap)


## Set build type to Release with Debug Info by default
if(NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
	set(CMAKE_BUILD_TYPE RelWithDebInfo)
endif()

## Add per-compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "Clang" OR
   CMAKE_CXX_COMPILER_ID MATCHES "GNU")

	# Release with Debugging Info
	set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -g")

	# Release Flags -- warnings are errors, release code should not have warnings ###
	set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 -Wall -Werror")
	
	# Debug flags, Wall
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

## Dependencies
find_package(FLEX REQUIRED)
find_package(BISON REQUIRED)


## Define source files
set(PARSER_SOURCES
	src/main.cxx
	src/parser/cpp.cxx
	src/parser/lexer.cxx
	src/parser/parser.cxx
	src/parser/preprocess/prelexer.cxx
	src/parser/preprocess/preparser.cxx)

include_directories(src)
add_executable(treesap ${PARSER_SOURCES})
