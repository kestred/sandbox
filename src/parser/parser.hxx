// Filename: parser.hxx
#pragma once
#include <string> // std::string
#include <list> // std::list

int run_parser(const std::string & filename);
int parser_error_count();
int parser_warning_count();
void parser_error(const std::string & msg);
void parser_warning(const std::string & msg);


// A InputFile holds extra per-file information while lexing and parsing
struct InputFile
{
	std::string filename;
	std::string current_line; // holds the current line for error reporting
	std::list<std::string> comments;
	int line_number; // current line of the file
	int col_number; // current col of the file
};

struct TokenLocation
{
	InputFile *file;
	std::string *comment;

	int first_line;
	int first_column;
	int last_line;
	int last_column;
};
#define YYLTYPE_IS_DECLARED
#define YYLTYPE TokenLocation
