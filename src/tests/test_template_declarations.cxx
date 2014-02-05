// Filename: test_simple_templates.cxx
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

// And we can have template classes with default arguments
"template<typename T, typename U> struct G;\n"
"template<typename T, typename U = int> struct H;\n"
"template<typename T = float, typename U = double> struct J;\n"

// And we can have template classes with template classes as arguments and defaults
"template<typename T, typename U = A<T> > class K;\n"
"template<template<class T> class U> struct I;\n"

// And we can have template classes with non-type arguments
"template<bool> class L;\n"
"template<int i> class M;\n"

// We can also create a specialization with template arguments
"template<typename X> class G<X, X>;\n"
;

UNITTEST(test_simple_templates) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_simple_templates.src");

	Scope* global = &module->files.find(filename)->second->scope;
	// Check we have a type defined for each struct/class
	assert(global->types.find("A") != global->types.end(), "Template 'A' doesn't exist.");
	assert(global->types.find("B") != global->types.end(), "Template 'B' doesn't exist.");
	assert(global->types.find("C") != global->types.end(), "Template 'C' doesn't exist.");
	assert(global->types.find("D") != global->types.end(), "Template 'D' doesn't exist.");
	assert(global->types.find("E") != global->types.end(), "Template 'E' doesn't exist.");
	assert(global->types.find("F") != global->types.end(), "Template 'F' doesn't exist.");
	assert(global->types.find("G") != global->types.end(), "Template 'G' doesn't exist.");
	assert(global->types.find("H") != global->types.end(), "Template 'H' doesn't exist.");
	assert(global->types.find("I") != global->types.end(), "Template 'I' doesn't exist.");
	assert(global->types.find("J") != global->types.end(), "Template 'J' doesn't exist.");
	assert(global->types.find("K") != global->types.end(), "Template 'K' doesn't exist.");
	assert(global->types.find("L") != global->types.end(), "Template 'L' doesn't exist.");
	assert(global->types.find("M") != global->types.end(), "Template 'M' doesn't exist.");

	// Check no extra bogus/duplicate templates exist
	assert_equal(global->types.size(), 13);

	// Lets put those values into locals for convenience
	Type* templateA = global->types.find("A")->second;
	Type* templateB = global->types.find("B")->second;
	Type* templateC = global->types.find("C")->second;
	Type* templateD = global->types.find("D")->second;
	Type* templateE = global->types.find("E")->second;
	Type* templateF = global->types.find("F")->second;
	Type* templateG = global->types.find("G")->second;
	Type* templateH = global->types.find("H")->second;
	Type* templateI = global->types.find("I")->second;
	Type* templateJ = global->types.find("J")->second;
	Type* templateK = global->types.find("K")->second;
	Type* templateL = global->types.find("L")->second;
	Type* templateM = global->types.find("M")->second;

	// Check the types are templates
	assert_equal(templateA->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateB->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateC->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateD->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateE->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateF->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateG->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateH->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateI->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateJ->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateK->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateL->subtype, TEMPLATE_SUBTYPE);
	assert_equal(templateM->subtype, TEMPLATE_SUBTYPE);

	// Check the template scopes are a children of the global scope
	assert_equal(templateA->scope->parent, global);
	assert_equal(templateB->scope->parent, global);
	assert_equal(templateC->scope->parent, global);
	assert_equal(templateD->scope->parent, global);
	assert_equal(templateE->scope->parent, global);
	assert_equal(templateF->scope->parent, global);
	assert_equal(templateG->scope->parent, global);
	assert_equal(templateH->scope->parent, global);
	assert_equal(templateI->scope->parent, global);
	assert_equal(templateJ->scope->parent, global);
	assert_equal(templateK->scope->parent, global);
	assert_equal(templateL->scope->parent, global);
	assert_equal(templateM->scope->parent, global);

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
