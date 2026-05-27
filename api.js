export const stitchClient = {
  /**
   * Calls a tool on the Stitch MCP server
   * @param {string} toolName - The name of the tool to call
   * @param {object} args - The arguments for the tool
   */
  async callTool(toolName, args) {
    try {
      const response = await fetch("https://stitch.googleapis.com/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": import.meta.env.VITE_STITCH_API_KEY
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: toolName,
            arguments: args
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Stitch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Unknown JSON-RPC error");
      }
      
      return data.result;
    } catch (error) {
      console.error(`Failed to call Stitch tool '${toolName}':`, error);
      throw error;
    }
  }
};
