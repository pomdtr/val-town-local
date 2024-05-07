# Edit vals locally

## Requirements

- [deno](https://deno.com)

## Setup

1. Download this repository: `deno run -A npm:giget@latest gh:pomdtr/val-town-local val-town`
2. Move to the downloaded directory: `cd val-town`
3. Fill-in the `VALTOWN_TOKEN` environment variable in the `.env` file.
4. Trigger a first sync: `deno task sync`

## Usage

### Triggering a 2-way sync

```sh
deno task sync
```

### Start a local server

```sh
deno task serve --port 8000 <username>/<val>.tsx
```

### Run a val locally

```sh
deno task run <username>/<val>.tsx
```
