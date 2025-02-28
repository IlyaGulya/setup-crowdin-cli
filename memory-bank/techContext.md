# Technical Context: Setup Crowdin CLI GitHub Action

## Technologies Used

### Core Technologies
- **GitHub Actions**: For creating the action
- **JavaScript**: For implementing the action
- **Node.js**: Runtime for the action
- **Crowdin CLI**: The tool we're setting up

### GitHub-Specific Technologies
- **GitHub Actions Tool Cache**: For storing and retrieving the CLI
- **GitHub Releases API**: For retrieving release information
- **Octokit**: For interacting with GitHub API

### Development Tools
- **@actions/core**: Core functions for GitHub Actions
- **@actions/tool-cache**: For caching and retrieving tools
- **@actions/github**: For interacting with GitHub API (Octokit)
- **@actions/io**: For file system operations
- **@actions/exec**: For executing commands
- **Jest**: For testing the action

## Development Setup
- Node.js environment for action development
- GitHub repository for hosting the action
- GitHub workflow for testing and releasing

## Technical Constraints
- Must follow GitHub Actions security best practices
- Should handle different operating systems (Linux, macOS)
- Should handle different architectures (x86_64, arm64)
- Must properly utilize GitHub's tool cache
- Should be efficient with GitHub Actions minutes
- Must support only Crowdin CLI versions 4.4.0 and above

## Supported Platforms
- **Linux (x86_64)**: Standard Linux on Intel/AMD 64-bit architecture
- **Linux (arm64)**: Linux on ARM 64-bit architecture (e.g., AWS Graviton)
- **macOS (x86_64)**: macOS on Intel 64-bit architecture
- **macOS (arm64)**: macOS on Apple Silicon (M1/M2/M3) architecture
- **Windows is not supported** due to compatibility issues with the native executables

## Dependencies
- GitHub Actions runtime environment
- GitHub Releases for retrieving binaries
- Standalone repository for Crowdin CLI binaries

## Action Workflow
1. **Get Requested Version**:
   - Get the version specified by the user (or latest)
   - Check if the version meets the minimum requirement (4.4.0)
   - Handle errors and provide clear messages

2. **Determine Platform and Architecture**:
   - Automatically detect the runner's platform and architecture
   - Support explicit platform selection via parameter
   - Fall back to auto-detection if no platform is specified

3. **Check Tool Cache**:
   - Check if the requested version is already cached
   - Verify cached executables before using them
   - Re-download if validation fails

4. **Download Binary**:
   - If not in cache, download the appropriate binary from the standalone repository
   - Handle download errors and provide clear messages
   - Verify the downloaded binary

5. **Setup Binary**:
   - Add the binary to the tool cache
   - Add it to the PATH
   - Make it executable
   - Verify the installation

## GitHub API Integration

The project uses Octokit for GitHub API interactions:

1. **Version Checking**:
   - Using Octokit to get the latest release
   - Handling errors to determine if a release exists
   - Using try/catch blocks for better error handling
   - Enforcing minimum version requirement of Crowdin CLI 4.4.0

2. **Benefits**:
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
