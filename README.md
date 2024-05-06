# Edit vals locally

## Requirements

- [deno](https://deno.com)

## Setup

1. Download this repository: `deno run -A npm:giget@latest gh:pomdtr/val-town-local`
2. Fill-in the `VALTOWN_TOKEN` environment variable in the `.env` file.
3. Trigger a first sync: `deno task sync`

## Usage

### Triggering a 2-way sync

```sh
deno task sync
```

### Start a local server

```sh
deno task serve --port 8000 vals/<your-val>.tsx
```

### Run a val locally

```sh
deno task run vals/<your-val>.tsx
```
