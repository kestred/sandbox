// Filename: main.cxx
#include "parser/cpp.h"
#include "parser/parser.h"
#include <iostream>

int main(int argc, const char *argv[])
{
	if(argc < 1) {
		return 1;
	}

	Module* m = run_parser(argv[1]);
	if(!m) {
		return 1;
	}

	for(auto it = m->defines.begin(); it != m->defines.end(); ++it) {
		Define def = it->second;
		std::cout << "\n Name: " << def.identifier << "\n";
		std::cout << "Value:\n" << def.replace_text << "\n";
	}
}
