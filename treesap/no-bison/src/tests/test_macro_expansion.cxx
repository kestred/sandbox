// Filename: test_macro_expansion.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

static const char* filename = "test_macro_expansion.src";
static char file[] = "\n"
// Test we don't infinitely recurse on self-containing macros ...
"const int ACTUAL_VALUE = 3;\n"
"#define ACTUAL_VALUE ACTUAL_VALUE\n"
"int pie = ACTUAL_VALUE;\n"
// ... and with a slightly more complex macro
"#undef ACTUAL_VALUE\n"
"#define ACTUAL_VALUE 2 * (ACTUAL_VALUE + 4)\n"
"int cake = ACTUAL_VALUE;\n"
;

static Module* module;
void parse_macro_expansions() {
	module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
}

UNITTEST(test_macro_expansion) {
	// In this test we could very easily have infinite recursion.
	assert_completes(parse_macro_expansions, 5.0);
	assert(module != NULL, "Encountered errors while parsing test_simple_classes.src");
}
