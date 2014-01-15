// Filename: lexer.h
#pragma once
#include <string> // std::string

// Foward declarations
struct Module;

Module* init_lexer(const std::string& filename);
int cpp_yylex();

int cpp_yyerrors();
int cpp_yywarnings();
void cpp_yyerror(const std::string & msg);
void cpp_yywarning(const std::string & msg);
