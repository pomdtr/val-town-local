# Edit vals locally

## Requirements

- git
- deno

## Setup

1. Clone this repository: `git clone https://github.com/pomdtr/val-town-local.git`
1. Navigate to the repository: `cd val-town-local`
1. Remove the `.git` directory: `rm -rf .git`
1. Copy .env.template to .env
1. Fill-in the `VALTOWN_TOKEN` environment variable with your token
1. Trigger a first sync: `deno task sync`

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
