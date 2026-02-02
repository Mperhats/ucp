SHELL := /bin/bash
.DEFAULT_GOAL := help

-include $(CURDIR)/.env

# --- paths ---
UCP_SPEC_DIR := $(CURDIR)/spec
JS_SDK_DIR := $(CURDIR)/packages/js-sdk
PY_SDK_DIR := $(CURDIR)/packages/python-sdk
SAMPLES_DIR := $(CURDIR)/apps/samples
CONFORMANCE_DIR := $(CURDIR)/packages/conformance

# DB paths used by UCP sample server + conformance (matches upstream expectations)
UCP_TEST_DIR := /tmp/ucp_test
PRODUCTS_DB := $(UCP_TEST_DIR)/products.db
TX_DB := $(UCP_TEST_DIR)/transactions.db
ANVIL_COMPOSE_FILE := $(CURDIR)/infra/docker-compose.yml
ERC8004_DIR := $(CURDIR)/contracts/erc8004
ENV_FILE ?= $(CURDIR)/.env
ENV_TEMPLATE := $(CURDIR)/.env.template
DOCKER_ENV_FILE := --env-file "$(ENV_FILE)"
ANVIL_HOST ?= 0.0.0.0
ANVIL_PORT ?= 8545
ANVIL_DOCKER_URL ?= http://anvil:$(ANVIL_PORT)
CHAIN_ID ?= 31337
ANVIL_DEPLOYER_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

export CHAIN_ID

.PHONY: help
help:
	@echo "Targets:"
	@echo "  make init                 - init submodules (no-op for subtrees) + tooling"
	@echo "  make generate              - run all UCP spec + SDK generators"
	@echo "  make spec-conformance-sdks - spec types -> conformance -> SDKs"
	@echo "  make build-js-sdk          - build js-sdk + (re)generate models from ./spec"
	@echo "  make build-python-sdk      - build python-sdk + (re)generate models from ./spec"
	@echo "  make run-samples-server    - run UCP sample python server locally"
	@echo "  make test-conformance      - run conformance tests against sample server"
	@echo "  make anvil                 - run Anvil via docker-compose"
	@echo "  make anvil-fg              - run Anvil in the foreground"
	@echo "  make anvil-down            - stop Anvil via docker-compose"
	@echo "  make anvil-logs            - tail Anvil logs"
	@echo "  make infra-up              - boot anvil + deploy registries"
	@echo "  make infra-down            - stop infra services"
	@echo "  make infra-clean           - remove .env"
	@echo "  make env-init              - create .env from .env.template if missing"
	@echo "  make test-erc8004          - run ERC-8004 Foundry tests"
	@echo "  make deploy-identity       - deploy Identity Registry to Anvil"
	@echo "  make deploy-reputation     - deploy Reputation Registry to Anvil"
	@echo "  make deploy-validation     - deploy Validation Registry to Anvil"
	@echo "  make deploy-registries     - deploy all ERC-8004 registries"
	@echo "  make deploy-commerce-payments - deploy payments escrow to Anvil"
	@echo "  make infra-check           - build ABIs + typegen"
	@echo "  make build-contract-abis   - build contract ABIs via Foundry"
	@echo "  make generate-contracts    - generate TS ABIs/types from artifacts"
	@echo "  make indexer-db-types      - generate Kysely DB types for indexer"
	@echo "  make fmt                   - run formatting across TS + Python (if present)"
	@echo "  make test                  - run all tests (ts + conformance)"

# --- init ---
.PHONY: init
init:
	@./scripts/init_upstream.sh
	@./scripts/install_tooling.sh

# --- upstream sync (subtrees) ---
.PHONY: update-upstream
update-upstream:
	@./scripts/update_upstream.sh

# --- generators ---
.PHONY: generate
generate:
	@pnpm -C spec install
	@pnpm run generate:ts
	@./scripts/js_sdk_build.sh "$(UCP_SPEC_DIR)"
	@./scripts/python_sdk_build.sh "$(UCP_SPEC_DIR)"

.PHONY: spec-conformance-sdks
spec-conformance-sdks:
	@./scripts/spec_conformance_sdks.sh

# --- sdk builds ---
.PHONY: build-js-sdk
build-js-sdk:
	@./scripts/js_sdk_build.sh "$(UCP_SPEC_DIR)"

.PHONY: build-python-sdk
build-python-sdk:
	@./scripts/python_sdk_build.sh "$(UCP_SPEC_DIR)"

# --- run sample merchant server ---
.PHONY: run-samples-server
run-samples-server:
	@mkdir -p "$(UCP_TEST_DIR)"
	@./scripts/run_samples_server.sh "$(PRODUCTS_DB)" "$(TX_DB)"

# --- anvil (docker) ---
.PHONY: check-docker
check-docker:
	@command -v docker >/dev/null 2>&1 || { \
		echo "Docker is required for this target. Install/start Docker Desktop."; \
		exit 1; \
	}

