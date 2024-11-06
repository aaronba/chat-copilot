[EXTERNAL] AuthInfo.cs
Barth, Aaron L. (Dell Federal Systems L.p.)<Aaron.Barth@va.gov>
​
Aaron Barth
​
﻿// Copyright (c) Microsoft. All rights reserved.

 

using System;

using System.Security.Claims;

using Azure.Identity;

using Microsoft.AspNetCore.Http;

using Microsoft.Identity.Web;

 

namespace CopilotChat.WebApi.Auth;

 

/// <summary>

/// Class which provides validated security information for use in controllers.

/// </summary>

public class AuthInfo : IAuthInfo

{

    private record struct AuthData(

        string UserId,

        string UserName,

        string Email);

 

    private readonly Lazy<AuthData> _data;

 

    public AuthInfo(IHttpContextAccessor httpContextAccessor)

    {

        this._data = new Lazy<AuthData>(() =>

        {

            var user = httpContextAccessor.HttpContext?.User;

            if (user is null)

            {

                throw new InvalidOperationException("HttpContext must be present to inspect auth info.");

            }

            var userIdClaim = user.FindFirst(ClaimConstants.Oid)

                ?? user.FindFirst(ClaimConstants.ObjectId)

                ?? user.FindFirst(ClaimConstants.Sub)

                ?? user.FindFirst(ClaimConstants.NameIdentifierId);

            if (userIdClaim is null)

            {

                throw new CredentialUnavailableException("User Id was not present in the request token.");

            }

            var tenantIdClaim = user.FindFirst(ClaimConstants.Tid)

                ?? user.FindFirst(ClaimConstants.TenantId);

            var userNameClaim = user.FindFirst(ClaimConstants.Name);

            if (userNameClaim is null)

            {

                throw new CredentialUnavailableException("User name was not present in the request token.");

            }

            var userEmailClaim = user.FindFirst("ClaimTypes.Email");

            if (userEmailClaim is null)

            {

                userEmailClaim = user.FindFirst("preferred_username");

                if (userEmailClaim is null)

                {

                    throw new CredentialUnavailableException("User email was not present in the request token.");

                }

            }

            return new AuthData

            {

                UserId = (tenantIdClaim is null) ? userIdClaim.Value : string.Join(".", userIdClaim.Value, tenantIdClaim.Value),

                UserName = userNameClaim.Value,

                Email = userEmailClaim.Value,

            };

        }, isThreadSafe: false);

    }

 

    /// <summary>

    /// The authenticated user's unique ID.

    /// </summary>

    public string UserId => this._data.Value.UserId;

 

    /// <summary>

    /// The authenticated user's name.

    /// </summary>

    public string Name => this._data.Value.UserName;

 

    /// <summary>

    /// The authenticated user's email.

    /// </summary>

    public string Email => this._data.Value.Email;

}
