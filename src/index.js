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
    const githubToken = core.getInput('github_token');
    
    if (!githubToken) {
      throw new Error('GitHub token is required. Please provide it via the github_token input.');
    }
    
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

    // Check if the tool is already cached. A 'latest' request cannot be looked
    // up until the tag it resolves to is known, so it is checked after resolving.
    const toolName = 'crowdin';
    let toolPath = version === 'latest' ? '' : tc.find(toolName, version);
    
    if (!toolPath) {
      core.info(`Downloading Crowdin CLI ${version} for ${platform}/${arch}...`);
      
      // Create a temporary directory
      const tempDir = path.join(os.tmpdir(), 'crowdin-cli-download');
      await io.mkdirP(tempDir);
      
      // Crowdin CLI 5.0.0 dropped the JVM and started publishing native
      // binaries upstream, so 5.x and above come straight from the official
      // repository. Older releases only ever had native builds in the
      // standalone repository, so 4.x keeps resolving there.
      /** @type {ReturnType<typeof github.getOctokit>} */
      const octokit = github.getOctokit(githubToken);

      let releaseVersion = version;
      let useOfficialRelease = version === 'latest' || isVersionGreaterOrEqual(version, '5.0.0');

      let owner = useOfficialRelease ? 'crowdin' : 'ilyagulya';
      let repo = useOfficialRelease ? 'crowdin-cli' : 'crowdin-cli-standalone';

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

          // A 'latest' that resolves below 5.0.0 has no native asset upstream,
          // so fall back to the standalone repository for that tag.
          if (!isVersionGreaterOrEqual(releaseVersion, '5.0.0')) {
            useOfficialRelease = false;
            owner = 'ilyagulya';
            repo = 'crowdin-cli-standalone';
          }
        } catch (error) {
          core.warning(`Error getting latest release version: ${error.message}`);
          core.warning('Falling back to "latest" tag...');
          releaseVersion = 'latest';
        }
      }

      const binaryName = getBinaryName(platform, arch, useOfficialRelease);

      core.info(`Resolved Crowdin CLI ${releaseVersion} from ${owner}/${repo}`);

      // Now that 'latest' resolved to a concrete tag, the cache can be checked.
      toolPath = tc.find(toolName, releaseVersion);

      if (toolPath) {
        core.info(`Found cached Crowdin CLI ${releaseVersion}`);
      } else {
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
 * Resolves the release asset name for a platform/architecture pair.
 *
 * The two sources name their assets differently: the standalone repository
 * publishes GraalVM builds as `crowdin-cli-<os>-<arch>`, while upstream 5.x
 * publishes Bun builds as `crowdin-<os>-<arch>`.
 *
 * @param {string} platform - Node's os.platform() value
 * @param {string} arch - Node's os.arch() value
 * @param {boolean} useOfficialRelease - Whether the asset comes from crowdin/crowdin-cli
 * @returns {string} - Release asset name
 */
function getBinaryName(platform, arch, useOfficialRelease) {
  /** @type {Record<string, Record<string, string>>} */
  const assets = useOfficialRelease
    ? {
        linux: { x64: 'crowdin-linux-x64', arm64: 'crowdin-linux-arm64' },
        darwin: { x64: 'crowdin-darwin-x64', arm64: 'crowdin-darwin-arm64' },
        win32: { x64: 'crowdin.exe' },
      }
    : {
        linux: { x64: 'crowdin-cli-linux-x86_64', arm64: 'crowdin-cli-linux-arm64' },
        darwin: { x64: 'crowdin-cli-macos-x86_64', arm64: 'crowdin-cli-macos-arm64' },
        win32: { x64: 'crowdin-cli-windows-x86_64.exe' },
      };

  if (platform === 'win32' && arch !== 'x64') {
    throw new Error(`Windows platform only supports x86_64 architecture. Your architecture: ${arch}`);
  }

  const binaryName = assets[platform] && assets[platform][arch];

  if (!binaryName) {
    throw new Error(`Unsupported platform: ${platform} ${arch}`);
  }

  return binaryName;
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
