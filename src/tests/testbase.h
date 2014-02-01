// Filename: testbase.h

// Cause a compilation error if we try to include this more than once
#ifdef TREESAP_TESTBASE_H
#error Testbase should only be included once.
#else
#define TREESAP_TESTBASE_H
#endif

/* Handle normal includes */
#include <string>
#include <iostream>
using std::string;
using std::cerr;


/* Define testbase globals */
extern string tb_test_name;


/* Define testbase macros */
// To define a new unittest, define a new function using
//     UNITTEST(test_name) as the function prototype.
#define UNITTEST(name)    \
	string tb_test_name = #name; \
	int main(int argc, char* argv[])

// The pass and fail macros cause the test to immediately pass or fail;
//     they must be called from the function body of UNITTEST.
#define pass() return 0
#define fail() return 1


// Some tools for error message output
#define line(text) \
	cerr << "\nError in unittest("     \
		 << tb_test_name               \
		 << ") at line " << __LINE__   \
         << " of file\n\t" << __FILE__ \
         << "\nLine: " << (text)       \
         << "\n"

// The assert macros cause the test to fail if the condition evaluates to false;
//     they must be called from the function body of UNITTEST.
#define assert(cond, err)               \
	if(!(cond)) {                       \
		line("assert("#cond")")         \
		     << "Assertion Error: "     \
		     << (err) << "\n";         \
		fail();                         \
	}

#define assert_equal(a, b)               \
	if((a) != (b)) {                     \
		line("assert_equal("#a", "#b")") \
		     << "Assertion Error: '"     \
		     << (a) << "' != "           \
		     << (b) << "'.\n";           \
		fail();                          \
	}

#define assert_not_equal(a, b)               \
	if((a) == (b)) {                         \
		line("assert_not_equal("#a", "#b")") \
		     << "Assertion Error: '"         \
		     << (a) << "' == "               \
		     << (b) << "'.\n";               \
		fail();                              \
	}

// The __DIR__ macro returns the name of the directory containing the
//     source file as a string, including the trailing slash.
#define __DIR__ strip_file(__FILE__)
string strip_file(const char* path) {
	string ret = path;
	return ret.substr(0, ret.find_last_of('/')+1);
}
