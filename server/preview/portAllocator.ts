/**
 * Port Allocator - Dynamic Port Management (4110-4990)
 * CORE REPAIR: Expanded port range, better conflict detection
 */

const MIN_PORT = 4110;
const MAX_PORT = 4990;

// Track which ports are currently in use
const allocatedPorts = new Map<number, string>(); // port -> buildId
const portUsageHistory = new Map<number, number>(); // port -> last used timestamp

/**
 * Allocate a free port for a build
 * REPAIR: Better port detection with usage history
 */
export function allocatePort(buildId: string): number {
  // First, check if this build already has a port
  for (const [port, id] of allocatedPorts.entries()) {
    if (id === buildId) {
      console.log(`[PortAllocator] ♻️  Reusing port ${port} for build ${buildId}`);
      return port;
    }
  }

  // Find a free port, prefer least recently used
  const availablePorts: number[] = [];

  for (let port = MIN_PORT; port <= MAX_PORT; port++) {
    if (!allocatedPorts.has(port)) {
      availablePorts.push(port);
    }
  }

  if (availablePorts.length === 0) {
    throw new Error(`No available ports in range ${MIN_PORT}-${MAX_PORT}. All ${MAX_PORT - MIN_PORT + 1} ports are in use.`);
  }

  // Sort by least recently used
  availablePorts.sort((a, b) => {
    const aTime = portUsageHistory.get(a) || 0;
    const bTime = portUsageHistory.get(b) || 0;
    return aTime - bTime;
  });

  const port = availablePorts[0];
  allocatedPorts.set(port, buildId);
  portUsageHistory.set(port, Date.now());

  console.log(`[PortAllocator] ✅ Allocated port ${port} for build ${buildId}`);
  return port;
}

/**
 * Free a port when preview server is stopped
 */
export function freePort(port: number): void {
  const buildId = allocatedPorts.get(port);
  if (buildId) {
    allocatedPorts.delete(port);
    console.log(`[PortAllocator] 🔓 Freed port ${port} (was used by build ${buildId})`);
  }
}

/**
 * Get the port assigned to a specific build
 */
export function getPortForBuild(buildId: string): number | null {
  for (const [port, id] of allocatedPorts.entries()) {
    if (id === buildId) {
      return port;
    }
  }
  return null;
}

/**
 * Check if a port is available
 */
export function isPortAvailable(port: number): boolean {
  return !allocatedPorts.has(port) && port >= MIN_PORT && port <= MAX_PORT;
}

/**
 * Get all currently allocated ports
 */
export function getAllocatedPorts(): Map<number, string> {
  return new Map(allocatedPorts);
}

/**
 * Clear all port allocations (for cleanup/testing)
 */
export function clearAllPorts(): void {
  allocatedPorts.clear();
  console.log('[PortAllocator] 🧹 Cleared all port allocations');
}

/**
 * REPAIR: Force free a port even if not tracked
 */
export function forceFrePort(port: number): void {
  allocatedPorts.delete(port);
  console.log(`[PortAllocator] 💥 Force freed port ${port}`);
}

/**
 * Get port range info
 */
export function getPortRangeInfo() {
  return {
    min: MIN_PORT,
    max: MAX_PORT,
    total: MAX_PORT - MIN_PORT + 1,
    allocated: allocatedPorts.size,
    available: (MAX_PORT - MIN_PORT + 1) - allocatedPorts.size,
  };
}
