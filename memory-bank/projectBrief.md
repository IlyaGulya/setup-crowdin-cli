# Project Brief: Setup Crowdin CLI GitHub Action

## Overview
This project creates a GitHub Action that simplifies the use of Crowdin CLI in GitHub workflows by:
1. Automatically building and releasing native executables of Crowdin CLI
2. Providing a GitHub Action to download and set up Crowdin CLI in the GitHub runner's tool cache

## Core Requirements
1. Create a GitHub workflow that periodically checks for Crowdin CLI updates
2. Build native executables using GraalVM for cross-platform compatibility
3. Create GitHub releases with these executables
4. Develop a GitHub Action that downloads the requested (or latest) version of Crowdin CLI
5. Store the downloaded CLI in the GitHub runner's tool cache
6. Make the CLI accessible for jobs in workflows

## Success Criteria
- Automated detection of new Crowdin CLI versions
- Successful building of native executables
- Proper GitHub releases with versioned assets
- GitHub Action that correctly downloads and caches the CLI
- Comprehensive documentation for users

## Constraints
- Must follow GitHub Actions best practices
- Should handle cross-platform compatibility
- Must properly utilize GitHub's tool cache
- Should be efficient and reliable

## Timeline
- Initial implementation: Create both the workflow and action
- Testing: Ensure both components work as expected
- Documentation: Provide clear usage instructions
- Release: Publish the action to the GitHub Marketplace 