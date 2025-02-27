const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const exec = require('@actions/exec');
const path = require('path');
const os = require('os');
const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  try {
    // Get inputs
    const version = core.getInput('version') || 'latest';
    
    // Determine platform and architecture
    const platform = os.platform();
    const arch = os.arch();
    
    // Map to platform format for binary name and container tag
    let binaryName;
    let archTag;
    
    if (platform === 'linux') {
      if (arch === 'x64') {
        binaryName = 'crowdin-cli-linux-amd64';
        archTag = 'linux-amd64';
      } else if (arch === 'arm64') {
        binaryName = 'crowdin-cli-linux-arm64';
        archTag = 'linux-arm64';
      }
    } else if (platform === 'darwin') {
      if (arch === 'x64') {
        binaryName = 'crowdin-cli-macos-x86_64';
        archTag = 'macos-x86_64';
      } else if (arch === 'arm64') {
        binaryName = 'crowdin-cli-macos-arm64';
        archTag = 'macos-arm64';
      }
    } else if (platform === 'win32') {
      // Windows is not supported by native binaries
      throw new Error('Windows platform is not yet supported by this action.');
    }
    
    if (!binaryName || !archTag) {
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
      
      // Determine the download URL
      const owner = (process.env.GITHUB_REPOSITORY_OWNER || 'ilyagulya').toLowerCase();
      const registry = 'ghcr.io';
      
      // Use separate container for each architecture
      const imageName = `${owner}/crowdin-cli-${archTag}`;
      
      // Combine version and architecture in the tag
      const tag = version === 'latest' ? 'latest' : `${version}`;
      
      core.info(`Using container image: ${registry}/${imageName}:${tag}`);
      
      // Get the token for GHCR authentication
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        core.warning('GITHUB_TOKEN not available. Attempting to download without authentication.');
      }
      
      // Download the binary directly from the registry
      const binaryPath = path.join(tempDir, 'crowdin');
      
      // For GHCR, we need to get a token first
      const authToken = await getRegistryToken(registry, imageName, token);
      
      // First, get the manifest to find the digest
      core.info(`Getting manifest for ${registry}/${imageName}:${tag}...`);
      
      // Get the manifest
      const manifestUrl = `https://${registry}/v2/${imageName}/manifests/${tag}`;
      const manifestHeaders = {
        Accept: 'application/vnd.docker.distribution.manifest.v2+json',
        Authorization: authToken ? `Bearer ${authToken}` : undefined
      };
      
      let manifest;
      try {
        manifest = await fetchJson(manifestUrl, manifestHeaders);
      } catch (error) {
        core.warning(`Failed to get manifest for ${registry}/${imageName}:${tag}: ${error.message}`);
        
        // If the specific architecture image is not found, try the generic image as fallback
        const fallbackImageName = `${owner}/crowdin-cli`;
        core.info(`Trying fallback image: ${registry}/${fallbackImageName}:${tag}`);
        
        const fallbackAuthToken = await getRegistryToken(registry, fallbackImageName, token);
        const fallbackManifestUrl = `https://${registry}/v2/${fallbackImageName}/manifests/${tag}`;
        const fallbackManifestHeaders = {
          Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          Authorization: fallbackAuthToken ? `Bearer ${fallbackAuthToken}` : undefined
        };
        
        manifest = await fetchJson(fallbackManifestUrl, fallbackManifestHeaders);
      }
      
      if (!manifest || !manifest.layers || manifest.layers.length === 0) {
        throw new Error(`Failed to get valid manifest for Crowdin CLI ${version}`);
      }
      
      // Find the layer containing our binary
      // In a simple image, it's usually the first layer
      const layer = manifest.layers[0];
      const digest = layer.digest;
      
      // Download the layer
      core.info(`Downloading layer ${digest}...`);
      const blobUrl = `https://${registry}/v2/${imageName}/blobs/${digest}`;
      const blobHeaders = {
        Authorization: authToken ? `Bearer ${authToken}` : undefined
      };
      
      const tarPath = path.join(tempDir, 'layer.tar');
      
      try {
        await downloadFile(blobUrl, tarPath, blobHeaders);
      } catch (error) {
        core.warning(`Failed to download blob from architecture-specific image: ${error.message}`);
        
        // Try the fallback image for the blob as well
        const fallbackImageName = `${owner}/crowdin-cli`;
        const fallbackAuthToken = await getRegistryToken(registry, fallbackImageName, token);
        const fallbackBlobUrl = `https://${registry}/v2/${fallbackImageName}/blobs/${digest}`;
        const fallbackBlobHeaders = {
          Authorization: fallbackAuthToken ? `Bearer ${fallbackAuthToken}` : undefined
        };
        
        await downloadFile(fallbackBlobUrl, tarPath, fallbackBlobHeaders);
      }
      
      // Extract the binary from the tar file
      core.info('Extracting binary from layer...');
      
      // Create a directory to extract to
      const extractDir = path.join(tempDir, 'extract');
      await io.mkdirP(extractDir);
      
      // Extract the tar file
      await exec.exec('tar', ['-xf', tarPath, '-C', extractDir]);
      
      // Find the binary in the extracted files
      let foundBinary = false;
      
      // Try different possible paths
      const possiblePaths = [
        path.join(extractDir, binaryName),
        path.join(extractDir, 'bin', binaryName),
        path.join(extractDir, 'usr', 'local', 'bin', binaryName),
        path.join(extractDir, binaryName, binaryName)
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          // Copy the binary to the expected location
          fs.copyFileSync(possiblePath, binaryPath);
          foundBinary = true;
          break;
        }
      }
      
      if (!foundBinary) {
        // Try to find the binary recursively
        const files = await findFiles(extractDir);
        for (const file of files) {
          if (path.basename(file) === binaryName || file.endsWith(binaryName)) {
            fs.copyFileSync(file, binaryPath);
            foundBinary = true;
            break;
          }
        }
      }
      
      if (!foundBinary) {
        throw new Error(`Could not find binary ${binaryName} in the extracted files`);
      }
      
      // Make the binary executable
      fs.chmodSync(binaryPath, '755');
      
      // Cache the tool
      toolPath = await tc.cacheFile(binaryPath, 'crowdin', toolName, version);
    }
    
    // Add to path
    core.addPath(toolPath);
    
    // Output the version for verification
    await exec.exec(path.join(toolPath, 'crowdin'), ['--version']);
    
    core.info('Crowdin CLI has been set up successfully!');
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

// Helper function to get a token for the registry
async function getRegistryToken(registry, imageName, githubToken) {
  try {
    // For GHCR, we can use the GitHub token directly
    if (registry === 'ghcr.io' && githubToken) {
      // Get a token from the registry
      const response = await fetch(`https://${registry}/token?scope=repository:${imageName}:pull`, {
        headers: {
          Authorization: `Bearer ${githubToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    }
    
    // If we don't have a GitHub token or the above failed, try anonymous access
    const response = await fetch(`https://${registry}/token?service=${registry}&scope=repository:${imageName}:pull`);
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    
    core.warning(`Failed to get token for ${registry}/${imageName}, will try unauthenticated access`);
    return '';
  } catch (error) {
    core.warning(`Error getting registry token: ${error.message}`);
    return '';
  }
}

// Helper function to fetch JSON
async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Helper function to download a file
async function downloadFile(url, destination, headers = {}) {
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destination, Buffer.from(buffer));
}

// Helper function to find files recursively
async function findFiles(dir) {
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

run(); 
