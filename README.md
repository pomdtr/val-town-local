# Edit vals locally

## Requirements

- [deno](https://deno.com)

## Setup

1. Download this repository
2. Set the VALTOWN_TOKEN environment variable.
   1. You can generate an API token [here](https://www.val.town/settings/api).
   2. The script will automatically load the token from a .env file in the root directory.
3. Trigger a first sync: `deno task sync`

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
