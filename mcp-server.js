#!/usr/bin/env node

/**
 * Bird Data MCP Server
 * 
 * This MCP server acts as a bridge to the existing REST API,
 * providing AI assistants with access to comprehensive bird data
 * through the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://shayk.dev/avibase-mcp';

class BirdDataMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'bird-data-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  async makeAPIRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch data from bird API: ${error.message}`
      );
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_bird_stats',
            description: 'Get comprehensive statistics about the bird dataset including total records, species count, families, orders, and conservation categories.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'search_birds',
            description: 'Search for birds by scientific or common name with fuzzy matching support.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search term (bird name to search for)',
                },
                exact: {
                  type: 'boolean',
                  description: 'Whether to use exact matching (default: false for fuzzy search)',
                  default: false,
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 20)',
                  default: 20,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_birds_by_taxonomy',
            description: 'Get birds filtered by taxonomic classification (Order, Family, or taxonomic rank).',
            inputSchema: {
              type: 'object',
              properties: {
                level: {
                  type: 'string',
                  description: 'Taxonomic level to filter by',
                  enum: ['Order', 'Family', 'Taxon_rank'],
                },
                value: {
                  type: 'string',
                  description: 'Value to filter by (e.g., "Strigiformes" for owls, "Accipitridae" for hawks)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50,
                },
              },
              required: ['level', 'value'],
            },
          },
          {
            name: 'get_conservation_status',
            description: 'Get birds by IUCN Red List conservation status (CR=Critically Endangered, EN=Endangered, VU=Vulnerable, EX=Extinct, etc.).',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'IUCN Red List category',
                  enum: ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'EX', 'EW'],
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50,
                },
              },
              required: ['category'],
            },
          },
          {
            name: 'get_birds_by_region',
            description: 'Find birds by geographic region or range (e.g., Madagascar, Australia, Africa, etc.).',
            inputSchema: {
              type: 'object',
              properties: {
                region: {
                  type: 'string',
                  description: 'Geographic region to search for in bird ranges',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50,
                },
              },
              required: ['region'],
            },
          },
          {
            name: 'get_extinct_species',
            description: 'Get all extinct or possibly extinct bird species.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 100)',
                  default: 100,
                },
              },
              required: [],
            },
          },
          {
            name: 'get_birds_by_authority',
            description: 'Find birds described by a specific taxonomic authority (e.g., Linnaeus, Darwin, etc.).',
            inputSchema: {
              type: 'object',
              properties: {
                authority: {
                  type: 'string',
                  description: 'Name of the taxonomic authority',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50,
                },
              },
              required: ['authority'],
            },
          },
          {
            name: 'get_random_birds',
            description: 'Get a random sample of birds for exploration and discovery.',
            inputSchema: {
              type: 'object',
              properties: {
                count: {
                  type: 'number',
                  description: 'Number of random birds to return (default: 10, max: 50)',
                  default: 10,
                  maximum: 50,
                },
              },
              required: [],
            },
          },
          {
            name: 'get_bird_report',
            description: 'Get a detailed report for a specific bird species including related species and comprehensive information.',
            inputSchema: {
              type: 'object',
              properties: {
                scientific_name: {
                  type: 'string',
                  description: 'Scientific name of the bird species (e.g., "Aquila chrysaetos")',
                },
              },
              required: ['scientific_name'],
            },
          },
          {
            name: 'custom_bird_query',
            description: 'Perform complex queries with multiple filters for advanced bird data analysis.',
            inputSchema: {
              type: 'object',
              properties: {
                filters: {
                  type: 'object',
                  description: 'Object containing field-value pairs for filtering',
                  properties: {
                    Family: { type: 'string' },
                    Order: { type: 'string' },
                    IUCN_Red_List_Category: { 
                      type: 'array',
                      items: { type: 'string' }
                    },
                    Taxon_rank: { type: 'string' },
                  },
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 50)',
                  default: 50,
                },
              },
              required: ['filters'],
            },
          },
          {
            name: 'execute_jsonata_query',
            description: 'Execute a raw JSONata query for advanced data analysis and transformation. JSONata is a powerful query language for JSON data.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'JSONata query expression (e.g., "$count($[Taxon_rank = \\"species\\"])" to count species)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return for array results (default: 50)',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_bird_stats':
            return await this.handleGetBirdStats();

          case 'search_birds':
            return await this.handleSearchBirds(args);

          case 'get_birds_by_taxonomy':
            return await this.handleGetBirdsByTaxonomy(args);

          case 'get_conservation_status':
            return await this.handleGetConservationStatus(args);

          case 'get_birds_by_region':
            return await this.handleGetBirdsByRegion(args);

          case 'get_extinct_species':
            return await this.handleGetExtinctSpecies(args);

          case 'get_birds_by_authority':
            return await this.handleGetBirdsByAuthority(args);

          case 'get_random_birds':
            return await this.handleGetRandomBirds(args);

          case 'get_bird_report':
            return await this.handleGetBirdReport(args);

          case 'custom_bird_query':
            return await this.handleCustomBirdQuery(args);

          case 'execute_jsonata_query':
            return await this.handleExecuteJsonataQuery(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error.message}`
        );
      }
    });
  }

  async handleGetBirdStats() {
    const response = await this.makeAPIRequest('/stats');
    
    return {
      content: [
        {
          type: 'text',
          text: `# Bird Dataset Statistics

📊 **Dataset Overview:**
- **Total Records:** ${response.data.totalRecords.toLocaleString()}
- **Species:** ${response.data.totalSpecies.toLocaleString()}
- **Families:** ${response.data.totalFamilies}
- **Orders:** ${response.data.totalOrders}
- **Extinct Species:** ${response.data.extinctSpecies}

🚨 **IUCN Conservation Categories:** ${response.data.iucnCategories.join(', ')}

This comprehensive dataset contains information about birds worldwide, including taxonomic classification, conservation status, geographic distribution, and historical data.`,
        },
      ],
    };
  }

  async handleSearchBirds(args) {
    const { query, exact = false, limit = 20 } = args;
    const endpoint = `/search?q=${encodeURIComponent(query)}&exact=${exact}&limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    const results = response.data.map(bird => ({
      scientific_name: bird.Scientific_name,
      common_name: bird.English_name_AviList || 'No common name',
      family: bird.Family,
      order: bird.Order,
      conservation_status: bird.IUCN_Red_List_Category || 'Not assessed',
      authority: bird.Authority,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `# Search Results for "${query}"

Found **${response.pagination.totalItems}** birds matching "${query}" (showing ${results.length}):

${results.map((bird, i) => `${i + 1}. **${bird.scientific_name}**
   - Common name: ${bird.common_name}
   - Family: ${bird.family}
   - Order: ${bird.order}
   - Conservation: ${bird.conservation_status}
   - Authority: ${bird.authority || 'Unknown'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: ${response.pagination.totalItems - results.length} more results available. Use a higher limit to see more.*` : ''}`,
        },
      ],
    };
  }

  async handleGetBirdsByTaxonomy(args) {
    const { level, value, limit = 50 } = args;
    const endpoint = `/taxonomy/${level}/${encodeURIComponent(value)}?limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    const speciesCount = response.data.filter(bird => bird.Taxon_rank === 'species').length;
    
    return {
      content: [
        {
          type: 'text',
          text: `# ${level}: ${value}

📊 **Summary:**
- **Total records:** ${response.pagination.totalItems}
- **Species in results:** ${speciesCount}

**Sample records:**
${response.data.slice(0, 10).map((bird, i) => `${i + 1}. **${bird.Scientific_name}** (${bird.Taxon_rank})
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Conservation: ${bird.IUCN_Red_List_Category || 'Not assessed'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total records.*` : ''}`,
        },
      ],
    };
  }

  async handleGetConservationStatus(args) {
    const { category, limit = 50 } = args;
    const endpoint = `/conservation/${category}?limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    const categoryNames = {
      'CR': 'Critically Endangered',
      'EN': 'Endangered', 
      'VU': 'Vulnerable',
      'NT': 'Near Threatened',
      'LC': 'Least Concern',
      'DD': 'Data Deficient',
      'EX': 'Extinct',
      'EW': 'Extinct in the Wild'
    };

    return {
      content: [
        {
          type: 'text',
          text: `# ${categoryNames[category] || category} Species

🚨 **${response.pagination.totalItems}** species with IUCN status: **${category}**

**Species list:**
${response.data.map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Range: ${bird.Range ? bird.Range.substring(0, 100) + '...' : 'No range data'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total species.*` : ''}`,
        },
      ],
    };
  }

  async handleGetBirdsByRegion(args) {
    const { region, limit = 50 } = args;
    const endpoint = `/range?region=${encodeURIComponent(region)}&limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    return {
      content: [
        {
          type: 'text',
          text: `# Birds of ${region}

🌍 **${response.pagination.totalItems}** bird records found in ${region}

**Regional species:**
${response.data.slice(0, 15).map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Conservation: ${bird.IUCN_Red_List_Category || 'Not assessed'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total records for this region.*` : ''}`,
        },
      ],
    };
  }

  async handleGetExtinctSpecies(args) {
    const { limit = 100 } = args;
    const endpoint = `/extinct?limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    return {
      content: [
        {
          type: 'text',
          text: `# Extinct and Possibly Extinct Species

💀 **${response.pagination.totalItems}** extinct or possibly extinct bird species documented

**Extinct species:**
${response.data.slice(0, 20).map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Last known: ${bird.Extinct_or_possibly_extinct || 'Unknown'}
   - Authority: ${bird.Authority || 'Unknown'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total extinct species.*` : ''}

This represents a significant loss of avian biodiversity and highlights the importance of conservation efforts.`,
        },
      ],
    };
  }

  async handleGetBirdsByAuthority(args) {
    const { authority, limit = 50 } = args;
    const endpoint = `/authority?name=${encodeURIComponent(authority)}&limit=${limit}`;
    const response = await this.makeAPIRequest(endpoint);

    return {
      content: [
        {
          type: 'text',
          text: `# Birds Described by ${authority}

👨‍🔬 **${response.pagination.totalItems}** birds described by ${authority}

**Historical contributions:**
${response.data.slice(0, 15).map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Year: ${bird.Authority}
   - Publication: ${bird.Bibliographic_details ? bird.Bibliographic_details.substring(0, 80) + '...' : 'Not specified'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total species described by ${authority}.*` : ''}`,
        },
      ],
    };
  }

  async handleGetRandomBirds(args) {
    const { count = 10 } = args;
    const endpoint = `/random?count=${Math.min(count, 50)}`;
    const response = await this.makeAPIRequest(endpoint);

    return {
      content: [
        {
          type: 'text',
          text: `# Random Bird Discovery

🎲 **${response.data.length}** randomly selected birds for exploration:

${response.data.map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family} (${bird.Order})
   - Conservation: ${bird.IUCN_Red_List_Category || 'Not assessed'}
   - Range: ${bird.Range ? bird.Range.substring(0, 100) + '...' : 'No range data'}`).join('\n\n')}

These random selections showcase the incredible diversity of avian species in the database!`,
        },
      ],
    };
  }

  async handleGetBirdReport(args) {
    const { scientific_name } = args;
    const endpoint = `/bird/${encodeURIComponent(scientific_name)}`;
    const response = await this.makeAPIRequest(endpoint);

    const bird = response.data.bird;
    const related = response.data.relatedInFamily;

    return {
      content: [
        {
          type: 'text',
          text: `# Detailed Report: ${bird.Scientific_name}

## Basic Information
- **Scientific Name:** ${bird.Scientific_name}
- **Common Name:** ${bird.English_name_AviList || 'No common name available'}
- **Alternative Names:** ${bird.English_name_Clements_v2024 || bird.English_name_BirdLife_v9 || 'None listed'}
- **Taxonomic Authority:** ${bird.Authority || 'Unknown'}

## Taxonomic Classification
- **Order:** ${bird.Order}
- **Family:** ${bird.Family} (${bird.Family_English_name || 'Family name not available'})
- **Taxonomic Rank:** ${bird.Taxon_rank}

## Conservation & Status
- **IUCN Red List Category:** ${bird.IUCN_Red_List_Category || 'Not assessed'}
- **Conservation Status:** ${response.data.conservationStatus}
- **Extinction Status:** ${bird.Extinct_or_possibly_extinct || 'Not extinct'}

## Geographic Distribution
${bird.Range ? `**Range:** ${bird.Range}` : '**Range:** No range data available'}

## Additional Information
- **Type Locality:** ${bird.Type_locality || 'Not specified'}
- **Original Description:** ${bird.Title_of_original_description || 'Not available'}
- **Bibliographic Details:** ${bird.Bibliographic_details || 'Not available'}

## External Resources
${response.data.hasUrls.birdLife ? `- **BirdLife DataZone:** Available` : ''}
${response.data.hasUrls.birdsOfTheWorld ? `- **Birds of the World:** Available` : ''}
${response.data.hasUrls.originalDescription ? `- **Original Description:** Available` : ''}
- **Species Code:** ${bird.Species_code_Cornell_Lab || 'Not available'}
- **AvibaseID:** ${bird.AvibaseID || 'Not available'}

## Related Species in ${bird.Family}
${related.length > 0 ? related.map((rel, i) => `${i + 1}. **${rel.Scientific_name}** - ${rel.English_name_AviList || 'No common name'}`).join('\n') : 'No related species data available'}`,
        },
      ],
    };
  }

  async handleCustomBirdQuery(args) {
    const { filters, limit = 50 } = args;
    const endpoint = `/custom`;
    const response = await this.makeAPIRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ filters, limit }),
    });

    const filterDescription = Object.entries(filters)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join(', ');

    return {
      content: [
        {
          type: 'text',
          text: `# Custom Query Results

🎯 **Query Filters:** ${filterDescription}
📊 **Results:** ${response.pagination.totalItems} birds found

${response.data.map((bird, i) => `${i + 1}. **${bird.Scientific_name}**
   - Common name: ${bird.English_name_AviList || 'No common name'}
   - Family: ${bird.Family}
   - Order: ${bird.Order}
   - Conservation: ${bird.IUCN_Red_List_Category || 'Not assessed'}
   - Range: ${bird.Range ? bird.Range.substring(0, 80) + '...' : 'No range data'}`).join('\n\n')}

${response.pagination.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total matching records.*` : ''}`,
        },
      ],
    };
  }

  async handleExecuteJsonataQuery(args) {
    const { query, limit = 50 } = args;
    const endpoint = `/query`;
    const response = await this.makeAPIRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });

    let resultText;
    if (Array.isArray(response.data)) {
      resultText = `**Query:** \`${query}\`
**Result Type:** Array with ${response.pagination?.totalItems || response.data.length} items

**Results:**
${response.data.map((item, i) => `${i + 1}. ${typeof item === 'object' ? JSON.stringify(item, null, 2) : item}`).join('\n\n')}`;
    } else {
      resultText = `**Query:** \`${query}\`
**Result Type:** ${typeof response.data}
**Result:** ${typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: `# JSONata Query Execution

${resultText}

${response.pagination?.hasNext ? `\n*Note: Showing first ${response.data.length} of ${response.pagination.totalItems} total results.*` : ''}`,
        },
      ],
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🦅 Bird Data MCP Server running on stdio');
  }
}

const server = new BirdDataMCPServer();
server.run().catch(console.error);
