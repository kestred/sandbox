#include <stdio.h> // FILE, popen, pclose, fgets, feof
#include <sys/stat.h>  // stat
#include "util/strings.h"
#include "cpp.h"
using namespace std;

Type void_type("void", FUNDAMENTAL_SUBTYPE);
Type bool_type("bool", FUNDAMENTAL_SUBTYPE);
Type int_type("int", FUNDAMENTAL_SUBTYPE);
Type char_type("char", FUNDAMENTAL_SUBTYPE);
Type short_type("short", FUNDAMENTAL_SUBTYPE);
Type long_type("long", FUNDAMENTAL_SUBTYPE);
Type llong_type("llong", FUNDAMENTAL_SUBTYPE);
Type uint_type("uint", FUNDAMENTAL_SUBTYPE);
Type uchar_type("uchar", FUNDAMENTAL_SUBTYPE);
Type ushort_type("ushort", FUNDAMENTAL_SUBTYPE);
Type ulong_type("ulong", FUNDAMENTAL_SUBTYPE);
Type ullong_type("ullong", FUNDAMENTAL_SUBTYPE);
Type float_type("float", FUNDAMENTAL_SUBTYPE);
Type double_type("double", FUNDAMENTAL_SUBTYPE);
Type ldouble_type("ldouble", FUNDAMENTAL_SUBTYPE);
Type char16_type("char", FUNDAMENTAL_SUBTYPE);
Type char32_type("char", FUNDAMENTAL_SUBTYPE);
Type wchar_type("char", FUNDAMENTAL_SUBTYPE);

Location::Location(File * f)
	: file(f), comment(NULL),
	  first_line(0), first_column(0),
	  last_line(0), last_column(0) {}

Scope::Scope(Scope* parent, ScopeType type)
	: type(type), parent(parent), types(), variables(), namespaces() {}
Scope::Scope(ScopeType type) : Scope(NULL, type) {}
Scope::~Scope() {
	for(auto it = namespaces.begin(); it != namespaces.end(); ++it) {
		delete it->second;
	}
	for(auto it = variables.begin(); it != variables.end(); ++it) {
		delete it->second;
	}
	for(auto it = types.begin(); it != types.end(); ++it) {
		delete it->second;
	}

	type = ANONYMOUS_SCOPE;
	parent = NULL;
	types.clear();
	variables.clear();
	namespaces.clear();
}

File::File(const string & filename) : File(filename, false) {}
File::File(const string & filename, bool internal)
	: name(filename), scope(FILE_SCOPE), is_internal(internal) {}

Type::Type() : Type("", INVALID_SUBTYPE) {}
Type::Type(const string& name, Subtype subtype)
	: name(name), subtype(subtype), scope(NULL), definition(NULL) {}
Type::~Type() {
	delete scope;
	delete definition;
	declarations.clear();
}
Class* Type::as_class() { return NULL; }
Template* Type::as_template() { return NULL; }

Class::Class() : Type() {}
Class::Class(const string& name) : Type(name, CLASS_SUBTYPE) {
	scope = new Scope(CLASS_SCOPE);
}
Class::~Class() {
	parents.clear();
}
Class* Class::as_class() { return this; }

Template::Template() : Class() {}
Template::Template(const string& name) : Class(name) {
	subtype = TEMPLATE_SUBTYPE;
	scope->type = TEMPLATE_SCOPE;
}
Template::~Template() {
	for(auto it = variants.begin(); it != variants.end(); ++it) {
		delete *it;
	}
	variants.clear();
}
Template* Template::as_template() { return this; }

Variable::Variable() : Variable("", NULL) {}
Variable::Variable(const string& name, Type* type)
	: name(name), type(type), value() {}

Macro::Macro(const string & name) : Macro(name, Location()) {}
Macro::Macro(const string & name, Location loc) : Macro(name, "", loc) {}
Macro::Macro(const string & name, const string & text, Location loc) :
	identifier(name), replace_text(text), definition(loc), is_function(false), is_variadic(false) {}


struct LastIdentifier {
	LastIdentifier() : name("a") {}
	string name;
};
static map<const Scope*, LastIdentifier> scope_identifiers;
string get_internal_identifier(const Scope* scope) {
	LastIdentifier* prev = &scope_identifiers[scope];

	unsigned int i;
	for(i = 0; i < prev->name.length() ; ++i) {
		unsigned int n = prev->name.length() - i - 1;
		prev->name[n] += 1;
		if(prev->name[n] > 'z') {
			prev->name[n] = 'a';
		} else {
			break;
		}
	}

	if(i == prev->name.length()) {
		prev->name += 'a';
	}

	return prev->name;
}
