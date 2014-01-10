// Filename: main.cxx
#include "parser/parser.hxx"

int main(int argc, const char *argv[])
{
	if(argc > 1) {
		return run_parser(argv[1]);
	} else {
		return 1;
	}
}
