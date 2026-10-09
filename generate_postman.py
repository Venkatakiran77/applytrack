import json
from pathlib import Path

BASE_URL = "{{baseUrl}}"


def request(name, method, path, body=None, auth=True, script=None):
    url = BASE_URL + path
    item = {
        "name": name,
        "request": {
            "method": method,
            "header": [],
            "url": url,
        },
    }

    if auth:
        item["request"]["auth"] = {"type": "inherit"}
    else:
        item["request"]["auth"] = {"type": "noauth"}

    if body is not None:
        item["request"]["header"].append(
            {"key": "Content-Type", "value": "application/json"}
        )
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2),
            "options": {"raw": {"language": "json"}},
        }

    if script:
        item["event"] = [
            {
                "listen": "test",
                "script": {"type": "text/javascript", "exec": script.splitlines()},
            }
        ]

    return item


def folder(name, items):
    return {"name": name, "item": items}


login = request(
    "Login",
    "POST",
    "/api/auth/login",
    {"email": "your-email@example.com", "password": "YOUR_PASSWORD"},
    auth=False,
    script=[
        "const response = pm.response.json();",
        "if (pm.response.code >= 200 && pm.response.code < 300 && response.token) {",
        '    pm.collectionVariables.set("token", response.token);',
        '    console.log("JWT token saved to collection variables");',
        "} else {",
        '    console.log("Login failed or token field is missing");',
        "}",
    ][
        0
    ],  # replaced below with the complete script
)

login["event"][0]["script"]["exec"] = [
    "const response = pm.response.json();",
    "if (pm.response.code >= 200 && pm.response.code < 300 && response.token) {",
    '    pm.collectionVariables.set("token", response.token);',
    '    console.log("JWT token saved to collection variables");',
    "} else {",
    '    console.log("Login failed or token field is missing");',
    "}",
]

collection = {
    "info": {
        "name": "ApplyTrack API",
        "description": "Generated Postman collection for ApplyTrack",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {
        "type": "bearer",
        "bearer": [{"key": "token", "value": "{{token}}", "type": "string"}],
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:8080", "type": "string"},
        {"key": "token", "value": "", "type": "string"},
    ],
    "item": [
        folder(
            "Auth",
            [
                login,
                request(
                    "Register (adjust body to your API)",
                    "POST",
                    "/api/auth/register",
                    {
                        "name": "Test User",
                        "email": "new-user@example.com",
                        "password": "YOUR_PASSWORD",
                    },
                    auth=False,
                ),
            ],
        ),
        folder(
            "Applications",
            [
                request("Get applications", "GET", "/api/applications"),
                request(
                    "Create application",
                    "POST",
                    "/api/applications",
                    {"company": "Example Company", "position": "Software Engineer"},
                ),
                request(
                    "Update application status (adjust path if needed)",
                    "PATCH",
                    "/api/applications/1/status",
                    {"status": "APPLIED"},
                ),
                request("Delete application", "DELETE", "/api/applications/1"),
            ],
        ),
        folder("Skills", [request("Get skills (adjust route)", "GET", "/api/skills")]),
        folder(
            "Match",
            [
                request(
                    "Match application (adjust body to your API)",
                    "POST",
                    "/api/applications/1/match",
                    {
                        "jdText": "Java developer with Spring Boot and REST API experience"
                    },
                )
            ],
        ),
        folder("Dashboard", [request("Get dashboard", "GET", "/api/dashboard")]),
    ],
}

output = Path("postman/ApplyTrack.postman_collection.json")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(collection, indent=2), encoding="utf-8")

print(f"Generated: {output.resolve()}")
