// Filename: lexer.h
#pragma once
#include <string> // std::string

// Foward declarations
struct Module;

/* Published interface */
Module* init_lexer(const std::string& filename);
Module* init_lexer(const std::string& filename, FILE* file);
int cpplex();
int cpp_errors();
int cpp_warnings();

/* parser-to-lexer interface */
void cpperror(const std::string & msg);
void cpperronce(const std::string &msg);
void cppwarning(const std::string & msg);
