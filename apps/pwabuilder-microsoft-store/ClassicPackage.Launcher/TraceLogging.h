#pragma once

#include "framework.h"
#include <TraceLoggingProvider.h>  // The native TraceLogging API
#include <string>

// Forward-declare the g_hMyComponentProvider variable that you will use for tracing in this component
TRACELOGGING_DECLARE_PROVIDER(g_hMyComponentProvider);

class TraceLogging
{
public:
    TraceLogging();
    ~TraceLogging();
    void Log(const std::wstring& message);
};

