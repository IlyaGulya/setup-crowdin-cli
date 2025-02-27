# System Patterns: Setup Crowdin CLI GitHub Action

## System Architecture

The project consists of two main components:

1. **Periodic Build Workflow**
   - Checks for new Crowdin CLI versions
   - Builds native executables using GraalVM
   - Creates GitHub releases with these executables
   - Uses a matrix strategy for building on different platforms
   - Supports tag-based triggers for manual version releases
   - **Optimized to download JAR directly in build jobs**
   - **Tests built binaries directly in each build job**
   - **Creates Docker images to store and distribute binaries**
   - **Uses a version marker container for version checking**
   - **Controls which versions are marked as "latest"**

2. **Setup Action**
   - Downloads the requested version of Crowdin CLI
   - Stores it in the GitHub runner's tool cache
   - Makes it available for use in workflows
   - **Extracts binaries from Docker images**

```mermaid
flowchart TD
    subgraph "Periodic Build Workflow"
        A[Check for Updates] --> B{New Version?}
        B -->|Yes| C[Build Native Executables]
        C --> E[Create Docker Images]
        E --> F[Push to Container Registry]
        B -->|No| Z[End]
    end

    subgraph "Build Native Executables"
        D1[Linux Build] --> D1a[Download JAR]
        D1a --> D1b[Build Binary]
        D1b --> D1c[Test Binary]
        D2[macOS x64 Build] --> D2a[Download JAR]
        D2a --> D2b[Build Binary]
        D2b --> D2c[Test Binary]
        D3[macOS arm64 Build] --> D3a[Download JAR]
        D3a --> D3b[Build Binary]
        D3b --> D3c[Test Binary]
        D4[Linux arm64 Build] --> D4a[Download JAR]
        D4a --> D4b[Build Binary]
        D4b --> D4c[Test Binary]
    end

    subgraph "Create Docker Images"
        E1[Create Architecture-Specific Images]
        E2[Create Version Marker Image]
        E3{Mark as Latest?}
        E3 -->|Yes| E4[Tag with Latest]
        E3 -->|No| E5[Tag with Version Only]
    end

    C --> D1
    C --> D2
    C --> D3
    C --> D4
    D1c --> E1
    D2c --> E1
    D3c --> E1
    D4c --> E1
    E1 --> E2
    E2 --> E3
    E4 --> F
    E5 --> F

    subgraph "Setup Action"
        G[Get Requested Version] --> H{In Cache?}
        H -->|Yes| I[Use Cached Version]
        H -->|No| J[Download from Container Registry]
        J --> K[Extract Binary]
        K --> L[Store in Tool Cache]
        I --> M[Add to PATH]
        L --> M
    end
```

## Key Technical Decisions

1. **Native Executables vs. JAR Files**
   - Using GraalVM to create native executables for better performance and simpler usage
   - Eliminates the need for Java runtime on the GitHub runner

2. **Docker Images as Distribution Mechanism**
   - Using Docker images to store and distribute the executables
   - Provides versioning and easy access to specific versions
   - Simplifies version checking and management
   - Eliminates the need for GitHub Releases

3. **Tool Cache for Efficiency**
   - Using GitHub's tool cache to avoid redundant downloads
   - Improves workflow execution time

4. **Periodic Checking vs. Webhooks**
   - Using scheduled workflows for simplicity
   - Avoids the need for external services or complex event triggers

5. **Single File Distribution for Action**
   - Using @vercel/ncc to compile the action code into a single file
   - Simplifies distribution and eliminates the need for node_modules

6. **Matrix Strategy for Builds**
   - Using GitHub Actions matrix strategy to define build configurations
   - Improves maintainability and scalability
   - Makes it easier to add new platforms or architectures

7. **Optimized JAR Download Process**
   - Each build job downloads the JAR directly instead of using a separate job
   - Reduces workflow complexity and execution time
   - Eliminates the overhead of artifact uploads/downloads between jobs

8. **Concurrency Control**
   - Using GitHub Actions concurrency to prevent workflow conflicts
   - Ensures only one workflow runs for a given reference at a time

9. **Custom Reflection Configuration for GraalVM**
   - Using a custom Java class (`CrowdinReflectionFeature`) to provide explicit reflection configuration
   - Eliminates the need for agent-based configuration generation at build time
   - Provides more control over which classes are included in the native image
   - Results in more optimized and smaller native executables

10. **Integrated Testing in Build Jobs**
    - Each binary is tested immediately after being built on its native platform
    - Tests run common Crowdin CLI commands to verify functionality
    - Uses environment variables for credentials instead of modifying config files
    - Ensures that only working binaries are released
    - Provides early detection of platform-specific issues

11. **Simplified Docker Image Building**
    - All Docker images are built for linux/amd64 platform regardless of binary architecture
    - Simplifies the build process while still allowing architecture-specific binary storage
    - Reduces complexity and improves reliability

12. **Version Marker Container**
    - A simple container without binaries used for version checking
    - Simplifies version management and prevents redundant builds
    - Provides a consistent way to check if a version already exists

13. **Latest Tag Control**
    - Images can optionally be tagged with "latest" in addition to version
    - Controlled through workflow input parameter or automatically for scheduled runs
    - Allows for flexible version management
    - Uses GitHub Actions conditional expressions for simplified logic

## Component Relationships

- The periodic build workflow creates Docker images that the setup action consumes
- The setup action depends on the images pushed to the container registry
- Both components share version detection and naming conventions
- The build workflow uses matrix jobs with direct JAR downloads for efficiency
- The setup action extracts binaries from Docker images and stores them in the tool cache

## Error Handling Patterns

1. **Version Fallback**
   - If requested version is not available, fall back to latest version
   - Provide clear error messages and warnings

2. **Platform Detection**
   - Automatically detect the runner's platform
   - Download the appropriate executable for the platform

3. **Cache Validation**
   - Verify cached executables before using them
   - Re-download if validation fails

4. **Repository Fallback**
   - If our repository doesn't have a release, check the official Crowdin CLI repository
   - Use the version number from the official repository but still download our custom build

5. **Matrix Job Failure Handling**
   - Individual matrix job failures don't fail the entire workflow
   - Allows for partial success and reporting

6. **Test Failure Handling**
   - Test failures in any build job prevent the release creation
   - Each binary is tested on its native platform for better compatibility testing
   - Environment variables are used for credentials to simplify testing
   - Common Crowdin CLI commands are tested to verify core functionality

7. **Docker Image Building Failure Handling**
   - Failures in Docker image building are reported clearly
   - Version marker container ensures consistent version checking
   - Architecture-specific containers are built independently for better fault isolation

8. **Latest Tag Control**
   - Clear logic for determining when to mark a version as "latest"
   - Scheduled runs automatically mark the latest version as "latest"
   - Manual runs can optionally mark a specific version as "latest"
   - Prevents accidental overwriting of the "latest" tag 