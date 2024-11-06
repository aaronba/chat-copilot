[EXTERNAL] IAuthInfo.cs
Barth, Aaron L. (Dell Federal Systems L.p.)<Aaron.Barth@va.gov>
​
Aaron Barth
​
﻿// Copyright (c) Microsoft. All rights reserved.

 

namespace CopilotChat.WebApi.Auth;

 

public interface IAuthInfo

{

    /// <summary>

    /// The authenticated user's unique ID.

    /// </summary>

    public string UserId { get; }

 

    /// <summary>

    /// The authenticated user's name.

    /// </summary>

    public string Name { get; }

 

    /// <summary>

    /// The authenticated user's email.

    /// </summary>

    public string Email { get; }

}
