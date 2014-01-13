// Filename: env.h
#include <vector> // std::vector
#include <string> // std::string

// Foward Declaration
struct Define;

std::vector<std::string> get_include_dirs();
std::vector<Define> get_compiler_defines();