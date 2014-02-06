// Filename: templates.h
#include <stack>

// stack_container returns a reference to the container underlying a std::stack instance
template <class T, class S, class C>
S& stack_container(stack<T, S, C>& q) {
	struct GetStack : private stack<T, S, C> {
		static S& Container(stack<T, S, C>& q) {
			return q.*&GetStack::c;
		}
	};
    return GetStack::Container(q);
}