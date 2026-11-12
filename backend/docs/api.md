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
