// Filename: parser.hxx
#pragma once
#include "parser.dxx"
#include <string> // std::string

//void init_parser(/* input */, const string& filename);
int run_parser();

int parser_error_count();
int parser_warning_count();
void parser_error(const std::string &msg);
void parser_warning(const std::string &msg);
