# Product Context: Setup Crowdin CLI GitHub Action

## Why This Project Exists

Crowdin is a localization and translation management platform that helps teams localize their products. The Crowdin CLI is a command-line tool that allows users to interact with the Crowdin API, manage translation files, and automate localization workflows.

This project exists to solve several problems:

1. **Simplifying Crowdin CLI Installation**: Currently, users need to manually install the Crowdin CLI or create custom scripts to download and set it up in their CI/CD pipelines.

2. **Ensuring Cross-Platform Compatibility**: The Crowdin CLI is a Java application, which requires a Java runtime environment. By providing native executables, we eliminate this dependency.

3. **Versioning and Reproducibility**: By providing specific versions of the CLI, we ensure that workflows are reproducible and not affected by unexpected changes.

4. **GitHub Actions Integration**: Making it easy to use Crowdin CLI in GitHub Actions workflows, which is a popular CI/CD platform.

## Problems It Solves

1. **Installation Complexity**: Eliminates the need for custom scripts to download and install the Crowdin CLI.

2. **Java Dependency**: Removes the requirement for Java runtime by providing native executables.

3. **Version Management**: Allows users to specify which version of the CLI they want to use, ensuring consistency.

4. **CI/CD Integration**: Simplifies the integration of Crowdin localization workflows into CI/CD pipelines.

5. **Caching**: Utilizes GitHub's tool cache to avoid redundant downloads, improving workflow efficiency.

## How It Works

From a user's perspective, the action should be simple to use:

```yaml
steps:
  - name: Setup Crowdin CLI
    uses: IlyaGulya/setup-crowdin-cli@v1
    with:
      version: '3.7.1'  # Optional, defaults to latest

  - name: Use Crowdin CLI
    run: crowdin upload sources
```

The action:
1. Checks if the requested version is already in the tool cache
2. If not, downloads it from the GitHub releases
3. Adds it to the tool cache
4. Adds it to the PATH
5. Makes it executable

The periodic build workflow:
1. Checks for new versions of the Crowdin CLI
2. Builds native executables for different platforms using GraalVM
3. Creates GitHub releases with these executables

## User Experience Goals

1. **Simplicity**: The action should be easy to use with minimal configuration.

2. **Reliability**: The action should work consistently across different environments.

3. **Performance**: The action should be fast, utilizing caching to avoid redundant downloads.

4. **Flexibility**: Users should be able to specify which version of the CLI they want to use.

5. **Transparency**: Users should be informed about what the action is doing, especially if there are issues or fallbacks.

6. **Documentation**: Clear documentation on how to use the action and what it does. 