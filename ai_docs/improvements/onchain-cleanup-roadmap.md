# Onchain Cleanup Roadmap (Docs Only)

## Phase 0: Documentation Alignment
- Publish redundancy audit.
- Publish infra bootstrapping runbook.
- Publish account model and payment flow specs.

## Phase 1: Infra-First Ownership
- Move all funding/minting to infra targets.
- Ensure address book generation is the single source of truth.
- Validate EOAs and token balances from infra outputs.

## Phase 2: App Runtime Simplification
- Remove runtime funding/minting from simulation script.
- Minimize app env schema to runtime-only fields.
- Introduce a dedicated payment handler service.

## Phase 3: Seed Data Isolation
- Move seed data into app-local fixtures.
- Allow explicit overrides without conformance coupling.

## Risks & Mitigations
- **Risk**: Breaking local developer flow.
  - **Mitigation**: Keep a single runbook, update scripts after infra changes.
- **Risk**: Drift between address book and runtime.
  - **Mitigation**: Add a validation step in bootstrap runbook.

## Validation Checklist
- Escrow + collectors deployed and address book generated.
- Operator and buyer funded by infra.
- Buyer token balance exists before simulation.
- Sample app performs authorize + capture without runtime funding.
