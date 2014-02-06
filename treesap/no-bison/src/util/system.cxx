// Filename: system.cxx
#include "system.h"
#include <stdio.h>
#include <sys/stat.h>

string exec(string cmd) {
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

bool is_directory(string dir) {
	struct stat st;
	stat(dirpath.c_str(), &st);
	return S_ISDIR(st.st_mode);
}
