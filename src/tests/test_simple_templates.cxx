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

// You can also redeclare the same template with completely different words
"template<class X> struct A;\n"

// We can specialize the templates
"template<> class A<int>\n"

// And we can have partially specialized templates
"template<typename T, typename U> struct E;\n"
"template<typename T, typename U = int> struct F;\n"
"template<typename T = float, typename U = double> struct G;\n"

// And we can have self-refrencing partially specialized templates
"template<typename T, typename U = A<T> > class F;\n"
// template<typename T = A<U>, typename U>  --- this is an invalid construction
;

UNITTEST(test_simple_classes) {
	Module* module = run_parser(filename, fmemopen(file, sizeof(file), "r"));
	assert(module != NULL, "Encountered errors while parsing test_simple_templates.src");
}
