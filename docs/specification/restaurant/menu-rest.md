<!--
  Copyright 2026 UCP Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Menu Capability - REST Binding

This document specifies the HTTP/REST binding for the
[Menu Capability](menu.md).

## Protocol Fundamentals

### Discovery

Businesses advertise REST transport availability through their UCP profile at
`/.well-known/ucp`.

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "xyz.localprotocol.restaurant": {
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/overview",
        "rest": {
          "schema": "https://localprotocol.xyz/services/restaurant/rest.openapi.json",
          "endpoint": "https://business.example.com/ucp"
        }
      }
    },
    "capabilities": [
      {
        "name": "xyz.localprotocol.restaurant.menu",
        "version": "2026-01-11",
        "spec": "https://localprotocol.xyz/specification/restaurant/menu",
        "schema": "https://localprotocol.xyz/schemas/restaurant/menu.json"
      }
    ]
  }
}
```

## Endpoints

| Endpoint | Method | Operation | Description |
| :--- | :--- | :--- | :--- |
| `/menus` | GET | [Get Menus](menu.md#get-menus) | Get normalized menu data. |

### `GET /menus`

Maps to the [Get Menus](menu.md#get-menus) operation.

{{ method_fields('get_menus', 'rest.openapi.json', 'menu-rest') }}
