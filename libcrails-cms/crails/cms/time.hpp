#pragma once
#include <string>
#include <ctime>

std::string time_to_string(std::time_t value, const char* format = "%d-%m-%y");
std::time_t string_to_time(const std::string& value, const char* format = "%d-%m-%y");

std::string time_to_form_value(std::time_t value);
std::time_t time_from_form_value(const std::string& value);
