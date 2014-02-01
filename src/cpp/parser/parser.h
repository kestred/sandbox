// Filename: parser.h
#pragma once
#include <string> // std::string
#include <list> // std::list

// Forward declarations
struct Module;
struct File;

/* Published interface */
Module* run_parser(const std::string & filename);
int cpp_errors();
int cpp_warnings();

/* Internal interface */
void cpp_parser_file(File*);

struct Location;
#define CPPLTYPE_IS_DECLARED
#define CPPLTYPE Location
