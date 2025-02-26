const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function run() {
  try {
    // Get inputs
    const version = core.getInput('version');
    
    // Determine platform
    const platform = getPlatform();
    const extension = platform === 'windows' ? '.exe' : '';
    
    // Determine version to download
    let versionToDownload = version;
    if (version === 'latest') {
      versionToDownload = await getLatestVersion();
    }
    
    core.info(`Setting up Crowdin CLI version ${versionToDownload} for ${platform}`);
    
    // Check if the tool is already cached
    const toolName = 'crowdin-cli';
    const cachedPath = tc.find(toolName, versionToDownload, platform);
    
    if (cachedPath) {
      core.info(`Found in cache @ ${cachedPath}`);
      core.addPath(cachedPath);
      return;
    }
    
    // Download our custom-built native executable
    // We're using our own repository's releases which contain the GraalVM-built native executables
    const downloadUrl = `https://github.com/IlyaGulya/setup-crowdin-cli/releases/download/v${versionToDownload}/crowdin-cli-${platform}${extension}`;
    core.info(`Downloading from ${downloadUrl}`);
    
    const downloadPath = await tc.downloadTool(downloadUrl);
    
    // Make executable (not needed for Windows)
    if (platform !== 'windows') {
      fs.chmodSync(downloadPath, '755');
    }
    
    // Create a directory for the executable
    const tempDir = path.join(os.tmpdir(), 'crowdin-cli');
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Copy the executable to the temp directory with the correct name
    const executableName = `crowdin${extension}`;
    const executablePath = path.join(tempDir, executableName);
    fs.copyFileSync(downloadPath, executablePath);
    
    // Cache the tool
    const cachedDir = await tc.cacheDir(tempDir, toolName, versionToDownload, platform);
    
    // Add to path
    core.addPath(cachedDir);
    
    core.info(`Successfully installed Crowdin CLI ${versionToDownload}`);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getPlatform() {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    return os.arch() === 'arm64' ? 'macos-arm64' : 'macos';
  }
  
  if (platform === 'win32') {
    return 'windows';
  }
  
  return 'linux';
}

async function getLatestVersion() {
  try {
    // Get the latest release from our repository
    // This is where our custom-built executables are stored
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { data } = await octokit.rest.repos.getLatestRelease({
      owner: 'IlyaGulya',
      repo: 'setup-crowdin-cli'
    });
    
    return data.tag_name.replace(/^v/, '');
  } catch (error) {
    core.warning(`Failed to get latest version from our repository: ${error.message}`);
    core.info('Falling back to checking the Crowdin CLI repository directly');
    
    // Fallback to checking the Crowdin CLI repository directly
    // This is just to get the version number, we'll still download our custom build
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { data } = await octokit.rest.repos.getLatestRelease({
      owner: 'crowdin',
      repo: 'crowdin-cli'
    });
    
    return data.tag_name.replace(/^v/, '');
  }
}

run(); 