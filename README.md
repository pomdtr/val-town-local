# Local Development for val.town

## Setup

1. Copy .env.template to .env
2. Fill in the values in .env
3. Trigger a first sync (see below)

## Usage

### Trigger a sync

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