.PHONY: env-init
env-init:
	@if [[ ! -f "$(ENV_FILE)" ]]; then \
		if [[ -f "$(ENV_TEMPLATE)" ]]; then \
			cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; \
			echo "Created $(ENV_FILE) from $(ENV_TEMPLATE)"; \
		else \
			echo "Missing $(ENV_TEMPLATE). Create it or run cp .env.template .env"; \
			exit 1; \
		fi; \
	fi

.PHONY: anvil
anvil: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" up -d anvil

.PHONY: anvil-wait
anvil-wait: check-docker env-init
	@echo "Waiting for anvil..."
	@until docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" exec -T anvil \
		cast block-number --rpc-url http://127.0.0.1:$(ANVIL_PORT) >/dev/null 2>&1; do \
		sleep 0.2; \
	done
	@echo "anvil is ready."

.PHONY: anvil-fg
anvil-fg: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" up anvil

.PHONY: anvil-down
anvil-down: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" down

.PHONY: anvil-logs
anvil-logs: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" logs -f anvil

# --- erc8004 (foundry) ---
.PHONY: test-erc8004
test-erc8004: check-docker anvil-wait
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm foundry \
	  "cd /repo/contracts/erc8004 && forge test"

.PHONY: deploy-identity
deploy-identity: check-docker env-init anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e DEPLOYER_PRIVATE_KEY="$(ANVIL_DEPLOYER_KEY)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployIdentityRegistry.s.sol:DeployIdentityRegistry \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast"

.PHONY: deploy-reputation
deploy-reputation: check-docker env-init anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	registry_address=$$(python3 -c 'import json, os, sys; \
path=os.path.join("$(ERC8004_DIR)","broadcast","identity-registry.json"); \
data=json.load(open(path)); \
value=data.get("deployment", {}).get("identityRegistry"); \
print(value) if value else (print(f"Missing identity registry address in {path}", file=sys.stderr) or sys.exit(1))'); \
	docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e DEPLOYER_PRIVATE_KEY="$(ANVIL_DEPLOYER_KEY)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployReputationRegistry.s.sol:DeployReputationRegistry \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast --sig 'run(address)' -- $$registry_address"

.PHONY: deploy-validation
deploy-validation: check-docker env-init anvil-wait
	@mkdir -p "$(ERC8004_DIR)/broadcast"
	registry_address=$$(python3 -c 'import json, os, sys; \
path=os.path.join("$(ERC8004_DIR)","broadcast","identity-registry.json"); \
data=json.load(open(path)); \
value=data.get("deployment", {}).get("identityRegistry"); \
print(value) if value else (print(f"Missing identity registry address in {path}", file=sys.stderr) or sys.exit(1))'); \
	docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" run --rm \
	  -e DEPLOYER_PRIVATE_KEY="$(ANVIL_DEPLOYER_KEY)" \
	  foundry "cd /repo/contracts/erc8004 && forge script script/DeployValidationRegistry.s.sol:DeployValidationRegistry \
	  --rpc-url $(ANVIL_DOCKER_URL) --broadcast --sig 'run(address)' -- $$registry_address"


.PHONY: deploy-commerce-payments
deploy-commerce-payments: check-docker env-init anvil-wait
	@./scripts/deploy_commerce_payments.sh \
		"$(ANVIL_COMPOSE_FILE)" \
		"$(ENV_FILE)" \
		"$(ANVIL_DOCKER_URL)" \
		"$(ANVIL_DEPLOYER_KEY)"

.PHONY: infra-check
infra-check: check-docker env-init
	@$(MAKE) build-contract-abis
	@$(MAKE) generate-contracts

.PHONY: build-contract-abis
build-contract-abis: check-docker env-init
	@bash ./scripts/build_contract_abis.sh \
		"$(ANVIL_COMPOSE_FILE)" \
		"$(ENV_FILE)"

.PHONY: generate-contracts
generate-contracts:
	@pnpm -C packages/contracts generate

.PHONY: infra-up
infra-up: env-init anvil deploy-registries deploy-commerce-payments generate-contracts

.PHONY: infra-down
infra-down: check-docker env-init
	@docker compose $(DOCKER_ENV_FILE) -f "$(ANVIL_COMPOSE_FILE)" down --remove-orphans --volumes

.PHONY: infra-clean
infra-clean:
	@rm -f "$(ENV_FILE)"

.PHONY: serve-agent-uri
serve-agent-uri:
	@mkdir -p "$(CURDIR)/apps/samples/shared"
	@echo "Serving agent-uri.json at http://localhost:3001/agent-uri.json"
	@python3 -m http.server 3001 --directory "$(CURDIR)/apps/samples/shared"

# --- conformance ---
.PHONY: test-conformance
test-conformance:
	@mkdir -p "$(UCP_TEST_DIR)"
	@./scripts/run_conformance.sh "$(PRODUCTS_DB)" "$(TX_DB)" "$(SAMPLES_DIR)" "$(CONFORMANCE_DIR)" "$(PY_SDK_DIR)"

# --- repo tests (your TS apps/packages) ---
.PHONY: test-ts
test-ts:
	@pnpm -r test

.PHONY: test
test: test-ts test-conformance

.PHONY: fmt
fmt:
	@pnpm -r lint
	@pnpm -r format
	@./scripts/python_fmt.sh
