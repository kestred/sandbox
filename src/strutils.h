// Filename: strutils.h
#include <string> // std::string

std::string trim(const std::string & str, const std::string & strip = " \t\n");
std::string ltrim(const std::string & str, const std::string & strip = " \t\n");
std::string rtrim(const std::string & str, const std::string & strip = " \t\n");
std::string stringify(const std::string & str);
std::string replace_substr(const std::string & orig,
                           const std::string & substr,
                           const std::string & replace);