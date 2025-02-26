# Technical Context: Setup Crowdin CLI GitHub Action

## Technologies Used

### Core Technologies
- **GitHub Actions**: For creating the workflow and action
- **JavaScript**: For implementing the action
- **Node.js**: Runtime for the action
- **GraalVM**: For creating native executables from Java applications
- **Crowdin CLI**: The tool we're packaging and distributing

### GitHub-Specific Technologies
- **GitHub Releases API**: For creating releases with assets
- **GitHub Actions Tool Cache**: For storing and retrieving the CLI
- **GitHub Workflow Scheduler**: For periodic checking of updates
- **GitHub Actions Matrix**: For defining build configurations
- **GitHub Actions Artifacts**: For passing files between jobs
- **GitHub Actions Concurrency**: For preventing workflow conflicts

### Development Tools
- **@actions/core**: Core functions for GitHub Actions
- **@actions/tool-cache**: For caching and retrieving tools
- **@actions/github**: For interacting with GitHub API
- **@vercel/ncc**: For compiling Node.js modules into a single file
- **Jest**: For testing the action

## Development Setup
- Node.js environment for action development
- GitHub repository for hosting the action
- GitHub workflow for testing and releasing

## Technical Constraints
- Must follow GitHub Actions security best practices
- Should handle different operating systems (Linux, macOS, Windows)
- Must properly utilize GitHub's tool cache
- Should be efficient with GitHub Actions minutes
- Should handle matrix job failures gracefully

## Dependencies
- Crowdin CLI (https://github.com/crowdin/crowdin-cli)
- GraalVM for native image compilation
- GitHub Actions runtime environment

## Build Process
1. **Action Development**:
   - Write JavaScript code using Node.js and GitHub Actions libraries
   - Use @actions/core for core GitHub Actions functionality
   - Use @actions/tool-cache for caching and retrieving tools
   - Use @actions/github for interacting with GitHub API

2. **Action Compilation**:
   - Use @vercel/ncc to compile the action code into a single file
   - This eliminates the need for node_modules in the repository
   - Makes the action more portable and easier to distribute

3. **Native Executable Building**:
   - Check for new Crowdin CLI versions
   - Download the JAR file from the official repository
   - Use GraalVM to compile the Java application into native executables
   - Build for multiple platforms using a matrix strategy:
     - Linux (amd64)
     - macOS (x64)
     - macOS (arm64)
     - Windows (amd64)
   - Create checksums for verification
   - Upload artifacts between jobs
   - Package and release through GitHub Releases 