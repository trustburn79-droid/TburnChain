import { ethers } from "ethers";

export const TBC20_FACTORY_ADDRESS = "0x1000000000000000000000000000000000000001";
export const TBC721_FACTORY_ADDRESS = "0x1000000000000000000000000000000000000002";
export const TBC1155_FACTORY_ADDRESS = "0x1000000000000000000000000000000000000003";

export const TBC20_FACTORY_ABI = [
  "function createToken(string name, string symbol, uint256 initialSupply, uint8 decimals, bool mintable, bool burnable, bool pausable, uint256 maxSupply, bool aiOptimized, bool quantumResistant) external returns (address)",
  "function getDeployedTokens(address deployer) external view returns (address[])",
  "function tokenInfo(address token) external view returns (string name, string symbol, uint256 totalSupply, uint8 decimals, address owner)",
  "event TokenCreated(address indexed token, address indexed owner, string name, string symbol, uint256 initialSupply)",
];

export const TBC721_FACTORY_ABI = [
  "function createNFT(string name, string symbol, string baseUri, uint256 maxSupply, uint96 royaltyPercentage, address royaltyRecipient, bool aiOptimized, bool quantumResistant) external returns (address)",
  "function getDeployedNFTs(address deployer) external view returns (address[])",
  "function nftInfo(address nft) external view returns (string name, string symbol, string baseUri, uint256 totalSupply, address owner)",
  "event NFTCreated(address indexed nft, address indexed owner, string name, string symbol, uint256 maxSupply)",
];

export const TBC1155_FACTORY_ABI = [
  "function createMultiToken(string name, string uri, bool mintable, bool burnable, bool aiOptimized, bool quantumResistant) external returns (address)",
  "function getDeployedMultiTokens(address deployer) external view returns (address[])",
  "function multiTokenInfo(address token) external view returns (string name, string uri, address owner)",
  "event MultiTokenCreated(address indexed token, address indexed owner, string name)",
];

export const TBC20_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function pause() external",
  "function unpause() external",
  "function owner() external view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export const TBC721_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function mint(address to, string uri) external returns (uint256)",
  "function burn(uint256 tokenId) external",
  "function totalSupply() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
];

export const TBC1155_TOKEN_ABI = [
  "function uri(uint256 id) external view returns (string)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[])",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address account, address operator) external view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external",
  "function mint(address to, uint256 id, uint256 amount, bytes data) external",
  "function mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data) external",
  "function burn(address account, uint256 id, uint256 amount) external",
  "function owner() external view returns (address)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
];

export interface TokenDeployParams {
  standard: "TBC-20" | "TBC-721" | "TBC-1155";
  name: string;
  symbol: string;
  totalSupply?: string;
  decimals?: number;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  maxSupply?: string;
  baseUri?: string;
  royaltyPercentage?: number;
  royaltyRecipient?: string;
  aiOptimized?: boolean;
  quantumResistant?: boolean;
}

export function encodeTokenDeployment(params: TokenDeployParams): { to: string; data: string } {
  const abiCoder = new ethers.AbiCoder();
  
  switch (params.standard) {
    case "TBC-20": {
      const iface = new ethers.Interface(TBC20_FACTORY_ABI);
      const initialSupply = ethers.parseUnits(params.totalSupply || "1000000", params.decimals || 18);
      const maxSupply = params.maxSupply ? ethers.parseUnits(params.maxSupply, params.decimals || 18) : 0n;
      
      const data = iface.encodeFunctionData("createToken", [
        params.name,
        params.symbol,
        initialSupply,
        params.decimals || 18,
        params.mintable ?? false,
        params.burnable ?? true,
        params.pausable ?? false,
        maxSupply,
        params.aiOptimized ?? true,
        params.quantumResistant ?? true,
      ]);
      
      return { to: TBC20_FACTORY_ADDRESS, data };
    }
    
    case "TBC-721": {
      const iface = new ethers.Interface(TBC721_FACTORY_ABI);
      const royaltyBps = Math.floor((params.royaltyPercentage || 0) * 100);
      
      const data = iface.encodeFunctionData("createNFT", [
        params.name,
        params.symbol,
        params.baseUri || "",
        params.maxSupply || 10000,
        royaltyBps,
        params.royaltyRecipient || ethers.ZeroAddress,
        params.aiOptimized ?? true,
        params.quantumResistant ?? true,
      ]);
      
      return { to: TBC721_FACTORY_ADDRESS, data };
    }
    
    case "TBC-1155": {
      const iface = new ethers.Interface(TBC1155_FACTORY_ABI);
      
      const data = iface.encodeFunctionData("createMultiToken", [
        params.name,
        params.baseUri || "",
        params.mintable ?? true,
        params.burnable ?? true,
        params.aiOptimized ?? true,
        params.quantumResistant ?? true,
      ]);
      
      return { to: TBC1155_FACTORY_ADDRESS, data };
    }
    
    default:
      throw new Error(`Unsupported token standard: ${params.standard}`);
  }
}

export function decodeTokenCreatedEvent(standard: "TBC-20" | "TBC-721" | "TBC-1155", logs: any[]): string | null {
  let eventSignature: string;
  let iface: ethers.Interface;
  
  switch (standard) {
    case "TBC-20":
      iface = new ethers.Interface(TBC20_FACTORY_ABI);
      eventSignature = "TokenCreated";
      break;
    case "TBC-721":
      iface = new ethers.Interface(TBC721_FACTORY_ABI);
      eventSignature = "NFTCreated";
      break;
    case "TBC-1155":
      iface = new ethers.Interface(TBC1155_FACTORY_ABI);
      eventSignature = "MultiTokenCreated";
      break;
    default:
      return null;
  }
  
  for (const log of logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === eventSignature) {
        return parsed.args[0] as string;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

export async function getTokenBalance(
  provider: ethers.Provider,
  tokenAddress: string,
  ownerAddress: string,
  standard: "TBC-20" | "TBC-721" | "TBC-1155",
  tokenId?: number
): Promise<string> {
  switch (standard) {
    case "TBC-20": {
      const contract = new ethers.Contract(tokenAddress, TBC20_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(ownerAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    }
    case "TBC-721": {
      const contract = new ethers.Contract(tokenAddress, TBC721_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(ownerAddress);
      return balance.toString();
    }
    case "TBC-1155": {
      if (tokenId === undefined) throw new Error("Token ID required for TBC-1155");
      const contract = new ethers.Contract(tokenAddress, TBC1155_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(ownerAddress, tokenId);
      return balance.toString();
    }
    default:
      throw new Error(`Unsupported standard: ${standard}`);
  }
}
