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

/* Forward Declarations */
struct File;
struct Scope;

struct Type;
struct Class;
struct Template;

struct Variable;

struct Macro;


/* Utility Functions */
// get_compiler_includes returns the include directories
//     for the compiler in the order that the compiler searches them.
vector<string> get_compiler_includes();
// get_compiler_defines returns the set of defines provided
//     by the compiler, and for compliance to various standards.
vector<Macro> get_compiler_defines();
// get_internal_identifier returns an identifier formatted as "$" followed
//     by a string of identifier-characters that is guaranteed to be
//     different from other values returned for the provided scope.
string get_internal_identifier(const Scope*);


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

	File* file;
	string* comment;
	int first_line, first_column;
	int last_line, last_column;
};
static_assert(std::is_trivial<Location>::value,
	"Location is used by GLR parser, so it must be trivial.");

enum ScopeType {
	ANONYMOUS_SCOPE,
	NAMESPACE_SCOPE,
	TEMPLATE_SCOPE,
	CLASS_SCOPE,
	FILE_SCOPE
};

struct Scope {
	Scope(ScopeType type = ANONYMOUS_SCOPE);
	Scope(Scope* parent, ScopeType type);
	~Scope();

	ScopeType type;
	Scope* parent;
	list<Scope*> inherits;

	map<string, Type*> types;
	map<string, Variable*> variables;
	map<string, Scope*> namespaces;
	list<Scope*> anonymous_scopes;
};

struct File {
	File(const string& filename);
	File(const string& filename, bool internal);
	string name;

	list<string> comments;

	Scope scope;
	bool is_internal;

};

enum Subtype {
	ENUM_SUBTYPE,
	CLASS_SUBTYPE,
	TEMPLATE_SUBTYPE,
	DEFERRED_SUBTYPE,
	FUNDAMENTAL_SUBTYPE,
	INVALID_SUBTYPE
};

struct Type {
	Type();
	Type(const string& name, Subtype);
	virtual ~Type();
	string name;

	Subtype subtype;
	Scope* scope;

	Location* definition;
	list<Location> declarations;

	virtual Class* as_class();
	virtual Template* as_template();
};

struct Class : Type {
	Class();
	Class(const string& name, Scope* scope);

	list<Class*> parents;
	virtual Class* as_class();
};

struct Template : Class {
	Template();
	Template(const string& name, Scope* scope);

	map<string, Type*> defaults;
	virtual Template* as_template();
};

enum FundamentalType {
	INT_TYPE
};

struct Variable {
	Variable();
	Variable(const string& name, FundamentalType);
	Variable(const string& name, Type*);
	string name;

	Type* type;
	string value;
};

struct Macro {
	Macro(const string & identifier);
	Macro(const string & identifier, Location);
	Macro(const string & name, const string & text, Location);

	string identifier;
	string replace_text;
	Location definition;

	bool is_function;
	vector<string> args;

	bool is_variadic;
	string variadic_arg;
};
