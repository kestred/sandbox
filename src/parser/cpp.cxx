#include <stdio.h> // FILE, popen, pclose, fgets, feof
#include <sys/stat.h>  // stat
#include "cpp.h"
using namespace std;


File::File(const string& filename) : File(filename, FTInternal) {}
File::File(const string& filename, FileType ft) : name(filename), type(ft) {}

Location::Location() : Location(NULL) {}
Location::Location(File* f) : file(f),
	first_line(0), first_column(0),
	last_line(0), last_column(0) {}


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
		target = exec("gcc -v 2>&1 | grep Target | cut -f 2 --delimiter=\" \"");
	}
	if(version.empty()) {
		version = exec("gcc -v 2>&1 | grep \"gcc version\" | cut -f 3 --delimiter=\" \"");
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
		dirpath = "/usr/lib/gcc/" + target + "/" + version + "/include/g++-v" + version[0] + "/";
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

		Macro def;
		def.location = Location(new File("__gcc_builtin__"));

		def.identifier = "__GNUC__";
		def.replace_text = version[0];
		compiler_defines.push_back(def);

		def.identifier = "__GNUC_MINOR__";
		def.replace_text = version[2];
		compiler_defines.push_back(def);

		def.identifier = "__GNUC_PATCHLEVEL__";
		def.replace_text = version[4];
		compiler_defines.push_back(def);

		def.identifier = "__cplusplus";
		def.replace_text = "";
		compiler_defines.push_back(def);
	}

	return compiler_defines;
}