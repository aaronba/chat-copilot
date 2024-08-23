// Copyright (c) Microsoft. All rights reserved.

namespace CopilotChat.WebApi.Attributes;


/// <summary>
/// A custom atrribute to mark a class as a native plugin
/// </summary>

[System.AttributeUsage(System.AttributeTargets.Class |
                       System.AttributeTargets.Struct)
]
public class NativePluginAttribute : System.Attribute
{



}
