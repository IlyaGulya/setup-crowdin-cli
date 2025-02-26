# Setup Crowdin CLI

This GitHub Action sets up [Crowdin CLI](https://github.com/crowdin/crowdin-cli) in your GitHub Actions workflow by:

1. Downloading the requested version (or latest) of Crowdin CLI as a native executable
2. Adding it to the GitHub Actions tool cache
3. Adding it to the PATH

It also includes a workflow that periodically checks for new Crowdin CLI versions, builds native executables using GraalVM, and creates GitHub releases with these executables.

## How It Works

This project consists of two main components:

1. **A periodic workflow** that:
   - Checks for new versions of the Crowdin CLI
   - Builds native executables for different platforms using GraalVM
   - Creates GitHub releases with these executables

2. **A GitHub Action** that:
   - Downloads the appropriate native executable for your platform
   - Caches it using GitHub's tool cache
   - Makes it available in your workflow

## Usage

```yaml
steps:
  - name: Setup Crowdin CLI
    uses: your-username/setup-crowdin-cli@v1
    with:
      version: '3.7.1'  # Optional, defaults to latest

  - name: Use Crowdin CLI
    run: crowdin upload sources
```

## Inputs

| Name    | Description                                                | Required | Default |
|---------|------------------------------------------------------------|----------|---------|
| version | Version of Crowdin CLI to use (e.g., 3.7.1)                | No       | latest  |

## Features

- **Cross-Platform Support**: Works on Linux, macOS (x64 and arm64), and Windows
- **Caching**: Uses GitHub's tool cache to avoid redundant downloads
- **Native Executables**: Uses GraalVM-built native executables for better performance and no Java dependency
- **Version Management**: Allows specifying which version to use

## Benefits

- **Simplicity**: No need to manually install Crowdin CLI
- **Performance**: Uses native executables instead of Java JAR files
- **Consistency**: Ensures the same version is used across different workflows
- **No Java Dependency**: Eliminates the need for Java runtime on the GitHub runner

## Technical Details

The native executables are built using GraalVM's native-image tool, which compiles the Java application ahead-of-time into a standalone executable. This provides several advantages:

- Faster startup time
- Lower memory usage
- No need for a Java runtime environment
- Simplified deployment

## License

MIT
