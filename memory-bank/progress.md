# Progress: Setup Crowdin CLI GitHub Action

## What Works

- Project repository created
- Basic directory structure set up
- Documentation created
- Periodic build workflow implemented and improved
- Setup action implemented and fixed
- Test workflow created
- Dependencies updated
- Action built successfully with @vercel/ncc
- Matrix-based build strategy implemented
- Tag-based triggers for manual version releases added
- Artifact handling between jobs improved
- Concurrency control added to prevent workflow conflicts
- **Workflow optimized to download JAR directly in build jobs**
- **Agent-based native-image configuration replaced with custom reflection feature**
- **Testing of built binaries integrated directly into the build job**
- **Testing simplified by using environment variables instead of modifying config files**
- **Docker image building simplified by using a single platform (linux/amd64) for all images**
- **Version marker container added for version checking**
- **Control over which versions are marked as "latest" added through workflow inputs**
- **"Mark as latest" logic simplified using GitHub Actions conditional expressions**
- **AWT stripper integrated to remove AWT dependencies from the JAR before building native images**
- **Test workflow updated to only test on supported platforms (macOS and Linux, both x86_64 and arm64)**
- **Platform-specific binary selection implemented in the action**

## What's Left to Build

1. **Periodic Build Workflow**
   - [x] Create workflow file
   - [x] Implement version checking logic
   - [x] Set up GraalVM build environment
   - [x] Implement native executable building
   - [x] Create GitHub releases
   - [x] Implement matrix-based build strategy
   - [x] Add tag-based triggers for manual version releases
   - [x] Improve artifact handling between jobs
   - [x] Add concurrency control
   - [x] **Optimize JAR download process**
   - [x] **Implement custom reflection feature for native image building**
   - [x] **Integrate testing of built binaries directly into the build job**
   - [x] **Simplify testing by using environment variables**
   - [x] **Simplify Docker image building by using a single platform**
   - [x] **Add version marker container for version checking**
   - [x] **Add control over which versions are marked as "latest"**
   - [x] **Simplify "mark as latest" logic using conditional expressions**
   - [x] **Integrate AWT stripper to remove AWT dependencies**

2. **Setup Action**
   - [x] Create action metadata file
   - [x] Implement download logic
   - [x] Implement caching logic
   - [x] Add platform detection
   - [x] Make CLI available in PATH
   - [x] Fix to download custom-built executables
   - [x] Build action with @vercel/ncc
   - [x] **Update to work with simplified Docker image structure**
   - [x] **Implement platform-specific binary selection via parameter**

3. **Test Workflow**
   - [x] Create test workflow file
   - [x] Test action on different platforms
   - [x] **Update to test only on supported platforms (macOS and Linux, both x86_64 and arm64)**
   - [x] **Implement matrix strategy for testing on all supported platforms**
   - [x] **Add platform parameter to action call for proper binary selection**
   - [x] **Add platform-specific feedback in verification steps**

4. **Documentation**
   - [x] Create comprehensive README
   - [x] Add usage examples
   - [x] Document configuration options
   - [x] Update to clarify custom-built executables
   - [ ] Document the new workflow improvements
   - [ ] **Document the optimized build process**
   - [ ] **Document the custom reflection feature and its benefits**
   - [ ] **Document the simplified Docker image building process**
   - [ ] **Document the "mark as latest" functionality**
   - [ ] **Document the AWT stripper integration and its benefits**
   - [ ] **Document which AWT-related operations are now unsupported**
   - [ ] **Document the supported platforms and architectures**
   - [ ] **Document the platform-specific binary selection feature**

5. **Testing**
   - [ ] Test workflow with different versions
   - [ ] Test action on different platforms
   - [ ] Verify caching works as expected
   - [ ] Test the matrix-based build strategy
   - [ ] **Test the optimized JAR download process**
   - [ ] **Test the custom reflection feature with different Crowdin CLI versions**
   - [x] **Implement integrated testing of binaries in the build workflow**
   - [x] **Optimize testing by using environment variables**
   - [ ] **Test the simplified Docker image building process**
   - [ ] **Test the version marker container functionality**
   - [ ] **Test the "mark as latest" functionality with different scenarios**
   - [ ] **Test the AWT stripper integration with different Crowdin CLI versions**
   - [ ] **Verify that AWT-stripped binaries work correctly for non-AWT operations**
   - [ ] **Test the updated test workflow on all supported platforms**
   - [ ] **Verify that platform-specific binary selection works correctly**

## Current Status

Project implementation is complete, fixed, and improved. The action has been successfully compiled into a single file using @vercel/ncc. The build workflow has been enhanced with a matrix-based build strategy, tag-based triggers, improved artifact handling, and concurrency control. 

**The workflow has been further optimized by downloading the JAR directly in each build job, eliminating the need for a separate download job and reducing overhead. Additionally, the agent-based native-image configuration has been replaced with a custom reflection feature, providing more control over the build process and resulting in more optimized executables. Testing of the built binaries has been integrated directly into the build job, ensuring that each binary is tested on its native platform immediately after being built. The testing process has been simplified by using environment variables instead of modifying configuration files, making the workflow more maintainable and robust.**

**We've also simplified the Docker image building process by using a single platform (linux/amd64) for all images, regardless of the target architecture of the binary they contain. This simplification makes the workflow more efficient and easier to maintain. A version marker container has been added for version checking, ensuring that the workflow correctly identifies when a new version needs to be built. Control over which versions are marked as "latest" has been added through workflow inputs, allowing for more flexibility in version management. The "mark as latest" logic has been simplified using GitHub Actions conditional expressions, making the code more concise and easier to understand.**

**Most recently, we've integrated an AWT stripper tool that removes Java AWT dependencies from the JAR file before building native images. This improves compatibility with headless environments, reduces the size of the native executables, and makes the binaries more suitable for server environments where AWT is not available or not desired. The AWT stripper replaces AWT method calls with exceptions that provide clear error messages, ensuring that users are informed when they attempt to use unsupported operations. Docker image labels have been updated to indicate that the binaries are AWT-stripped, providing transparency about the modifications made to the original Crowdin CLI.**

**We've also updated the test workflow to only test on supported platforms (macOS and Linux, both x86_64 and arm64), removing Windows support as it's not part of our target platforms. The test workflow now uses a matrix strategy to test on all supported platforms, passing the platform parameter to the action for proper binary selection. This ensures that the action correctly selects and uses the appropriate binary for each platform. The verification steps now include platform-specific feedback, making it easier to identify which platform a test is running on.**

The next steps are to test the action and workflow to ensure they work as expected and to update the documentation to reflect the latest improvements.

## Known Issues

- The action has not been tested yet
- The workflow has not been tested yet
- The action might need adjustments based on testing results
- Documentation needs to be updated to reflect the latest workflow improvements
- **The simplified Docker image building process needs to be tested**
- **The version marker container functionality needs to be verified**
- **The "mark as latest" functionality needs to be tested with different scenarios**
- **The AWT stripper integration needs to be tested with different Crowdin CLI versions**
- **We need to verify that AWT-stripped binaries work correctly for non-AWT operations**
- **We need to document which AWT-related operations are now unsupported**
- **The updated test workflow needs to be tested on all supported platforms**
- **We need to verify that platform-specific binary selection works correctly** 
