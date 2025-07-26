# AviBase MCP Server

[![npm version](https://img.shields.io/npm/v/@kshayk/avibase-mcp.svg)](https://www.npmjs.com/package/@kshayk/avibase-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A Model Context Protocol (MCP) server that provides AI assistants with access to comprehensive bird data through the AviBase dataset. This server acts as a bridge between AI assistants and bird taxonomic, conservation, and geographic data.

## 🦅 Overview

The AviBase MCP Server gives AI assistants access to a comprehensive bird database containing:

- **40,000+ bird records** with taxonomic classification
- **IUCN Red List conservation statuses**
- **Geographic distribution data**
- **Taxonomic authority information**
- **Extinction status and historical data**
- **Advanced query capabilities with JSONata**

## 🚀 Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Install via npm

```bash
npm install @kshayk/avibase-mcp
```

### Install from source

```bash
git clone <repository-url>
cd mcp-package
npm install
```

## ⚙️ Configuration

### For Claude Desktop

Add the server to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "avibase": {
      "command": "node",
      "args": ["path/to/mcp-server.js"]
    }
  }
}
```

### For other MCP clients

Run the server with stdio transport:

```bash
node mcp-server.js
```

## 🛠️ Available Tools

### 1. `get_bird_stats`
Get comprehensive statistics about the bird dataset.

**Usage**: `get_bird_stats()`

**Returns**: Total records, species count, families, orders, conservation categories

### 2. `search_birds`
Search for birds by scientific or common name with fuzzy matching.

**Parameters**:
- `query` (required): Search term for bird name
- `exact` (optional): Use exact matching (default: false)
- `limit` (optional): Maximum results (default: 20)

**Example**: `search_birds({query: "eagle", limit: 10})`

### 3. `get_birds_by_taxonomy`
Filter birds by taxonomic classification.

**Parameters**:
- `level` (required): Taxonomic level ("Order", "Family", or "Taxon_rank")
- `value` (required): Value to filter by (e.g., "Strigiformes" for owls)
- `limit` (optional): Maximum results (default: 50)

**Example**: `get_birds_by_taxonomy({level: "Order", value: "Strigiformes"})`

### 4. `get_conservation_status`
Get birds by IUCN Red List conservation status.

**Parameters**:
- `category` (required): IUCN category (CR, EN, VU, NT, LC, DD, EX, EW)
- `limit` (optional): Maximum results (default: 50)

**Example**: `get_conservation_status({category: "CR"})` (Critically Endangered)

### 5. `get_birds_by_region`
Find birds by geographic region or range.

**Parameters**:
- `region` (required): Geographic region to search
- `limit` (optional): Maximum results (default: 50)

**Example**: `get_birds_by_region({region: "Madagascar"})`

### 6. `get_extinct_species`
Get all extinct or possibly extinct bird species.

**Parameters**:
- `limit` (optional): Maximum results (default: 100)

### 7. `get_birds_by_authority`
Find birds described by a specific taxonomic authority.

**Parameters**:
- `authority` (required): Name of the taxonomic authority
- `limit` (optional): Maximum results (default: 50)

**Example**: `get_birds_by_authority({authority: "Linnaeus"})`

### 8. `get_random_birds`
Get a random sample of birds for exploration.

**Parameters**:
- `count` (optional): Number of random birds (default: 10, max: 50)

### 9. `get_bird_report`
Get a detailed report for a specific bird species.

**Parameters**:
- `scientific_name` (required): Scientific name of the bird

**Example**: `get_bird_report({scientific_name: "Aquila chrysaetos"})`

### 10. `custom_bird_query`
Perform complex queries with multiple filters.

**Parameters**:
- `filters` (required): Object with field-value pairs for filtering
- `limit` (optional): Maximum results (default: 50)

**Example**:
```javascript
custom_bird_query({
  filters: {
    Family: "Accipitridae",
    IUCN_Red_List_Category: ["CR", "EN"]
  }
})
```

### 11. `execute_jsonata_query`
Execute raw JSONata queries for advanced data analysis.

**Parameters**:
- `query` (required): JSONata query expression
- `limit` (optional): Maximum results for arrays (default: 50)

**Example**: `execute_jsonata_query({query: "$count($[Taxon_rank = \"species\"])"})`

## 📊 Data Coverage

### IUCN Conservation Categories
- **CR**: Critically Endangered
- **EN**: Endangered
- **VU**: Vulnerable
- **NT**: Near Threatened
- **LC**: Least Concern
- **DD**: Data Deficient
- **EX**: Extinct
- **EW**: Extinct in the Wild

### Taxonomic Coverage
- All major bird orders and families
- Species, subspecies, and other taxonomic ranks
- Historical taxonomic authorities
- Type localities and original descriptions

### Geographic Coverage
- Worldwide distribution data
- Regional filtering capabilities
- Range descriptions and habitat information

## 🔍 Example Use Cases

### Conservation Research
```javascript
// Find all critically endangered raptors
custom_bird_query({
  filters: {
    Family: "Accipitridae",
    IUCN_Red_List_Category: ["CR"]
  }
})
```

### Taxonomic Studies
```javascript
// Get all species described by Linnaeus
get_birds_by_authority({authority: "Linnaeus", limit: 100})
```

### Regional Biodiversity
```javascript
// Explore bird diversity in Australia
get_birds_by_region({region: "Australia", limit: 200})
```

### Data Analysis
```javascript
// Count endangered species by family
execute_jsonata_query({
  query: "$reduce($[IUCN_Red_List_Category = \"EN\"], function($acc, $val) { ($acc[$.Family] := ($acc[$.Family] ? $acc[$.Family] : 0) + 1; $acc) }, {})"
})
```

## 🌐 API Endpoint

The server connects to: `http://shayk.dev/avibase-mcp`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AviBase for providing comprehensive bird data
- Model Context Protocol team for the MCP framework
- The birding and ornithology community for their contributions to avian science

## 📞 Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Contact: Shay Kintzlinger

---

**Note**: This MCP server requires an internet connection to access the AviBase API endpoints. 