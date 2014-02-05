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
#include <thread>
#include <time.h>
using std::string;
using std::cout;
using std::thread;


/* Define testbase globals */
extern string tb_test_name;

/* Define testbase macros */
// To define a new unittest, define a new function using
//     UNITTEST(test_name) as the function prototype.
#define UNITTEST(name)           \
	string tb_test_name = #name; \
	int main(void)

// The pass and fail macros cause the test to immediately pass or fail;
//     they must be called from the function body of UNITTEST.
#define pass() return 0
#define fail() return 1
#define fatal() exit(1);


// Some tools for error message output
#define line(text) \
	cout << "\nError in unittest("     \
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

#define assert_completes(func, timeout, args...)     \
	bool is_complete = false;                        \
	thread* test_timeout_##func =                    \
		new thread([&](){ func(args); });            \
	thread* check_timeout_##func =                   \
		new thread([&](){ test_complete(             \
			test_timeout_##func, is_complete); });   \
	time_t start = time(NULL);                       \
	while(difftime(time(NULL), start) < timeout      \
		  && !is_complete) {                         \
		std::this_thread::sleep_for(                 \
			std::chrono::milliseconds(               \
				(int)timeout*25));                   \
	}                                                \
	if(!is_complete) {                               \
		line("assert_completes("#func"("#args"))")   \
		     << "Assertion Error: '" #func "' did"   \
		     " not run completely within "           \
		     << timeout << " seconds.\n";            \
		fatal();                                     \
	} else {                                         \
		check_timeout_##func->join();                \
	}

void test_complete(thread* t, bool& out) {
	out = false;
	t->join();
	out = true;
}
