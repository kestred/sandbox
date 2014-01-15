// Filename: preparser.h
#pragma once
#include <string> // std::string

// Foward declarations
struct Module;

bool parse_if_directive(Module *, const std::string & input);