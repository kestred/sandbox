#include <stdio.h> // FILE, popen, pclose, fgets, feof
#include <sys/stat.h>  // stat
#include "cpp.h"
#include "strutils.h"
using namespace std;


File::File(const string & filename) : File(filename, FTInternal) {}
File::File(const string & filename, FileType ft) : name(filename), type(ft) {}

Location::Location(File * f) : file(f),
	first_line(0), first_column(0),
	last_line(0), last_column(0) {}

Location Location::copy()
{
	Location l(file);
	l.comment = new string(*comment);
	l.first_line = first_line;
	l.last_line = last_line;
	l.first_column = first_column;
	l.last_column = last_column;
	return l;
}

Type::Type() : definition(NULL) {}
Type::Type(set<Attribute> attribs, Location declaration) :
	definition(NULL), attributes(attribs) {
	declarations.push_back(declaration);
}

Symbol::Symbol(const std::string& name, SymbolType type, Scope* scope) :
	name(name), scope(scope), type(type) {}

Scope::Scope(Scope* parent) : parent(parent), symbols(), types(), variables() {}
Scope::Scope() : Scope(NULL) {}

Macro::Macro(const string & name) : Macro(name, Location()) {}
Macro::Macro(const string & name, Location loc) : Macro(name, "", loc) {}
Macro::Macro(const string & name, const string & text, Location loc) :
	identifier(name), replace_text(text), definition(loc), is_function(false) {}

static vector<string> include_dirs;
static vector<Macro> compiler_defines;
static string version;
static string target;

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

static void get_gcc_env() {
	if(target.empty()) {
		target = trim(exec("gcc -v 2>&1 | grep Target | cut -f 2 --delimiter=\" \""));
	}
	if(version.empty()) {
		version = trim(exec("gcc -v 2>&1 | grep \"gcc version\" | cut -f 3 --delimiter=\" \""));
	}
}

vector<string> get_compiler_includes() {
	if(include_dirs.empty()) {
		get_gcc_env();

		string dirpath;
		struct stat st;

		dirpath = "/usr/include/c++/" + version + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/local/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/lib/gcc/" + target + "/" + version + "/include/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath += "g++-v" + version.substr(0,1) + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath += target + "/";
		stat(dirpath.c_str(), &st);
		if(S_ISDIR(st.st_mode)) {
			include_dirs.push_back(dirpath);
		}
		dirpath = "/usr/" + target + "/include/";
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

vector<Macro> get_compiler_defines() {
	if(compiler_defines.empty()) {
		get_gcc_env();

		/* Conform to ISO C and C++11 standard */
		Location treesap_builtin(new File("__treesap_builtin__"));
		compiler_defines.push_back(Macro("__STDC__", "1", treesap_builtin));
		compiler_defines.push_back(Macro("__STDC_VERSION__", "201112L", treesap_builtin));
		compiler_defines.push_back(Macro("__cplusplus", "201103L", treesap_builtin));
		compiler_defines.push_back(Macro("__x86_64__", "1", treesap_builtin));

		/* Handle GCC */
		Location gcc_builtin(new File("__gcc_builtin__"));
		compiler_defines.push_back(Macro("__GNUC__", version.substr(0,1), gcc_builtin));
		compiler_defines.push_back(Macro("__GNUC_MINOR__", version.substr(2,1), gcc_builtin));
		compiler_defines.push_back(Macro("__GNUC_PATCHLEVEL__", version.substr(4,1), gcc_builtin));
		compiler_defines.push_back(Macro("__extension__", gcc_builtin));
		compiler_defines.push_back(Macro("__EXCEPTIONS", "1", gcc_builtin));
		compiler_defines.push_back(Macro("__STDC_HOSTED__", "1", gcc_builtin));
		compiler_defines.push_back(Macro("_XOPEN_SOURCE", "700", gcc_builtin));
		compiler_defines.push_back(Macro("_POSIX_SOURCE", "1", gcc_builtin));
		compiler_defines.push_back(Macro("_POSIX_C_SOURCE", "200809L", gcc_builtin));
	}

	return compiler_defines;
}