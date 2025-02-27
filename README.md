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
      version: '3.16.0'  # Optional, defaults to latest

  - name: Use Crowdin CLI
    run: crowdin upload sources
```

## Inputs

| Name    | Description                                | Required | Default |
|---------|--------------------------------------------|----------|---------|
| version | Version of Crowdin CLI to use (e.g. 3.16.0) | No       | latest  |

## Supported Platforms

- Linux (x64, arm64)
- macOS (Intel, Apple Silicon)

Windows is not currently supported by the native binaries. If you need Windows support, please use the official Crowdin CLI action instead.

## How It Works

This action uses GitHub Container Registry to store pre-built native executables for Crowdin CLI. When you run the action, it:

1. Determines your platform and architecture
2. Downloads the appropriate binary directly from the architecture-specific container
3. Caches it using GitHub's tool cache
4. Adds it to the PATH so you can use it in subsequent steps

## Architecture-Specific Containers

The binaries are stored in architecture-specific containers with the following naming pattern:
- `ghcr.io/[owner]/crowdin-cli-linux-amd64`
- `ghcr.io/[owner]/crowdin-cli-linux-arm64`
- `ghcr.io/[owner]/crowdin-cli-macos-x86_64`
- `ghcr.io/[owner]/crowdin-cli-macos-arm64`

This approach allows the action to download only the binary needed for your specific platform, making the process faster and more efficient. If an architecture-specific container is not available, the action will fall back to the generic container.

## No Docker Dependency

Unlike many container-based actions, this action doesn't require Docker to be installed on the runner. It directly interacts with the container registry API to download the binaries, making it faster and more lightweight.

## Building Manually

You can trigger a manual build for a specific version using the GitHub Actions workflow:

1. Go to the Actions tab in this repository
2. Select the "Build and Push Crowdin CLI Binaries" workflow
3. Click "Run workflow"
4. Enter the version you want to build (e.g., "3.16.0")
5. Check "Force rebuild" if you want to rebuild an existing version
6. Click "Run workflow"

## License

This project is distributed under the MIT license.
