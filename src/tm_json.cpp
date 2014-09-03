/******************************************************************************
 * Objective: Interface between the C functions needed in Lua to the C++
 *            functions that rapidJSON uses. This acts as the actual interface
 * Author:    Kenneth Nierenhausen
 * Date:      July 11, 2014
 *****************************************************************************/
#include "tm_json.h"
#include <iostream>
#include <rapidjson/reader.h>
#include <rapidjson/writer.h>
#include <rapidjson/rapidjson.h>
#include <rapidjson/filereadstream.h>
#include <rapidjson/stringbuffer.h>

/* Used to call functions in the rapidJSON namespace */
using namespace rapidjson;

/* Converts string to input stream and feeds it to rapidJSON Parse function */
extern "C" bool tm_json_parse(tm_json_r_handler_t rh,const char* json_s) {

	// create an input stream from the stringified JSON input
	StringStream is(json_s);

	// create a defaults flags GenericReader object
	Reader reader;

	// call rapidJSON's Parser using the input stream and the given handler
	return reader.Parse(is,rh);

}

/* Creates a new Writer object and returns it to C as a void pointer */
extern "C" tm_json_w_handler_t tm_json_write_create() {

	// create the writer handler
	tm_json_w_handler_t wh;
	
	// allocate the writer and assugn in in the struct
	StringBuffer* sb = new StringBuffer();
	wh.stringBuffer = static_cast<tm_json_stringbuffer_t>(sb);

	// allocate the string buffer and assign it in the struct
	Writer<StringBuffer>* w = new Writer<StringBuffer>(*sb);
	wh.writer = static_cast<tm_json_writer_t>(w);

	// return the actual write handler containing void pointers
	return wh;
}

/* Writes out a String using rapidJSON functions */
extern "C" int tm_json_write_string(tm_json_w_handler_t wh, const char* value) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->String(value);
	return 0;
}

/* Writes out a Bool using rapidJSON functions */
extern "C" int tm_json_write_boolean (tm_json_w_handler_t wh, int value) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->Bool(value);
	return 0;
}

/* Writes out a Number using rapidJSON functions */
extern "C" int tm_json_write_number (tm_json_w_handler_t wh, double value) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->SetDoublePrecision(12);
	w->Double(value);
	return 0;
}

/* Writes out Null using rapidJSON functions */
extern "C" int tm_json_write_null (tm_json_w_handler_t wh) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->Null();
	return 0;
}

/* Writes out an object start using rapidJSON functions */
extern "C" int tm_json_write_object_start (tm_json_w_handler_t wh) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->StartObject();
	return 0;
}

/* Writes out an object end using rapidJSON functions */
extern "C" int tm_json_write_object_end (tm_json_w_handler_t wh) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->EndObject();
	return 0;
}

/* Writes out an array start using rapidJSON functions */
extern "C" int tm_json_write_array_start (tm_json_w_handler_t wh) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->StartArray();
	return 0;
}

/* Writes out an array end using rapidJSON functions */
extern "C" int tm_json_write_array_end (tm_json_w_handler_t wh) {
	Writer<StringBuffer>* w = static_cast<Writer<StringBuffer>*>(wh.writer);
	w->EndArray();
	return 0;
}

/* returns Writer<StringBuffer>::getString() */
extern "C" const char* tm_json_write_result (tm_json_w_handler_t wh) {
	StringBuffer* sb = static_cast<StringBuffer*>(wh.stringBuffer);
	return sb->GetString();
}

/* frees the writer, string buffer, and the struct holding them all */
extern "C" int tm_json_write_destroy(tm_json_w_handler_t wh) {
	delete static_cast<Writer<StringBuffer>*>(wh.writer);
	delete static_cast<StringBuffer*>(wh.stringBuffer);
	return 0;
}
