# Setup Crowdin CLI

This GitHub Action sets up [Crowdin CLI](https://github.com/crowdin/crowdin-cli) in your GitHub Actions workflow by:

1. Downloading the requested version (or latest) of Crowdin CLI as a native executable
2. Adding it to the GitHub Actions tool cache
3. Adding it to the PATH

The executables are native, so they start fast and do not require Java.

## Where binaries come from

Crowdin CLI 5.0.0 was rewritten from Java to TypeScript and upstream started
publishing native binaries itself, so the action picks its source by version:

| Requested version | Source                              |
|-------------------|-------------------------------------|
| `latest`          | `crowdin/crowdin-cli` (official)    |
| `>= 5.0.0`        | `crowdin/crowdin-cli` (official)    |
| `4.4.0` - `4.15.1`| `ilyagulya/crowdin-cli-standalone`  |

Upstream never shipped native builds for 4.x, so those versions keep resolving
to the standalone repository, where they are compiled with GraalVM.

Note that 5.x contains breaking changes: `upload sources` / `upload translations`
are now a single `crowdin upload`, `download sources` is gone, and `--debug` was
removed. Pin a `4.x` version if you are not ready to migrate.

## Usage

```yaml
steps:
  - name: Setup Crowdin CLI
    uses: IlyaGulya/setup-crowdin-cli@v2
    with:
      version: '5.0.1'  # Optional, defaults to latest
      # github_token is optional - if not provided, the default GITHUB_TOKEN will be used

  # Or with explicit token:
  - name: Setup Crowdin CLI with explicit token
    uses: IlyaGulya/setup-crowdin-cli@v2
    with:
      version: '5.0.1'  # Optional, defaults to latest
      github_token: ${{ secrets.GITHUB_TOKEN }}

  - name: Use Crowdin CLI
    run: crowdin upload
```

## Inputs

| Name         | Description                                                                              | Required | Default      |
|--------------|------------------------------------------------------------------------------------------|----------|--------------|
| version      | Version of Crowdin CLI to use (e.g. 5.0.1), or `latest`. Versions 4.4.0 and above are supported. | No       | latest       |
| github_token | GitHub token for API access to fetch binary release information.                         | No       | GITHUB_TOKEN |

## Supported Platforms

- Linux (x86_64, arm64)
- macOS (Intel, Apple Silicon)
- Windows (x86_64)

## How It Works

This action downloads pre-built native executables for Crowdin CLI directly from GitHub releases. When you run the action, it:

1. Determines your platform and architecture
2. Downloads the appropriate binary for your platform from GitHub releases
3. Caches it using GitHub's tool cache
4. Adds it to the PATH so you can use it in subsequent steps

The action automatically selects the correct binary for your runner's operating system and architecture, making it simple to use across different
environments.

## Building Manually

Only relevant for `4.x`, which is built in
[ilyagulya/crowdin-cli-standalone](https://github.com/ilyagulya/crowdin-cli-standalone).
Releases `5.0.0` and above are published by Crowdin, so nothing needs building here.

## License

This project is distributed under the MIT license.
