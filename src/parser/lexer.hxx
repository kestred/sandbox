// Filename: lexer.hxx
#pragma once
#include <string> // std::string

//void init_lexer(std::istream& in, const std::string& filename);
//int run_lexer();
int yylex();

int lexer_error_count();
int lexer_warning_count();
void lexer_error(const std::string& msg);
void lexer_warning(const std::string& msg);
