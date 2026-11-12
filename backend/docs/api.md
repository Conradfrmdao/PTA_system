# PTA API contract

Base URL: `/api/v1`

This document is the living integration contract. Milestone 0 establishes the response conventions and Milestone 1 adds authentication.

## Response envelope

Successful JSON responses:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "email must be an email" }]
  }
}
```

## Status codes

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Authentication is missing or expired |
| 403 | `FORBIDDEN` | The account cannot access the resource |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | The operation conflicts with existing data |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Authentication

Refresh tokens are rotated in an `httpOnly` cookie named `pta_refresh`. Access tokens are returned in JSON and sent as `Authorization: Bearer <token>`.

### `POST /auth/login`

Public. Request:

```json
{ "email": "admin@pivosoftacademy.com", "password": "PtaDemo!2026" }
```

Response data:

```json
{
  "user": {
    "id": "cm...",
    "email": "admin@pivosoftacademy.com",
    "firstName": "Academy",
    "lastName": "Admin",
    "phone": null,
    "role": "ADMIN",
    "isActive": true
  },
  "accessToken": "eyJ..."
}
```

Returns `401 UNAUTHORIZED` for invalid credentials or an inactive account.

### `POST /auth/refresh`

Public, requires the refresh cookie. Rotates the cookie and returns `{ user, accessToken }`. Returns `401 UNAUTHORIZED` for missing, revoked, expired, or invalid refresh tokens.

### `POST /auth/logout`

Revokes the current refresh token when present, clears its cookie, and returns `{ message }`.

### `GET /auth/me`

Requires a bearer access token. Returns the current public user object. Password and token data are never returned.
