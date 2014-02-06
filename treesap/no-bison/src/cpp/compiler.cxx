// Filename: compiler.cxx
#include "util/system.h"
#include "compiler.h"
#include "cpp.h"
using namespace cpp;

vector<Macro> Compiler::macros() { return _macros; }
vector<string> Compiler::search_paths() { return _paths; }

class TreesapCompiler : public Compiler {
	TreesapCompiler() {
		_file = new File("__treesap_builtin__", true);

		Location loc(_file);
		_macros.push_back(Macro("__STDC__", "1", loc));
		_macros.push_back(Macro("__STDC_VERSION__", "201112L", loc));
		_macros.push_back(Macro("__cplusplus", "201103L", loc));
		_macros.push_back(Macro("__x86_64__", "1", loc));

		string path;
		path = "/usr/local/include/";
		if(is_directory(path)) { _paths.push_back(path); }
		path = "/usr/include/";
		if(is_directory(path)) { _paths.push_back(path); }
	}
};
Compiler treesap_compiler = TreesapCompiler();

class GCCCompiler : public Compiler {
	string target;
	string version;

	GCCCompiler() {
		_file = new File("__gcc_builtin__", true);

		target = trim(exec("gcc -v 2>&1 | grep Target | cut -f 2 --delimiter=\" \""));
		version = trim(exec("gcc -v 2>&1 | grep \"gcc version\" | cut -f 3 --delimiter=\" \""));
		string major = version.substr(0,1);
		string minor = version.substr(2,1);
		string patch = version.substr(4,1);

		Location loc(_file);
		_macros.push_back(Macro("__STDC__", "1", loc));
		_macros.push_back(Macro("__STDC_VERSION__", "201112L", loc));
		_macros.push_back(Macro("__cplusplus", "201103L", loc));
		_macros.push_back(Macro("__x86_64__", "1", loc));
		_macros.push_back(Macro("__GNUC__", major, loc));
		_macros.push_back(Macro("__GNUC_MINOR__", minor, loc));
		_macros.push_back(Macro("__GNUC_PATCHLEVEL__", patch, loc));
		_macros.push_back(Macro("__extension__", loc));
		_macros.push_back(Macro("__EXCEPTIONS", "1", loc));
		_macros.push_back(Macro("__STDC_HOSTED__", "1", loc));
		_macros.push_back(Macro("_XOPEN_SOURCE", "700", loc));
		_macros.push_back(Macro("_POSIX_SOURCE", "1", loc));
		_macros.push_back(Macro("_POSIX_C_SOURCE", "200809L", loc));
		_macros.push_back(Macro("__SIZE_TYPE__", "unsigned long int", loc));
		_macros.push_back(Macro("__PTRDIFF_TYPE__", "long int", loc));

		string path;
		path = "/usr/include/c++/" + version + "/";
		if(is_directory(path)) { _paths.push_back(path); }
		path = "/usr/local/include/";
		if(is_directory(path)) { _paths.push_back(path); }
		path = "/usr/lib/gcc/" + target + "/" + version + "/include/";
		if(is_directory(path)) { _paths.push_back(path); }
		path += "g++-v" + major + "/";
		if(is_directory(path)) { _paths.push_back(path); }
		path += target + "/";
		if(is_directory(path)) { _paths.push_back(path); }
		path = "/usr/" + target + "/include/";
		if(is_directory(path)) { _paths.push_back(path); }
		path = "/usr/include/";
		if(is_directory(path)) { _paths.push_back(path); }
	}
};
Compiler gcc_compiler = GCCCompiler();
