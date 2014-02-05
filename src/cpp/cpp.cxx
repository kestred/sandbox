#include <stdio.h> // FILE, popen, pclose, fgets, feof
#include <sys/stat.h>  // stat
#include "cpp.h"
#include "strutils.h"
using namespace std;

static File internal_file("__treesap_builtin__", true);

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
}
Class* Type::as_class() { return NULL; }
Template* Type::as_template() { return NULL; }

Class::Class() : Type() {}
Class::Class(const string& name, Scope* scope)
	: Type(name, CLASS_SUBTYPE) {
	this->scope = scope;
}
Class* Class::as_class() { return this; }

Template::Template() : Class() {}
Template::Template(const string& name, Scope* scope)
	: Class(name, scope) {
	this->subtype = TEMPLATE_SUBTYPE;
}
Template* Template::as_template() { return this; }

static map<FundamentalType, Type*> fundamental_types;
static void init_fundamental_types() {
	if(fundamental_types.empty()) {
		Type* type = new Type("int", FUNDAMENTAL_SUBTYPE);
		type->definition = new Location(&internal_file);
		type->declarations.push_back(*type->definition);
		fundamental_types[INT_TYPE] = type;
	}
}

Variable::Variable() : Variable("", NULL) {}
Variable::Variable(const string& name, FundamentalType type)
	: Variable(name, NULL) {
	init_fundamental_types();
	this->type = fundamental_types[type];
}
Variable::Variable(const string& name, Type* type)
	: name(name), type(type), value() {}

Macro::Macro(const string & name) : Macro(name, Location()) {}
Macro::Macro(const string & name, Location loc) : Macro(name, "", loc) {}
Macro::Macro(const string & name, const string & text, Location loc) :
	identifier(name), replace_text(text), definition(loc), is_function(false), is_variadic(false) {}

static string exec(string cmd) {
	FILE* pipe = popen(cmd.c_str(), "r");
	if(!pipe) { return ""; }

	char buffer[128];
	string result = "";
	while(!feof(pipe)) {
		if(fgets(buffer, 128, pipe) == NULL) {
			break;
		}

		result += buffer;
	}

	pclose(pipe);
	return result;
}

static string gcc_version;
static string gcc_target;
static void init_gcc_env() {
	if(gcc_target.empty()) {
		gcc_target = trim(exec("gcc -v 2>&1 | grep Target | cut -f 2 --delimiter=\" \""));
	}
	if(gcc_version.empty()) {
		gcc_version = trim(exec("gcc -v 2>&1 | grep \"gcc version\" | cut -f 3 --delimiter=\" \""));
	}
}

static vector<string> include_dirs;
vector<string> get_compiler_includes() {
	if(include_dirs.empty()) {
		init_gcc_env();

		string dirpath;
		struct stat st;

		dirpath = "/usr/include/c++/" + gcc_version + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/local/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/lib/gcc/" + gcc_target + "/" + gcc_version + "/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath += "g++-v" + gcc_version.substr(0,1) + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath += gcc_target + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/" + gcc_target + "/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
	}

	return include_dirs;
}

static vector<Macro> compiler_defines;
vector<Macro> get_compiler_defines() {
	if(compiler_defines.empty()) {
		init_gcc_env();

		/* Conform to ISO C and C++11 standard */
		Location treesap_builtin(&internal_file);
		compiler_defines.push_back(Macro("__STDC__", "1", treesap_builtin));
		compiler_defines.push_back(Macro("__STDC_VERSION__", "201112L", treesap_builtin));
		compiler_defines.push_back(Macro("__cplusplus", "201103L", treesap_builtin));
		compiler_defines.push_back(Macro("__x86_64__", "1", treesap_builtin));

		/* Handle GCC */
		Location gcc_builtin(new File("__gcc_builtin__", true));
		compiler_defines.push_back(Macro("__GNUC__", gcc_version.substr(0,1), gcc_builtin));
		compiler_defines.push_back(Macro("__GNUC_MINOR__", gcc_version.substr(2,1), gcc_builtin));
		compiler_defines.push_back(Macro("__GNUC_PATCHLEVEL__", gcc_version.substr(4,1), gcc_builtin));
		compiler_defines.push_back(Macro("__extension__", gcc_builtin));
		compiler_defines.push_back(Macro("__EXCEPTIONS", "1", gcc_builtin));
		compiler_defines.push_back(Macro("__STDC_HOSTED__", "1", gcc_builtin));
		compiler_defines.push_back(Macro("_XOPEN_SOURCE", "700", gcc_builtin));
		compiler_defines.push_back(Macro("_POSIX_SOURCE", "1", gcc_builtin));
		compiler_defines.push_back(Macro("_POSIX_C_SOURCE", "200809L", gcc_builtin));
		compiler_defines.push_back(Macro("__SIZE_TYPE__", "unsigned long int", gcc_builtin));
		compiler_defines.push_back(Macro("__PTRDIFF_TYPE__", "long int", gcc_builtin));
	}

	return compiler_defines;
}

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
