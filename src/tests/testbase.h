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
	int main(void)

// The pass and fail macros cause the test to immediately pass or fail;
//     they must be called from the function body of UNITTEST.
#define pass() return 0
#define fail() return 1

// The assert macros cause the test to fail if the condition evalues to false;
//     they must be called from the function body of UNITTEST.
#define assert(cond, err)           \
	if(!(cond)) {                   \
		cerr << "Assertion Error: " \
		     << err << ".\n";       \
		fail();                     \
	}

#define assert_equal(a, b)           \
	if((a) != (b)) {                 \
		cerr << "Assertion Error: '" \
		     << (a) << "' != "       \
		     << (b) << "'.\n";       \
		fail();                      \
	}
