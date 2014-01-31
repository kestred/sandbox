// Filename: main.cxx
#include "cpp/cpp.h"
#include "cpp/parser/parser.h"
#include <iostream>
using namespace std;

int main(int argc, const char *argv[])
{
	if(argc < 2) {
		return 1;
	}

	Module* module = run_parser(argv[1]);
	if(!module) {
		return 1;
	}

	for(auto it = module->macros.begin(); it != module->macros.end(); ++it) {
		Macro def = it->second;
		//cout << "\n Name: " << def.identifier << "\n";
		//cout << "Value:\n" << def.replace_text << "\n";
	}
}
