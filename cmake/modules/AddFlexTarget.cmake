# Filename: AddFlexTarget.cmake
# Description: This file defines the function add_flex_target which instructs
#   cmake to use flex on an input .lxx file.  If flex is not available on
#   the system, add_flex_target tries to use .prebuilt .cxx files instead.
#
# Usage:
#   add_flex_target(output_cxx input_lxx [DEFINES output_h] [PREFIX prefix])
#

find_package(FLEX REQUIRED)

# Define add_flex_target()
function(add_flex_target output_cxx input_lxx)
  set(arguments "")
  set(keyword "")

  # Parse the extra arguments to the function.
  foreach(arg ${ARGN})
    if(arg STREQUAL "DEFINES")
      set(keyword "DEFINES")
    elseif(arg STREQUAL "PREFIX")
      set(keyword "PREFIX")
    elseif(arg STREQUAL "CASE_INSENSITIVE")
      set(arguments ${arguments} -i)

    elseif(keyword STREQUAL "PREFIX")
      set(arguments ${arguments} -P "${arg}")
    elseif(keyword STREQUAL "DEFINES")
      set(arguments ${arguments} --header-file="${arg}")
      list(APPEND outputs "${arg}")

    else()
      message(SEND_ERROR "Unexpected argument ${arg} to add_flex_target")
    endif()
  endforeach()

  if(keyword STREQUAL arg AND NOT keyword STREQUAL "")
    message(SEND_ERROR "Expected argument after ${keyword}")
  endif()

  if(FLEX_FOUND)
    add_custom_command(
      OUTPUT ${output_cxx}
      COMMAND ${FLEX_EXECUTABLE}
        -o "${CMAKE_BINARY_DIR}/${output_cxx}" ${arguments}
        "${input_lxx}"
      MAIN_DEPENDENCY "${input_lxx}"
      WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}")
  endif()
endfunction(add_flex_target)
