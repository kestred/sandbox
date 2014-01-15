// Filename: preparser.h
#pragma once
#include <string> // std::string
#include <vector> // std::vector

// Foward declarations
struct Module;

bool parse_if_directive(Module *, const std::string & input);

struct MacroCall {
	std::string macro;
	std::vector<std::string> arg_values;
};
