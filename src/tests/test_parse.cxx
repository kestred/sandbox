// Filename: test_parse.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

UNITTEST(test_simple_classes) {
	if(argc < 2) { return 1; }
	string filename = argv[1];

	Module* module = run_parser(filename);
	assert(module != NULL, "Encountered errors while parsing " + filename);
}
