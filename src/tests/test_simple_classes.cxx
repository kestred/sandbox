// Filename: test_simple_struct.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

static const char* filename = "test_simple_classes.src";
static char file[] = "\n"
// Lets try declaring a struct
"struct A;\n"

// Now lets define an empty struct
"struct B {};\n"

// Lets try with classes
"class C;\n"
"class D {};\n"

// Now lets first declare a class, then define it later
"class E;\n"
"class E {};\n"
;

UNITTEST(test_simple_classes) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_simple_classes.src");

	Scope* global = &module->files.find(filename)->second->scope;
	// Check we have a type defined for each struct/class
	assert(global->types.find("A") != global->types.end(), "Type 'A' doesn't exist.");
	assert(global->types.find("B") != global->types.end(), "Type 'B' doesn't exist.");
	assert(global->types.find("C") != global->types.end(), "Type 'C' doesn't exist.");
	assert(global->types.find("D") != global->types.end(), "Type 'D' doesn't exist.");
	assert(global->types.find("E") != global->types.end(), "Type 'E' doesn't exist.");

	// Check no extra bogus types exist
	assert_equal(global->types.size(), 5);

	// Check our structs/classes have the correct subtype
	assert_equal(global->types.find("A")->second.subtype, CLASS_SUBTYPE);
	assert_equal(global->types.find("B")->second.subtype, CLASS_SUBTYPE);
	assert_equal(global->types.find("C")->second.subtype, CLASS_SUBTYPE);
	assert_equal(global->types.find("D")->second.subtype, CLASS_SUBTYPE);
	assert_equal(global->types.find("E")->second.subtype, CLASS_SUBTYPE);
}
