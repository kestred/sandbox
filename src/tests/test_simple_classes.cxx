// Filename: test_simple_struct.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

static const char* filename = "test_simple_classes.src";
static char file[] = 
// Lets try declaring a struct
"struct A;"

// Now lets define an empty struct
"struct B {};"

// Lets try with classes
"class C;"
"class D {};"

// Now lets first declare a class, then define it later
"class E;"
"class E {};"
;

UNITTEST(test_simple_classes) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_simple_classes.src");

	Scope* global = &module->files.find(filename)->second->scope;
	// Check our structs have corresponding symbols
	assert(global->symbols.find("A") != global->symbols.end(), "Symbol 'struct A' doesn't exist.");
	assert(global->symbols.find("B") != global->symbols.end(), "Symbol 'struct B' doesn't exist.");

	// Check our classes have corresponding symbols
	assert(global->symbols.find("C") != global->symbols.end(), "Symbol 'class C' doesn't exist.");
	assert(global->symbols.find("D") != global->symbols.end(), "Symbol 'class D' doesn't exist.");
	assert(global->symbols.find("E") != global->symbols.end(), "Symbol 'class E' doesn't exist.");

	// Check no extra bogus symbols exist
	assert_equal(global->symbols.size(), 5);

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
