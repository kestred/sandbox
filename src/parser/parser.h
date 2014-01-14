// Filename: parser.h
#pragma once
#include <string> // std::string
#include <list> // std::list

// Forward declaration
struct Module;
struct File;

Module* run_parser(const std::string & filename);
int parser_error_count();
int parser_warning_count();
void parser_error(const std::string & msg);
void parser_warning(const std::string & msg);

struct TokenLocation
{
	File* file;
	std::string* comment;

	int first_line;
	int first_column;
	int last_line;
	int last_column;
};
#define YYLTYPE_IS_DECLARED
#define YYLTYPE TokenLocation
