#include <node.h>
#include <v8.h>

using namespace v8;

void init(Handle<Object> exports) { }
NODE_MODULE(binding, init)