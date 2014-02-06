// Filename: prelexer.h
#pragma once
#include <string> // std::string

// Foward declarations
struct Module;

void init_prelexer(Module *, const std::string & input);
int pprlex(void);
void pprerror(const char *msg);
void pprwarning(const char *msg);
int pprerrors(void);
int pprwarnings(void);
