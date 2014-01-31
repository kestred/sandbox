// Filename: parser.h
#pragma once
#include <string> // std::string
#include <list> // std::list

// Forward declaration
struct Module;
struct File;

Module* run_parser(const std::string & filename);
int cpp_errors();
int cpp_warnings();

struct Location;
#define CPPLTYPE_IS_DECLARED
#define CPPLTYPE Location
