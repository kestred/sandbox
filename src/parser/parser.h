// Filename: parser.h
#pragma once
#include <string> // std::string
#include <list> // std::list

// Forward declaration
struct Module;
struct File;

Module* run_parser(const std::string & filename);
int parser_errors();
int parser_warnings();

struct TokenLocation
{
	File* file;
	std::string* comment;

	int first_line;
	int first_column;
	int last_line;
	int last_column;
};
#define CPP_YYLTYPE_IS_DECLARED
#define CPP_YYLTYPE TokenLocation
