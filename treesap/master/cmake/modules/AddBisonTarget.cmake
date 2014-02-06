# Filename: AddBisonTarget.cmake
# Description: This file defines the function add_bison_target which instructs
#   cmake to use bison on an input .yxx file.  If bison is not available on
#   the system, add_bison_target tries to use .prebuilt .cxx files instead.
#
# Usage:
#   add_bison_target(output_cxx input_yxx [DEFINES output_h] [PREFIX prefix])
#

find_package(BISON REQUIRED)

# Define add_bison_target()
function(add_bison_target output_cxx input_yxx)
  set(arguments "")
  set(keyword "")

  # Parse the extra arguments to the function.
  foreach(arg ${ARGN})
    if(arg STREQUAL "DEFINES")
      set(keyword "DEFINES")
    elseif(arg STREQUAL "PREFIX")
      set(keyword "PREFIX")

    elseif(keyword STREQUAL "PREFIX")
      set(arguments ${arguments} -p "${arg}")
    elseif(keyword STREQUAL "DEFINES")
      set(arguments ${arguments} --defines="${arg}")
      list(APPEND outputs "${arg}")

    else()
      message(SEND_ERROR "Unexpected argument ${arg} to add_bison_target")
    endif()
  endforeach()

  if(keyword STREQUAL arg AND NOT keyword STREQUAL "")
    message(SEND_ERROR "Expected argument after ${keyword}")
  endif()

  if(BISON_FOUND)
    add_custom_command(
      OUTPUT ${output_cxx}
      COMMAND ${BISON_EXECUTABLE}
        -o "${CMAKE_BINARY_DIR}/${output_cxx}" ${arguments}
        "${CMAKE_SOURCE_DIR}/${input_yxx}"
      MAIN_DEPENDENCY "${input_yxx}")
  endif()
endfunction(add_bison_target)
