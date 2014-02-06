// Filename: test_system_stl.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

static const char* filename = "test_system_stl.src";
static char file[] = "\n"
"#include <string>\n"
"#include <list>\n"
"#include <set>\n"
"#include <map>\n"
;

UNITTEST(test_system_stl) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_system_stl.src");
}
