// Filename: strings.h
#include <string>
using std::string;

string trim(const string& str, const string & strip = " \t\n");
string ltrim(const string& str, const string & strip = " \t\n");
string rtrim(const string& str, const string & strip = " \t\n");
string replace(const string& str, const string& substr, const string& replace);
string stringify(const string& str);