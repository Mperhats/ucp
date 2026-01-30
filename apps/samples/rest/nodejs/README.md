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

# UCP Node.js Server Reference Implementation

This directory contains a reference implementation of a Universal Commerce
Protocol (UCP) server built with Node.js, Hono and Zod. It demonstrates how to
implement the UCP specifications for shopping, checkout, and order management.

## Prerequisites

*   Node.js (v20 or higher recommended)
*   pnpm

## Setup

1.  **Use this repo**

    From the UCP monorepo root:

    ```shell
    cd apps/samples/rest/nodejs
    ```

2.  **Install Dependencies**

    Run the following command in this directory to install the required Node.js
    packages:

    ```bash
    pnpm install
    ```

3.  **Database Setup**

    The server uses SQLite for persistence. Ensure the `databases` directory
    exists. The server will automatically initialize the database files
    (`products.db` and `transactions.db`) and tables on the first run.

    If the `databases` directory does not exist, create it:

    ```bash
    mkdir -p databases
    ```

    **Note:** For the server to function fully (e.g., to create a checkout), you
    may need to populate `products.db` with sample product data, as the server
    expects products to exist for validation.

## Running the Server

To start the server in development mode (with hot reloading):

```bash
pnpm run dev
```

To build and start the server for production:

```bash
pnpm run build
pnpm start
```

The server will start on port **3000** by default. You can access the discovery
endpoint at:

```
http://localhost:3000/.well-known/ucp
```

## Running Conformance Tests

To verify that this server implementation complies with the UCP specifications,
use the in-repo conformance package.

1.  **Run the sample server** (from repo root):

    ```bash
    make run-samples-server
    ```

2.  **Run conformance** (from repo root):

    ```bash
    make test-conformance
    ```

This uses `packages/conformance` and targets the local sample server on
`http://localhost:3000`.

## Project Structure

*   `src/api`: Contains the implementation of UCP services (Discovery, Checkout,
    Order).
*   `src/data`: Database access layer (SQLite).
*   `src/models`: TypeScript types and Zod schemas (some generated from specs).
*   `src/utils`: Helper utilities for validation and logging.
*   `databases`: Directory where SQLite database files are stored.
