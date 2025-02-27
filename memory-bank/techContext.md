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
   - Test each binary on its native platform immediately after building
   - Create checksums for verification
   - Upload artifacts between jobs
   - Package and release through GitHub Releases 

4. **Binary Testing**:
   - Each binary is tested on its native platform immediately after building
   - Tests run common Crowdin CLI commands to verify functionality:
     - `download sources` - Downloads source files from Crowdin
     - `download translations` - Downloads translated files from Crowdin
     - `upload sources` - Uploads source files to Crowdin
     - `upload translations` - Uploads translated files to Crowdin
   - Uses environment variables for credentials instead of modifying config files
   - Test failures prevent the release creation
   - Provides early detection of platform-specific issues

## GraalVM Native Image Optimization

The project uses a custom approach for GraalVM native image building:

1. **Custom Reflection Configuration**:
   - Using a Java class (`CrowdinReflectionFeature.java`) that implements GraalVM's `Feature` interface
   - Provides explicit reflection configuration for classes that need it at runtime
   - Eliminates the need for agent-based configuration generation

2. **Build Process Improvements**:
   - Compile the reflection feature with the Crowdin CLI JAR in the classpath
   - Package the compiled class into a feature JAR
   - Use size optimization flag (`-Os`) for smaller binary size
   - Include necessary resources with pattern matching
   - Specify the main class explicitly for better control

3. **Benefits**:
   - More deterministic builds
   - Smaller executable size
   - Better control over what gets included in the native image
   - Faster build process by eliminating the agent configuration step 