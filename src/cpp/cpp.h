// Filename: cpp.h
#pragma once
#include <type_traits>

#include <list>   // list
#include <vector> // vector
#include <string> // string
#include <map>    // map
#include <set>    // set

using std::string;
using std::vector;
using std::list;
using std::map;
using std::set;
using std::pair;

//Forward Declarations
struct File;
struct Macro;
struct Symbol;
struct Type;
struct Variable;
struct Namespace;

/* Utility Functions */
vector<string> get_compiler_includes();
vector<Macro> get_compiler_defines();


/* Type Definitions */
// A Module is an upper level representation of the state of parsed symbols.
//     Typically there will be a single Module, representing the global space.
struct Module {
	map<string, File*> files;
	map<string, Macro> macros;
};

struct Location {
	Location() = default;
	Location(File*);
	Location copy();

	File* file;
	string* comment;
	int first_line, first_column;
	int last_line, last_column;
};
static_assert(std::is_trivial<Location>::value,
	"Location is used by GLR parser, so it must be trivial.");

struct Macro {
	Macro(const string & identifier);
	Macro(const string & identifier, Location);
	Macro(const string & name, const string & text, Location);

	string identifier;
	string replace_text;
	Location definition;

	bool is_function;
	vector<string> args;
};

enum ScopeType {
	ANONYMOUS_SCOPE,
	NAMESPACE_SCOPE,
	FILE_SCOPE
};

struct Scope {
	Scope(ScopeType type = ANONYMOUS_SCOPE);
	Scope(Scope* parent, ScopeType type);
	~Scope();

	ScopeType type;
	Scope* parent;

	map<string, Symbol> symbols;

	map<string, Type> types;
	map<string, Variable> variables;
	map<string, Scope*> namespaces;
};

struct File {
	File(const string& filename);
	File(const string& filename, bool internal);

	string name;
	list<string> comments;

	Scope scope;
	bool is_internal;

};

enum SymbolType {
	TYPENAME_SYMBOL,
	VARIABLE_SYMBOL,
	NAMESPACE_SYMBOL
};

struct Symbol {
	Symbol(const string& name, SymbolType type);
	operator string();

	string name;
	SymbolType type;
};

enum Subtype {
	ENUM_SUBTYPE,
	CLASS_SUBTYPE,
	TEMPLATE_SUBTYPE,
	INVALID_SUBTYPE
};

struct Type {
	Type();
	Type(Subtype, Location declaration);

	Subtype subtype;
	Location definition;
	list<Location> declarations;

	bool is_defined;
};

struct Variable {
	Variable();
	Variable(Type* type);

	Type* type;
	string value;
};

struct Class {
	string name;

	Type* type;
	list<Class*> parents;

};
