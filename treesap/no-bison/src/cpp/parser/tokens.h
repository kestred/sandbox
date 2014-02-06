// Filename: tokens.h
#pragma once
#include "cpp/cpp.h"

/* Define special token values */
struct QualifiedName {
	QualifiedName() = default;
	QualifiedName(string name) : names() {
		names.push_back(name);
	}

	list<string> names;


	string to_string() const {
		string ret;
		for(auto it = names.begin(); it != names.end(); ) {
			ret += *it;
			if(++it != names.end()) {
				ret += "::";
			}
		}
		return ret;
	}
};

/* Define the token type */
union Token {
	int integer;
	bool boolean;
	char character;
	double floating;

	std::string* string;
	QualifiedName* name;

	Type* type;
	Variable* variable;

	Template* tmpl_type;
	Specialization* tmpl_spec;
	TemplateArgument tmpl_arg;
};
static_assert(std::is_trivial<Token>::value, "Token must be trivial type for GLR parser.");
#define CPPSTYPE_IS_DECLARED 1
#define CPPSTYPE Token

/* Declare external location type */
struct Location;
#define CPPLTYPE_IS_DECLARED 1
#define CPPLTYPE Location
