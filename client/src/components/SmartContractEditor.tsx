import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, FileCode, Save, Rocket, Code2, Coins, Palette, Lock, Store, Vote, LockKeyhole } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TEMPLATES = {
  erc20: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address _to, uint256 _value) 
        public returns (bool success) 
    {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid recipient");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}`,
  erc721: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleNFT {
    string public name = "My NFT";
    string public symbol = "MNFT";
    
    uint256 private _tokenIds;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) public tokenURI;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    
    function mint(address _to, string memory _uri) 
        public returns (uint256) 
    {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        ownerOf[newTokenId] = _to;
        balanceOf[_to]++;
        tokenURI[newTokenId] = _uri;
        
        emit Transfer(address(0), _to, newTokenId);
        return newTokenId;
    }
    
    function transfer(address _to, uint256 _tokenId) public {
        require(ownerOf[_tokenId] == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid recipient");
        
        ownerOf[_tokenId] = _to;
        balanceOf[msg.sender]--;
        balanceOf[_to]++;
        
        emit Transfer(msg.sender, _to, _tokenId);
    }
}`,
  staking: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStaking {
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public stakingTime;
    uint256 public rewardRate = 10; // 10% APY
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    
    function stake() public payable {
        require(msg.value > 0, "Cannot stake 0");
        
        if (stakes[msg.sender] > 0) {
            claimReward();
        }
        
        stakes[msg.sender] += msg.value;
        stakingTime[msg.sender] = block.timestamp;
        emit Staked(msg.sender, msg.value);
    }
    
    function calculateReward(address _user) public view returns (uint256) {
        uint256 stakingDuration = block.timestamp - stakingTime[_user];
        uint256 reward = (stakes[_user] * rewardRate * stakingDuration) / (365 days * 100);
        return reward;
    }
    
    function claimReward() public {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No reward available");
        
        stakingTime[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(reward);
    }
    
    function withdraw() public {
        require(stakes[msg.sender] > 0, "No stake to withdraw");
        
        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = stakes[msg.sender] + reward;
        
        stakes[msg.sender] = 0;
        stakingTime[msg.sender] = 0;
        
        payable(msg.sender).transfer(totalAmount);
        emit Withdrawn(msg.sender, stakes[msg.sender], reward);
    }
}`,
  dao: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleDAO {
    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 deadline;
        bool executed;
    }
    
    mapping(address => bool) public members;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public votes;
    uint256 public proposalCount;
    uint256 public memberCount;
    
    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address voter);
    event ProposalExecuted(uint256 proposalId);
    
    function joinDAO() public {
        require(!members[msg.sender], "Already a member");
        members[msg.sender] = true;
        memberCount++;
    }
    
    function createProposal(string memory _description) public {
        require(members[msg.sender], "Not a member");
        
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            voteCount: 0,
            deadline: block.timestamp + 7 days,
            executed: false
        });
        
        emit ProposalCreated(proposalCount, _description);
    }
    
    function vote(uint256 _proposalId) public {
        require(members[msg.sender], "Not a member");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting ended");
        require(!votes[_proposalId][msg.sender], "Already voted");
        
        votes[_proposalId][msg.sender] = true;
        proposals[_proposalId].voteCount++;
        
        emit Voted(_proposalId, msg.sender);
    }
}`,
  marketplace: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleMarketplace {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    
    event Listed(uint256 indexed tokenId, address seller, uint256 price);
    event Sold(uint256 indexed tokenId, address buyer, uint256 price);
    event Cancelled(uint256 indexed tokenId);
    
    function list(uint256 _tokenId, uint256 _price) public {
        require(_price > 0, "Price must be greater than 0");
        
        listings[_tokenId] = Listing({
            seller: msg.sender,
            price: _price,
            active: true
        });
        
        emit Listed(_tokenId, msg.sender, _price);
    }
    
    function buy(uint256 _tokenId) public payable {
        Listing storage listing = listings[_tokenId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.active = false;
        payable(listing.seller).transfer(listing.price);
        
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit Sold(_tokenId, msg.sender, listing.price);
    }
    
    function cancel(uint256 _tokenId) public {
        Listing storage listing = listings[_tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");
        
        listing.active = false;
        emit Cancelled(_tokenId);
    }
}`,
  multisig: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleMultisig {
    address[] public owners;
    uint256 public required;
    
    struct Transaction {
        address to;
        uint256 value;
        bool executed;
        uint256 confirmations;
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    uint256 public transactionCount;
    
    event Submitted(uint256 txId);
    event Confirmed(uint256 txId, address owner);
    event Executed(uint256 txId);
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required");
        
        owners = _owners;
        required = _required;
    }
    
    function submitTransaction(address _to, uint256 _value) public {
        transactionCount++;
        transactions[transactionCount] = Transaction({
            to: _to,
            value: _value,
            executed: false,
            confirmations: 0
        });
        
        emit Submitted(transactionCount);
    }
    
    function confirmTransaction(uint256 _txId) public {
        require(!confirmations[_txId][msg.sender], "Already confirmed");
        
        confirmations[_txId][msg.sender] = true;
        transactions[_txId].confirmations++;
        
        emit Confirmed(_txId, msg.sender);
        
        if (transactions[_txId].confirmations >= required) {
            executeTransaction(_txId);
        }
    }
    
    function executeTransaction(uint256 _txId) private {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Already executed");
        
        txn.executed = true;
        payable(txn.to).transfer(txn.value);
        
        emit Executed(_txId);
    }
}`
};

type TemplateKey = keyof typeof TEMPLATES;

interface CompileResult {
  success: boolean;
  gasEstimate: number;
  contractSize: number;
}

export function SmartContractEditor() {
  const [code, setCode] = useState(TEMPLATES.erc20);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('erc20');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [constructorArgs, setConstructorArgs] = useState('');
  const [selectedShard, setSelectedShard] = useState('auto');
  const { toast } = useToast();

  const templateOptions = [
    { key: 'erc20' as TemplateKey, Icon: Coins, title: 'ERC-20 Token', desc: 'Standard fungible token' },
    { key: 'erc721' as TemplateKey, Icon: Palette, title: 'ERC-721 NFT', desc: 'Non-fungible token' },
    { key: 'staking' as TemplateKey, Icon: Lock, title: 'Staking', desc: 'Token staking with rewards' },
    { key: 'marketplace' as TemplateKey, Icon: Store, title: 'Marketplace', desc: 'NFT trading marketplace' },
    { key: 'dao' as TemplateKey, Icon: Vote, title: 'DAO Governance', desc: 'Decentralized governance' },
    { key: 'multisig' as TemplateKey, Icon: LockKeyhole, title: 'Multisig Wallet', desc: 'Multi-signature wallet' },
  ];

  const loadTemplate = (templateKey: TemplateKey) => {
    setCode(TEMPLATES[templateKey]);
    setSelectedTemplate(templateKey);
    setCompileResult(null);
    setShowDeploy(false);
    toast({
      title: "Template loaded",
      description: `${templateOptions.find(t => t.key === templateKey)?.title} template loaded successfully`,
    });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    
    // Simulate compilation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result: CompileResult = {
      success: true,
      gasEstimate: Math.floor(Math.random() * 500000) + 1000000,
      contractSize: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    };
    
    setCompileResult(result);
    setShowDeploy(true);
    setIsCompiling(false);
    
    toast({
      title: "Compilation successful!",
      description: "Contract compiled without errors",
    });
  };

  const handleDeploy = () => {
    toast({
      title: "Contract deployed!",
      description: "Your smart contract has been deployed to the blockchain",
    });
    setShowDeploy(false);
    setCompileResult(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Contract Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templateOptions.map((template) => (
              <button
                key={template.key}
                onClick={() => loadTemplate(template.key)}
                data-testid={`button-template-${template.key}`}
                className={`p-4 rounded-lg border-2 transition-all text-left hover-elevate active-elevate-2 ${
                  selectedTemplate === template.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <template.Icon className="h-6 w-6 mt-1" />
                  <div>
                    <div className="font-semibold">{template.title}</div>
                    <div className="text-sm text-muted-foreground">{template.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Contract Editor
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-save-contract">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={handleCompile} 
                disabled={isCompiling}
                size="sm"
                data-testid="button-compile-contract"
              >
                {isCompiling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Code2 className="h-4 w-4 mr-2" />
                )}
                {isCompiling ? 'Compiling...' : 'Compile'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Editor
              height="500px"
              language="sol"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compile Results */}
      {compileResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compilation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="font-semibold mb-2">Compilation successful!</div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gas estimate:</span>
                    <span className="font-mono font-semibold">{compileResult.gasEstimate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract size:</span>
                    <span className="font-mono font-semibold">{compileResult.contractSize} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimization:</span>
                    <Badge className="bg-green-600">Enabled</Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Deploy Form */}
      {showDeploy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deploy Contract
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="constructor-args">Constructor Arguments</Label>
              <Input
                id="constructor-args"
                placeholder="_initialSupply: 1000000"
                value={constructorArgs}
                onChange={(e) => setConstructorArgs(e.target.value)}
                data-testid="input-constructor-args"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shard-select">Shard Selection</Label>
              <Select value={selectedShard} onValueChange={setSelectedShard}>
                <SelectTrigger id="shard-select" data-testid="select-shard">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-select (AI Optimized)</SelectItem>
                  <SelectItem value="shard-7">Shard 7 (Load: 45%)</SelectItem>
                  <SelectItem value="shard-12">Shard 12 (Load: 58%)</SelectItem>
                  <SelectItem value="shard-23">Shard 23 (Load: 39%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertDescription>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gas Limit:</span>
                    <span className="font-mono font-semibold">2,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Price:</span>
                    <span className="font-mono font-semibold">0.8 Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Cost:</span>
                    <span className="font-mono font-semibold">0.98 BURN</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleDeploy} 
              className="w-full"
              data-testid="button-deploy-execute"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
