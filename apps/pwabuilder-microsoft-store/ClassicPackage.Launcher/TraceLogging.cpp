#include "TraceLogging.h"
#include <string>

//from https://docs.microsoft.com/en-us/windows/win32/tracelogging/tracelogging-native-quick-start

// Define the GUID to use in TraceLoggingProviderRegister 
//  {AED376BB-20D5-4C06-AB12-AB0B66F3D9F3}
TRACELOGGING_DEFINE_PROVIDER(
    g_hMyComponentProvider,
    "EdgePWALauncher",
    (0xaed376bb, 0x20d5, 0x4c06, 0xab, 0x12, 0xab, 0xb, 0x66, 0xf3, 0xd9, 0xf3));

TraceLogging::TraceLogging()
{
    // Register the provider
    TraceLoggingRegister(g_hMyComponentProvider);
}

TraceLogging::~TraceLogging()
{
    // Stop TraceLogging and unregister the provider}
    TraceLoggingUnregister(g_hMyComponentProvider);
}

void TraceLogging::Log(const std::wstring& message)
{
    TraceLoggingWrite(g_hMyComponentProvider, // handle to my provider
        "EdgePWALauncherEvent",              // Event Name that should uniquely identify your event.
        TraceLoggingValue(message.c_str(), "Event")); // Field for your event in the form of (value, field name).
}
