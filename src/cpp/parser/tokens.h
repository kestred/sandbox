// Filename: tokens.h
#pragma once
#include "cpp/cpp.h"

// Preclare token value types
struct QualifiedName;

/* Define the token type */
union Token {
	int integer;
	bool boolean;
	char character;
	double floating;
	std::string* string;
	QualifiedName* name;
	Template* template_type;
};
static_assert(std::is_trivial<Token>::value, "Token must be trivial type for GLR parser.");
#define CPPSTYPE_IS_DECLARED 1
#define CPPSTYPE Token

/* Declare external location type */
struct Location;
#define CPPLTYPE_IS_DECLARED 1
#define CPPLTYPE Location

/* Define special token values */
struct QualifiedName {
	QualifiedName() = default;
	QualifiedName(string name) : names() {
		names.push_back(name);
	}

	list<string> names;
};
