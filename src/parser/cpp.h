// Filename: cpp.h
#include <string>        // std::string
#include <vector>        // std::vector
#include <unordered_map> // std::unordered_map

//Forward Declarations
struct Macro;
struct Namespace;


/* Utility Functions */
std::vector<std::string> get_compiler_includes();
std::vector<Macro> get_compiler_defines();


/* Type Definitions */
enum FileType {
	FTInput, // Files that are given as an input source
	FTInternal, // Files defined internally, typically for compiler-specific behavior
};

struct File {
	File(const std::string& filename);
	File(const std::string& filename, FileType);

	FileType type;
	std::string name;
};

struct Location {
	Location();
	Location(File*);

	File* file;
	int first_line, first_column;
	int last_line, last_column;
};

enum Scope {
};

enum SymbolType {
	STScope
};

struct Symbol {
	std::string name;
	SymbolType type;
	Scope scope;
};

// A SymbolTable holds references to a set of symbols by name.
//     The parser also keeps a SymbolTable around while parsing.
struct SymbolTable {
	std::unordered_map<std::string, Symbol> symbols;
	std::unordered_map<std::string, Namespace*> namespaces;
};

// A Namespace is a named SymbolTable with all of its symbols being scoped
//     globally (to the namespace's own scope) as "<namespace>::<symbol-name>".
struct Namespace : SymbolTable {
	std::string name;
};

struct Macro {
	std::string identifier;
	std::string replace_text;
	Location location;

	bool is_function;
	std::vector<std::string> args;
};

// A Module is an upper level representation of the state of parsed symbols.
//     Typically there will be a single Module, representing the global space.
struct Module {
	SymbolTable table;
	std::unordered_map<std::string, File*> files;
	std::unordered_map<std::string, Macro> macros;
};

