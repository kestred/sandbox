// Filename: test_parse.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

static const char* filename = "test_simple_templates.src";
static char file[] = "\n"
// Lets try declaring some valid templates
"template<typename T> class A;\n"
"template<typename T> struct B;\n"
"template<class T> class C;\n"
"template<class T> struct D;\n"
"template<typename> struct E;\n"
"template<class> struct F;\n"

// You can also redeclare the same template with completely different words
"template<class X> struct A;\n"

// We can specialize the templates
"template<> class A<int>;\n"

// And we can have partially specialized templates
"template<typename T, typename U> struct G;\n"
"template<typename T, typename U = int> struct H;\n"
"template<typename T = float, typename U = double> struct J;\n"

// And we can have self-refrencing partially specialized templates
"template<typename T, typename U = A<T> > class K;\n"
// template<typename T = A<U>, typename U> struct I; --- this is an invalid construction
;

UNITTEST(test_simple_classes) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_simple_templates.src");

	Scope* global = &module->files.find(filename)->second->scope;
	// Check we have a type defined for each struct/class
	assert(global->templates.find("A") != global->templates.end(), "Template 'A' doesn't exist.");
	assert(global->templates.find("B") != global->templates.end(), "Template 'B' doesn't exist.");
	assert(global->templates.find("C") != global->templates.end(), "Template 'C' doesn't exist.");
	assert(global->templates.find("D") != global->templates.end(), "Template 'D' doesn't exist.");
	assert(global->templates.find("E") != global->templates.end(), "Template 'E' doesn't exist.");
	assert(global->templates.find("F") != global->templates.end(), "Template 'F' doesn't exist.");
	assert(global->templates.find("G") != global->templates.end(), "Template 'G' doesn't exist.");
	assert(global->templates.find("H") != global->templates.end(), "Template 'H' doesn't exist.");
	assert(global->templates.find("J") != global->templates.end(), "Template 'J' doesn't exist.");
	assert(global->templates.find("K") != global->templates.end(), "Template 'K' doesn't exist.");

	// Check no extra bogus/duplicate templates exist
	assert_equal(global->templates.size(), 8);

	// Lets put those values into locals for convenience
	Template* templateA = &global->templates.find("A")->second;
	Template* templateB = &global->templates.find("B")->second;
	Template* templateC = &global->templates.find("C")->second;
	Template* templateD = &global->templates.find("D")->second;
	Template* templateE = &global->templates.find("E")->second;
	Template* templateF = &global->templates.find("F")->second;
	Template* templateG = &global->templates.find("G")->second;
	Template* templateH = &global->templates.find("H")->second;
	Template* templateJ = &global->templates.find("J")->second;
	Template* templateK = &global->templates.find("K")->second;

	// Check the template scopes are a children of the global scope
	assert_equal(templateA->scope, global);
	assert_equal(templateB->scope, global);
	assert_equal(templateC->scope, global);
	assert_equal(templateD->scope, global);
	assert_equal(templateE->scope, global);
	assert_equal(templateF->scope, global);
	assert_equal(templateG->scope, global);
	assert_equal(templateH->scope, global);
	assert_equal(templateJ->scope, global);
	assert_equal(templateK->scope, global);

	// Check our templates have the correct template arguments
	assert_equal(templateA->scope->types.size(), 1); // Named types should exist
	assert_equal(templateC->scope->types.size(), 1); // With the class keyword also
	assert_equal(templateE->scope->types.size(), 1); // And also unnamed types
	assert_equal(templateF->scope->types.size(), 1);

	assert_equal(templateG->scope->types.size(), 2);
	assert_equal(templateH->scope->types.size(), 2);
	assert_equal(templateJ->scope->types.size(), 2);
	assert_equal(templateK->scope->types.size(), 2);
}
