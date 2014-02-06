// Filename: parser.h
#pragma once
#include <string> // std::string
#include <list> // std::list

// Forward declarations
struct Module;
struct File;

/* Published interface */
Module* run_parser(const std::string & filename);
Module* run_parser(const std::string & filename, FILE* file);
int cpp_errors();
int cpp_warnings();

/* lexer-to-parser interface */
void cpp_push_file(File*);
void cpp_pop_to_file(File*);
