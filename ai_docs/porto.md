Yep — Porto is a great “real” example of the modern Viem/Wagmi-ish approach, and it’s **very explicitly wired into their build pipeline**.

Here’s the **exact strategy Porto uses** (as documented in their own build/monorepo docs via DeepWiki).

---

## 1) They separate **contract compilation** from **TS type generation**

Porto has Solidity contracts under `contracts/` (Foundry projects), and TypeScript/Apps elsewhere in the repo. ([GitHub][1])

### The important part: `build:contracts` ends by generating TS bindings

Their **contract build pipeline** is:

> `prebuild` → `forge` → `postbuild` → `wagmi generate` ([DeepWiki][2])

That last step (`wagmi generate`) is where the **TypeScript artifacts/bindings** get generated from the ABIs/artifacts.

---

## 2) They use **Wagmi CLI** as the codegen engine (and even patch it)

Porto includes a `wagmi.config.ts` at repo root (so Wagmi CLI can run from the workspace root). ([GitHub][1])

They also maintain a patch for `@wagmi/cli` in `patches/`, which is a strong signal they rely on it heavily and have tuned it for their needs. ([DeepWiki][3])

---

## 3) They publish the generated contract types **internally** as a shared workspace package

Inside the monorepo, they have an internal shared package:

* `apps/~internal` (published internally as `@porto/apps`)
* It explicitly contains **“Generated contract definitions (`contracts`)”** alongside shared components/hooks/styles. ([DeepWiki][3])

So instead of every app generating/owning its own bindings, they generate once and then every app imports from the shared internal package.

This is the “clean monorepo” pattern:

* **contracts build** produces ABIs/bindings
* **`@porto/apps`** is the “distribution point” for generated contract defs to the other apps

---

## 4) They also generate **addresses** as TS exports (not just ABIs)

For local/dev (Anvil) they run a script that:

* deploys contracts,
* exports Anvil state,
* **writes addresses into a TypeScript `addresses.ts` file** for import in tests/apps. ([DeepWiki][4])

And you can see downstream code uses generated ABI constants like `exp1Abi` (so those ABIs are indeed being exported as TS values that Viem can type against). ([DeepWiki][4])

---

## 5) For the main `porto` package, they make types exportable via build + exports automation

For the core library itself, Porto:

* builds with **Zile** and emits `.d.ts` files (plus `.native.js` variants) ([DeepWiki][2])
* runs a `gen:exports` script that **generates the `exports` map** so consumers can import from many subpaths and still get correct `types` resolution ([DeepWiki][2])

So it’s not just “generate types” — it’s “generate types + generate exports so they resolve everywhere.”

---

# The Porto pattern in one sentence

**Compile contracts with Foundry → run `wagmi generate` → put generated ABIs/types in a shared internal package (`@porto/apps`) + generate TS `addresses.ts` → rely on an automated `exports` map so types are importable everywhere.** ([DeepWiki][2])

---

If you want, I can translate this into a drop-in layout for *your* repo (Foundry vs Hardhat, single package vs monorepo) that mirrors Porto’s “shared generated contracts package” approach exactly.

[1]: https://github.com/ithacaxyz/porto?utm_source=chatgpt.com "ithacaxyz/porto: Authentication & payments on the web"
[2]: https://deepwiki.com/ithacaxyz/porto/8.3-build-system "Build System | ithacaxyz/porto | DeepWiki"
[3]: https://deepwiki.com/ithacaxyz/porto/1.1-monorepo-structure "Monorepo Structure | ithacaxyz/porto | DeepWiki"
[4]: https://deepwiki.com/ithacaxyz/porto/7-smart-contracts "Smart Contracts | ithacaxyz/porto | DeepWiki"
