# Technical Context: Setup Crowdin CLI GitHub Action

## Technologies Used

### Core Technologies
- **GitHub Actions**: For creating the workflow and action
- **JavaScript**: For implementing the action
- **Node.js**: Runtime for the action
- **GraalVM**: For creating native executables from Java applications
- **Crowdin CLI**: The tool we're packaging and distributing
- **Docker**: For creating and storing binary containers
- **Java Bytecode Manipulation**: For removing AWT dependencies from the JAR

### GitHub-Specific Technologies
- **GitHub Releases API**: For creating releases with assets
- **GitHub Actions Tool Cache**: For storing and retrieving the CLI
- **GitHub Workflow Scheduler**: For periodic checking of updates
- **GitHub Actions Matrix**: For defining build configurations
- **GitHub Actions Artifacts**: For passing files between jobs
- **GitHub Actions Concurrency**: For preventing workflow conflicts
- **GitHub Container Registry**: For storing Docker images with binaries

### Development Tools
- **@actions/core**: Core functions for GitHub Actions
- **@actions/tool-cache**: For caching and retrieving tools
- **@actions/github**: For interacting with GitHub API
- **@vercel/ncc**: For compiling Node.js modules into a single file
- **Jest**: For testing the action
- **Docker Buildx**: For building and pushing Docker images
- **ASM**: Java bytecode manipulation library used by the AWT stripper
- **Gradle**: Build tool for the AWT stripper

## Development Setup
- Node.js environment for action development
- GitHub repository for hosting the action
- GitHub workflow for testing and releasing
- Docker for building and testing container images
- Java development environment for the AWT stripper

## Technical Constraints
- Must follow GitHub Actions security best practices
- Should handle different operating systems (Linux, macOS)
- Should handle different architectures (x86_64/amd64, arm64)
- Must properly utilize GitHub's tool cache
- Should be efficient with GitHub Actions minutes
- Should handle matrix job failures gracefully
- Should use Docker efficiently for binary storage and distribution
- Should handle AWT dependencies appropriately for headless environments

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
- Docker for container operations
- GitHub Container Registry for image storage
- ASM library for Java bytecode manipulation
- Gradle for building the AWT stripper

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
   - **Run the AWT stripper to remove AWT dependencies from the JAR**
   - Use GraalVM to compile the Java application into native executables
   - Build for multiple platforms using a matrix strategy:
     - Linux (amd64)
     - Linux (arm64)
     - macOS (x64)
     - macOS (arm64)
   - Test each binary on its native platform immediately after building
   - Create checksums for verification
   - Upload artifacts between jobs

4. **Docker Image Building**:
   - Create Docker images to store and distribute the binaries
   - Use a simple `FROM scratch` base image for minimal size
   - Store each binary in its own architecture-specific image
   - Create a version marker image for version checking
   - All images are built for linux/amd64 platform for simplicity
   - Tag images with version number and optionally "latest"
   - **Add labels to indicate that the binaries are AWT-stripped**
   - Push images to GitHub Container Registry

5. **Binary Testing**:
   - Each binary is tested on its native platform immediately after building
   - Tests run common Crowdin CLI commands to verify functionality:
     - `download sources` - Downloads source files from Crowdin
     - `download translations` - Downloads translated files from Crowdin
     - `upload sources` - Uploads source files to Crowdin
     - `upload translations` - Uploads translated files to Crowdin
   - Uses environment variables for credentials instead of modifying config files
   - Test failures prevent the release creation
   - Provides early detection of platform-specific issues
   - **Note that AWT-related commands will throw UnsupportedOperationException as expected**

6. **Action Testing**:
   - Test the action on all supported platforms using a matrix strategy
   - Test only on platforms that are actually supported:
     - Linux (amd64/x86_64)
     - Linux (arm64)
     - macOS (x86_64)
     - macOS (arm64)
   - Pass platform parameter to the action for proper binary selection
   - Verify that the action correctly installs and makes the CLI available
   - Provide platform-specific feedback in verification steps

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

## Docker Image Strategy

The project uses Docker images in a specific way for binary distribution:

1. **Architecture-Specific Images**:
   - Each binary gets its own Docker image with a specific architecture tag
   - Images are named with pattern: `ghcr.io/owner/crowdin-cli-{arch-tag}:{version}`
   - Example: `ghcr.io/owner/crowdin-cli-linux-amd64:3.7.1`
   - All images are built for linux/amd64 platform regardless of binary architecture
   - This simplifies the build process while still allowing architecture-specific binary storage
   - **Images are labeled to indicate they contain AWT-stripped binaries**

2. **Version Marker Image**:
   - A simple image without binaries used for version checking
   - Named with pattern: `ghcr.io/owner/crowdin-cli:{version}`
   - Used by the workflow to check if a version already exists
   - Simplifies version management and prevents redundant builds
   - **Labeled to indicate it represents an AWT-stripped version**

3. **Latest Tag Control**:
   - Images can optionally be tagged with "latest" in addition to version
   - Controlled through workflow input parameter or automatically for scheduled runs
   - Allows for flexible version management
   - Scheduled runs automatically mark the latest version as "latest"
   - Manual runs can optionally mark a specific version as "latest"

4. **Benefits**:
   - Simplified distribution mechanism
   - No need for GitHub Releases
   - Easy version checking
   - Flexible version management
   - Efficient binary storage and retrieval

## Platform-Specific Binary Selection

The action supports platform-specific binary selection:

1. **Implementation**:
   - Action accepts a `platform` parameter to explicitly specify which binary to use
   - If not specified, the action automatically detects the runner's platform
   - Uses a mapping of platform identifiers to Docker image tags
   - Ensures the correct binary is downloaded and used for each platform

2. **Supported Platforms**:
   - `linux-amd64`: Linux on Intel/AMD 64-bit architecture
   - `linux-arm64`: Linux on ARM 64-bit architecture
   - `macos-x86_64`: macOS on Intel 64-bit architecture
   - `macos-arm64`: macOS on Apple Silicon architecture

3. **Auto-Detection Logic**:
   - Uses the runner's OS and architecture information to determine the platform
   - Maps the detected platform to the corresponding Docker image tag
   - Falls back to a default if the detected platform is not supported

4. **Error Handling**:
   - Provides clear error messages if the specified platform is not supported
   - Falls back to auto-detection if the specified platform is invalid
   - Ensures the action works reliably across different environments

5. **Benefits**:
   - Improves reliability across different environments
   - Allows for explicit control when needed
   - Simplifies usage in most cases through auto-detection
   - Ensures the correct binary is used for each platform

## AWT Stripper Implementation

The project includes a custom Java bytecode manipulation tool to remove AWT dependencies:

1. **Purpose**:
   - Remove dependencies on Java AWT (Abstract Window Toolkit)
   - Make the native executables more suitable for headless environments
   - Reduce the size of the native executables
   - Improve compatibility with environments where AWT is not available

2. **Implementation**:
   - Uses ASM library for Java bytecode manipulation
   - Implemented as a Gradle project for easy building and execution
   - Processes the JAR file before native image building
   - Replaces AWT method calls with exceptions that provide clear error messages
   - Preserves all non-AWT functionality

3. **Integration**:
   - Integrated into the build workflow as a step before native image building
   - Takes the original JAR as input and produces a stripped JAR as output
   - The stripped JAR is then used for native image building
   - Verification step ensures the stripped JAR was created successfully

4. **Benefits**:
   - Smaller native executables
   - Better compatibility with headless environments
   - Clear error messages for unsupported operations
   - Preserves all non-AWT functionality
   - Improves the reliability of the native image building process 