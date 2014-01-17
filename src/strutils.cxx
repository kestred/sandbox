#include "strutils.h"
using namespace std;

// trim
string ltrim(const string & str, const string & strip) {
	string s = str;
	s.erase(0, s.find_first_not_of(strip));
	return s;
}
string rtrim(const string & str, const string & strip) {
	string s = str;
	s.erase(s.find_last_not_of(strip)+1);
	return s;

}
string trim(const string & str, const string & strip) {
	return ltrim(rtrim(str, strip), strip);
}

// stringify
string stringify(const string & str) {
	string result;

	result += '"';
	for(auto it = str.begin(); it != str.end(); ++it) {
		char c = *it;
		if(c == '"' || c == '\\') {
			// Escape the character
			result += '\\';
			result += c;
		} else if(c == '\n') {
			result += "\\n";
		} else if(!isprint(c)) {
			// If character is not a printable ascii character.
			// Print the character as an escaped hexidecimal character constant
			char infer[10];
			sprintf(infer, "%02x", (unsigned char)c);
			result += "\\x";
			result += infer;
		} else {
			result += c;
		}
	}
	result += '"';

	return result;
}

// replace_substr
string replace_substr(const string & orig, const string & substr, const string & replace) {
	string result = "";
	size_t begin = 0;
	size_t where = orig.find(substr, begin);
	while(where != string::npos) {
		result += orig.substr(begin, where - begin);
		result += replace;
		begin = where - begin + substr.length();
		where = orig.find(substr, begin);
	}
	result += orig.substr(begin);
	return result;
}
