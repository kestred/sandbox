// Filename: compiler.h
#include <vector>
#include <string>

// Forward declarations
namespace cpp {
	struct File;
	struct Macro;
}

// Define compiler
class Compiler {
  using namespace cpp;
  public:
	  vector<Macro> macros();
	  vector<string> search_paths();
  protected:
  	File* _file;
  	vector<Macro> _macros;
  	vector<string> _paths;
};

// Available compilers
extern Compiler treesap_compiler;
extern Compiler gcc_compiler;
