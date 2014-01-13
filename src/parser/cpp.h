// Filename: cpp.h
#include <string>        // std::string
#include <unordered_map> // std::unordered_map



/* Type Declarations */
struct SymbolTable;
struct Namespace;

/* Type Definitions */
struct Location {
	std::string filename;
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
};

// A Namespace is a named SymbolTable with all of its symbols being scoped
//     globally (to the namespace's own scope) as "<namespace>::<symbol-name>".
struct Namespace : SymbolTable {
	std::string name;
};

// A Module is an upper level representation of the state of parsed symbols.
//     Typically there will be a single Module, representing the global space.
struct Module {
	SymbolTable table;
};

