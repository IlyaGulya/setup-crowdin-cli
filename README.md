# Setup Crowdin CLI

This GitHub Action sets up [Crowdin CLI](https://github.com/crowdin/crowdin-cli) in your GitHub Actions workflow by:

1. Downloading the requested version (or latest) of Crowdin CLI as a native executable
2. Adding it to the GitHub Actions tool cache
3. Adding it to the PATH

The native executables are built using GraalVM, which means they start faster and don't require Java to be installed.

## Usage

```yaml
steps:
  - name: Setup Crowdin CLI
    uses: IlyaGulya/setup-crowdin-cli@v1
    with:
      version: '4.4.0'  # Optional, defaults to latest
      # github_token is optional - if not provided, the default GITHUB_TOKEN will be used

  # Or with explicit token:
  - name: Setup Crowdin CLI with explicit token
    uses: IlyaGulya/setup-crowdin-cli@v1
    with:
      version: '4.4.0'  # Optional, defaults to latest
      github_token: ${{ secrets.GITHUB_TOKEN }}

  - name: Use Crowdin CLI
    run: crowdin upload sources
```

## Inputs

| Name    | Description                                                                              | Required | Default |
|---------|------------------------------------------------------------------------------------------|----------|---------|
| version | Version of Crowdin CLI to use (e.g. 4.4.0). Only versions 4.4.0 and above are supported. | No       | latest  |
| github_token | GitHub token for API access to fetch release information. If not provided, the default GITHUB_TOKEN will be used. | No | GITHUB_TOKEN |

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

The action automatically selects the correct binary for your runner's operating system and architecture, making it simple to use across different environments.

## Building Manually

You can trigger a manual build for a specific version using the GitHub Actions workflow:

1. Go to the Actions tab in this repository
2. Select the "Build and Push Crowdin CLI Binaries" workflow
3. Click "Run workflow"
4. Enter the version you want to build (e.g., "4.4.0")
5. Check "Force rebuild" if you want to rebuild an existing version
6. Click "Run workflow"

## License

This project is distributed under the MIT license.
