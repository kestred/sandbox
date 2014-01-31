// Filename: test_simple_struct.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

UNITTEST(test_simple_classes) {
	Module* module = run_parser("test_simple_classes.src");
	assert(module != NULL, "Encountered errors while parsing test_simple_classes.src");

	Scope* global = &module->global;
	// Check our structs have corresponding symbols
	assert(global->symbols.find("A") != global->symbols.end(), "Symbol 'struct A' doesn't exist.");
	assert(global->symbols.find("B") != global->symbols.end(), "Symbol 'struct B' doesn't exist.");

	// Check our classes have corresponding symbols
	assert(global->symbols.find("C") != global->symbols.end(), "Symbol 'class C' doesn't exist.");
	assert(global->symbols.find("D") != global->symbols.end(), "Symbol 'class D' doesn't exist.");
	assert(global->symbols.find("E") != global->symbols.end(), "Symbol 'class E' doesn't exist.");

	// Check no extra bogus symbols exist
	assert_equal(global->symbols.size(), 5);

	// Check we have a type defined for each struct and class
	assert_equal(global->types.size(), 5);
}
