// Filename: prelexer.h
#pragma once
#include <string> // std::string

// Foward declarations
struct Module;

void init_prelexer(Module *, const std::string & input);
int ppr_yylex(void);
void ppr_yyerror(const char *msg);
void ppr_yywarning(const char *msg);
int ppr_yyerrors(void);
int ppr_yywarnings(void);
