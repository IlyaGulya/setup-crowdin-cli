const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const exec = require('@actions/exec');
const github = require('@actions/github');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function run() {
  try {
    // Get inputs
    const version = core.getInput('version') || 'latest';
    const githubToken = core.getInput('github_token', { required: true });
    
    // Check if version meets minimum requirement (if not 'latest')
    if (version !== 'latest') {
      const minVersion = '4.4.0';
      if (!isVersionGreaterOrEqual(version, minVersion)) {
        throw new Error(`Only Crowdin CLI versions ${minVersion} and above are supported. You specified: ${version}`);
      }
    }
    
    // Determine platform and architecture
    const platform = os.platform();
    const arch = os.arch();
    
    // Map to platform format for binary name
    /** @type {string} */
    let binaryName;
    
    if (platform === 'linux') {
      if (arch === 'x64') {
        binaryName = 'crowdin-cli-linux-x86_64';
      } else if (arch === 'arm64') {
        binaryName = 'crowdin-cli-linux-arm64';
      }
    } else if (platform === 'darwin') {
      if (arch === 'x64') {
        binaryName = 'crowdin-cli-macos-x86_64';
      } else if (arch === 'arm64') {
        binaryName = 'crowdin-cli-macos-arm64';
      }
    } else if (platform === 'win32') {
      if (arch === 'x64') {
        binaryName = 'crowdin-cli-windows-x86_64.exe';
      } else {
        throw new Error(`Windows platform only supports x86_64 architecture. Your architecture: ${arch}`);
      }
    }
    
    if (!binaryName) {
      throw new Error(`Unsupported platform: ${platform} ${arch}`);
    }
    
    // Check if the tool is already cached
    const toolName = 'crowdin';
    let toolPath = tc.find(toolName, version);
    
    if (!toolPath) {
      core.info(`Downloading Crowdin CLI ${version} for ${platform}/${arch}...`);
      
      // Create a temporary directory
      const tempDir = path.join(os.tmpdir(), 'crowdin-cli-download');
      await io.mkdirP(tempDir);
      
      // Use the standalone repository
      const owner = 'ilyagulya';
      const repo = 'crowdin-cli-standalone';
      
      // Determine the download URL
      let releaseVersion = version;
      
      // Get authenticated GitHub client
      /** @type {ReturnType<typeof github.getOctokit>} */
      const octokit = github.getOctokit(githubToken);
      
      // If version is 'latest', get the latest release tag
      if (version === 'latest') {
        core.info('Getting latest release version...');
        try {
          // Get the latest release
          const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
            owner,
            repo
          });
          
          releaseVersion = latestRelease.tag_name;
          core.info(`Latest release version: ${releaseVersion}`);
        } catch (error) {
          core.warning(`Error getting latest release version: ${error.message}`);
          core.warning('Falling back to "latest" tag...');
          releaseVersion = 'latest';
        }
      }
      
      // Download the binary from GitHub releases
      const binaryUrl = `https://github.com/${owner}/${repo}/releases/download/${releaseVersion}/${binaryName}`;
      core.info(`Downloading from: ${binaryUrl}`);
      
      const binaryPath = path.join(tempDir, platform === 'win32' ? 'crowdin.exe' : 'crowdin');
      
      try {
        // Download the binary
        const downloadedPath = await tc.downloadTool(binaryUrl);
        
        // Copy to the expected location
        fs.copyFileSync(downloadedPath, binaryPath);
        
        // Make the binary executable (not needed for Windows)
        if (platform !== 'win32') {
          fs.chmodSync(binaryPath, '755');
        }
        
        // Cache the tool
        toolPath = await tc.cacheFile(binaryPath, platform === 'win32' ? 'crowdin.exe' : 'crowdin', toolName, releaseVersion);
      } catch (error) {
        throw new Error(`Failed to download Crowdin CLI ${version}: ${error.message}`);
      }
    }
    
    // Add to path
    core.addPath(toolPath);
    
    // Output the version for verification
    await exec.exec(path.join(toolPath, platform === 'win32' ? 'crowdin.exe' : 'crowdin'), ['--version']);
    
    core.info('Crowdin CLI has been set up successfully!');
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * Helper function to find files recursively in a directory
 * @async
 * @param {string} dir - Directory to search in
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findFiles(dir) {
  /** @type {string[]} */
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await findFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Compares two version strings
 * @param {string} version1 - First version to compare
 * @param {string} version2 - Second version to compare
 * @returns {boolean} - True if version1 is greater than or equal to version2
 */
function isVersionGreaterOrEqual(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return true;
    if (v1Part < v2Part) return false;
  }
  
  return true; // Versions are equal
}

run(); 
