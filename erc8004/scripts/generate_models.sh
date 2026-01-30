#!/bin/bash
quicktype \
  --lang typescript-zod \
  --src-lang schema \
  --src ./spec/schemas/agent-uri.schema.json \
  -o ./generated/agent-uri.zod.ts
