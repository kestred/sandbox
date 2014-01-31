// Filename: test_simple_struct.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

UNITTEST(test_simple_classes) {
	Module* module = run_parser("test_simple_classes.src");
	assert(module != NULL, "Encountered errors while parsing test_simple_classes.src");
}
