# Technical Context: Setup Crowdin CLI GitHub Action

## Technologies Used

### Core Technologies
- **GitHub Actions**: For creating the workflow and action
- **JavaScript**: For implementing the action
- **Node.js**: Runtime for the action
- **GraalVM**: For creating native executables from Java applications
- **Crowdin CLI**: The tool we're packaging and distributing
- **Java Bytecode Manipulation**: For removing AWT dependencies from the JAR

### GitHub-Specific Technologies
- **GitHub Releases API**: For creating releases with assets
- **GitHub Actions Tool Cache**: For storing and retrieving the CLI
- **GitHub Workflow Scheduler**: For periodic checking of updates
- **GitHub Actions Matrix**: For defining build configurations
- **GitHub Actions Artifacts**: For passing files between jobs
- **GitHub Actions Concurrency**: For preventing workflow conflicts
- **GitHub Script**: For running JavaScript code in workflows
- **Octokit**: For interacting with GitHub API

### Development Tools
- **@actions/core**: Core functions for GitHub Actions
- **@actions/tool-cache**: For caching and retrieving tools
- **@actions/github**: For interacting with GitHub API (Octokit)
- **@actions/io**: For file system operations
- **@actions/exec**: For executing commands
- **Jest**: For testing the action
- **ASM**: Java bytecode manipulation library used by the AWT stripper
- **Gradle**: Build tool for the AWT stripper

## Development Setup
- Node.js environment for action development
- GitHub repository for hosting the action
- GitHub workflow for testing and releasing
- Java development environment for the AWT stripper

## Technical Constraints
- Must follow GitHub Actions security best practices
- Should handle different operating systems (Linux, macOS)
- Should handle different architectures (x86_64/amd64, arm64)
- Must properly utilize GitHub's tool cache
- Should be efficient with GitHub Actions minutes
- Should handle matrix job failures gracefully

## Supported Platforms
- **Linux (amd64/x86_64)**: Standard Linux on Intel/AMD 64-bit architecture
- **Linux (arm64)**: Linux on ARM 64-bit architecture (e.g., AWS Graviton)
- **macOS (x86_64)**: macOS on Intel 64-bit architecture
- **macOS (arm64)**: macOS on Apple Silicon (M1/M2/M3) architecture
- **Windows is not supported** due to compatibility issues with the native executables

## Dependencies
- Crowdin CLI (https://github.com/crowdin/crowdin-cli)
- GraalVM for native image compilation
- GitHub Actions runtime environment
- GitHub Releases for storing and distributing binaries
- ASM library for Java bytecode manipulation
- Gradle for building the AWT stripper

## Build Process
1. **Action Development**:
   - Write JavaScript code using Node.js and GitHub Actions libraries
   - Use @actions/core for core GitHub Actions functionality
   - Use @actions/tool-cache for caching and retrieving tools
   - Use @actions/github for interacting with GitHub API (Octokit)
   - Add JSDoc comments for better documentation and type hinting

2. **GitHub Workflow Development**:
   - Create a workflow for building and releasing Crowdin CLI binaries
   - Use GitHub Script for version checking and other operations
   - Use `softprops/action-gh-release` for creating GitHub releases
   - Implement matrix strategy for building on different platforms

3. **Native Executable Building**:
   - Check for new Crowdin CLI versions
   - Download the JAR file from the official repository
   - Run the AWT stripper to remove AWT dependencies from the JAR
   - Use GraalVM to compile the Java application into native executables
   - Build for multiple platforms using a matrix strategy:
     - Linux (amd64)
     - Linux (arm64)
     - macOS (x64)
     - macOS (arm64)
   - Test each binary on its native platform immediately after building
   - Upload artifacts between jobs

4. **GitHub Release Creation**:
   - Create an orphan branch for each version
   - Create a `.crowdin-version` file with the version number
   - Commit and tag changes
   - Push the tag to the repository
   - Download artifacts
   - Create a GitHub release with the binaries

## GitHub API Integration

The project uses Octokit for GitHub API interactions:

1. **Version Checking**:
   - Using Octokit to check if a release exists
   - Handling 404 errors to determine if a release needs to be created
   - Using try/catch blocks for better error handling

2. **Release Creation**:
   - Using `softprops/action-gh-release` for creating GitHub releases
   - Specifying tag name, release name, body, and files
   - Controlling whether a release is marked as latest

3. **Benefits**:
   - Better type safety and error handling
   - Simplified API calls and response handling
   - More maintainable and readable code

## JSDoc Documentation

The project uses JSDoc comments for better documentation:

1. **Type Annotations**:
   - Adding type annotations for variables and function parameters
   - Specifying return types for functions
   - Using JSDoc tags like `@type`, `@param`, and `@returns`

2. **Function Documentation**:
   - Describing what each function does
   - Documenting parameters and return values
   - Providing context for complex operations

3. **Benefits**:
   - Better type hinting for development
   - Improved code readability
   - Enhanced maintainability
   - Clearer understanding of the codebase for new developers 