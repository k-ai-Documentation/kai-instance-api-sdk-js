# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run a TypeScript file directly
npx ts-node <file.ts>

# Type-check without emitting
npx tsc --noEmit
```

There is no test suite configured (`npm test` exits with an error).

## Architecture

This is a TypeScript SDK for Kai Studio (k-ai.ai), a knowledge management/AI search platform. The SDK wraps the Kai Studio REST API.

**Entry point:** `index.ts` — exports `KaiInstanceApi` (the main class) and the `State` enum.

**Instantiation pattern — two modes:**
- **SaaS:** pass `{ instanceId, apiKey }` → sets `instance-id` and `api-key` headers, base URL defaults to `https://api.kai-studio.ai/`
- **Premise:** pass `{ host, apiKey? }` → uses `host` as base URL, optional `api-key` header

`KaiInstanceApi` constructs all four module clients at init time and exposes them via accessor methods.

**Four modules** (`modules/`), all following the same pattern — constructor takes `(headers: object, baseUrl: string)`, all methods are `async` and use `axios` POST requests, returning `request.data.response`:

| Accessor | File | Purpose |
|---|---|---|
| `.auditInstance()` | `KMAudit.ts` | Conflict anomaly management |
| `.semanticGraph()` | `SemanticGraph.ts` | Knowledge graph node exploration |
| `.orchestrator()` | `Orchestrator.ts` | Indexation triggers + background task monitoring |
| `.document()` | `Document.ts` | Document listing, detail, and download |

**API convention:** Every API call is a POST to `${baseUrl}api/<module>/<endpoint>`. The response payload is always at `request.data.response`.

**Document lifecycle states** (defined as `State` enum in `index.ts`):
`PARSING_ERROR` → `INITIAL_SAVED` → `UPDATED` → `ON_CONTENT_EXTRACT` → `CONTENT_EXTRACTED` → `ON_INDEXATION` → `INDEXED`

**Key type:** `AnomalyState` enum (in `KMAudit.ts`) values: `detected`, `redetected`, `managed`, `ignored`, `disappeared`.
