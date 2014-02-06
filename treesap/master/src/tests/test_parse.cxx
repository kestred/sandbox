// Filename: test_parse.cxx
#include "testbase.h"
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"

string tb_test_name = "test_parse[";
int main(int argc, char* argv[]) {
	if(argc < 2) { return 1; }
	string filename = argv[1];
	tb_test_name += filename + "]";

	Module* module = run_parser(filename);
	assert(module != NULL, "Encountered errors while parsing " + filename);
}
