// Filename: cpp.h
#pragma once
#include <type_traits>

#include <list>   // std::list
#include <vector> // std::vector
#include <string> // std::string
#include <map>    // std::map
#include <set>    // std::set

//Forward Declarations
struct Macro;
struct Namespace;
struct Scope;


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
	Location() = default;
	Location(File*);
	Location copy();

	File* file;
	std::string* comment;
	int first_line, first_column;
	int last_line, last_column;
};
static_assert(std::is_trivial<Location>::value,
		"Location is used by GLR parser, so it must be trivial.");


typedef std::pair<std::string, std::string> Attribute;
struct Type {
	Type();
	Type(std::set<Attribute> attribs, Location declaration);

	std::set<Attribute> attributes;

	Location definition;
	std::list<Location> declarations;
};

enum SymbolType {
	SYMBOL_TYPENAME,
	SYMBOL_VARIABLE,
	SYMBOL_NAMESPACE
};

struct Symbol {
	Symbol(const std::string& name, SymbolType type, Scope* scope);

	std::string name;
	SymbolType type;
	Scope* scope;
};

struct Scope {
	Scope();
	Scope(Scope* parent);

	std::map<std::string, Symbol> symbols;

	std::map<std::string, Type> types;
	std::map<std::string, Type*> variables;

	Scope* parent;
};

struct Macro {
	Macro(const std::string & identifier);
	Macro(const std::string & identifier, Location);
	Macro(const std::string & name, const std::string & text, Location);

	std::string identifier;
	std::string replace_text;
	Location definition;

	bool is_function;
	std::vector<std::string> args;
};

// A Module is an upper level representation of the state of parsed symbols.
//     Typically there will be a single Module, representing the global space.
struct Module {
	Scope global;
	std::map<std::string, File*> files;
	std::map<std::string, Macro> macros;
};

