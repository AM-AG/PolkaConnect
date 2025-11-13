import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code2, BookOpen, Download, Github, Copy, Check, ExternalLink } from "lucide-react";
import { SiJavascript, SiPython, SiTypescript, SiNpm } from "react-icons/si";

const jsInstallCode = `npm install @polkaconnect/sdk`;

const jsExampleCode = `import { PolkaConnect } from '@polkaconnect/sdk';

async function main() {
  // Initialize the SDK
  const polka = new PolkaConnect({
    rpcUrl: 'wss://rpc.polkadot.io',
    network: 'polkadot'
  });

  // Connect wallet
  await polka.wallet.connect('polkadot-js');

  // Get available accounts
  const accounts = await polka.wallet.getAccounts();
  const address = accounts[0].address;

  // Get balance
  const balance = await polka.wallet.getBalance(address);
  console.log(\`Balance: \${balance} DOT\`);

  // Execute cross-chain transfer
  const transfer = await polka.transfer.xcm({
    destination: 'moonbeam',
    amount: '10.5',
    recipient: '0x1234...'
  });

  // Vote on governance proposal
  await polka.governance.vote({
    proposalId: 123,
    vote: 'aye',
    conviction: 'Locked1x'
  });
}

main().catch(console.error);`;

const pythonInstallCode = `pip install polkaconnect`;

const pythonExampleCode = `import asyncio
from polkaconnect import PolkaConnect

async def main():
    # Initialize the SDK
    polka = PolkaConnect(
        rpc_url='wss://rpc.polkadot.io',
        network='polkadot'
    )

    # Connect wallet
    await polka.wallet.connect('polkadot-js')

    # Get available accounts
    accounts = await polka.wallet.get_accounts()
    address = accounts[0]['address']

    # Get balance
    balance = await polka.wallet.get_balance(address)
    print(f"Balance: {balance} DOT")

    # Execute cross-chain transfer
    transfer = await polka.transfer.xcm(
        destination='moonbeam',
        amount='10.5',
        recipient='0x1234...'
    )

    # Vote on governance proposal
    await polka.governance.vote(
        proposal_id=123,
        vote='aye',
        conviction='Locked1x'
    )

if __name__ == '__main__':
    asyncio.run(main())`;

const apiMethods = [
  {
    category: "Wallet",
    methods: [
      { 
        name: "connect(walletType)", 
        description: "Connect to Polkadot.js or MetaMask wallet", 
        params: "walletType: 'polkadot-js' | 'metamask'",
        returns: "Promise<void>" 
      },
      { 
        name: "disconnect()", 
        description: "Disconnect active wallet", 
        params: "none",
        returns: "Promise<void>" 
      },
      { 
        name: "getBalance(address)", 
        description: "Get wallet balance for specific address", 
        params: "address: string",
        returns: "Promise<{ free: string, reserved: string, total: string }>" 
      },
      { 
        name: "getAccounts()", 
        description: "Get all available accounts", 
        params: "none",
        returns: "Promise<Array<{ address: string, name: string, source: string }>>" 
      },
    ]
  },
  {
    category: "Transfer",
    methods: [
      { 
        name: "xcm(params)", 
        description: "Execute cross-chain transfer via XCM", 
        params: "{ destination: string, amount: string, recipient: string }",
        returns: "Promise<{ hash: string, block: number, success: boolean }>" 
      },
      { 
        name: "estimateFee(params)", 
        description: "Estimate transfer fees", 
        params: "{ destination: string, amount: string }",
        returns: "Promise<{ fee: string, currency: string }>" 
      },
      { 
        name: "getHistory(address)", 
        description: "Get transfer history", 
        params: "address: string, limit?: number",
        returns: "Promise<Array<{ hash: string, from: string, to: string, amount: string, timestamp: number }>>" 
      },
    ]
  },
  {
    category: "Governance",
    methods: [
      { 
        name: "vote(params)", 
        description: "Vote on governance proposal", 
        params: "{ proposalId: number, vote: 'aye' | 'nay', conviction?: 'None' | 'Locked1x' | 'Locked2x' | 'Locked3x' | 'Locked4x' | 'Locked5x' | 'Locked6x', amount?: string }",
        returns: "Promise<{ hash: string, success: boolean, votingPower: string }>" 
      },
      { 
        name: "getProposals(status?)", 
        description: "Fetch all active proposals", 
        params: "status?: 'active' | 'passed' | 'failed'",
        returns: "Promise<Array<{ id: number, title: string, description: string, ayes: string, nays: string, status: string }>>" 
      },
      { 
        name: "getVotingPower(address)", 
        description: "Get voting power for address", 
        params: "address: string",
        returns: "Promise<{ power: string, conviction: string, locked: string }>" 
      },
    ]
  },
  {
    category: "Swap",
    methods: [
      { 
        name: "execute(params)", 
        description: "Execute token swap", 
        params: "{ fromToken: string, toToken: string, amount: string, slippage?: number }",
        returns: "Promise<{ hash: string, amountIn: string, amountOut: string, fee: string }>" 
      },
      { 
        name: "getQuote(params)", 
        description: "Get swap quote", 
        params: "{ fromToken: string, toToken: string, amount: string }",
        returns: "Promise<{ amountOut: string, priceImpact: number, fee: string }>" 
      },
      { 
        name: "getSupportedPairs()", 
        description: "List supported trading pairs", 
        params: "none",
        returns: "Promise<Array<{ base: string, quote: string, liquidity: string }>>" 
      },
    ]
  }
];

export default function Developer() {
  const [copiedJs, setCopiedJs] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);

  const copyToClipboard = (text: string, lang: 'js' | 'py') => {
    navigator.clipboard.writeText(text);
    if (lang === 'js') {
      setCopiedJs(true);
      setTimeout(() => setCopiedJs(false), 2000);
    } else {
      setCopiedPy(true);
      setTimeout(() => setCopiedPy(false), 2000);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" data-testid="text-page-title">
          <Code2 className="h-8 w-8" />
          Developer SDK
        </h1>
        <p className="text-muted-foreground">
          Integrate PolkaConnect functionality into your applications with our JavaScript and Python SDKs
        </p>
      </div>

      <Alert className="mb-6" data-testid="alert-sdk-info">
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Build cross-chain applications with ease. Our SDKs provide simple interfaces for wallet connection,
          XCM transfers, governance participation, and token swaps.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card data-testid="card-js-sdk">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiJavascript className="h-5 w-5 text-yellow-500" />
              JavaScript / TypeScript SDK
            </CardTitle>
            <CardDescription>NPM package with full TypeScript support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Installation</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(jsInstallCode, 'js')}
                  data-testid="button-copy-js-install"
                >
                  {copiedJs ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                <code className="text-sm font-mono">{jsInstallCode}</code>
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <SiTypescript className="h-3 w-3" />
                TypeScript
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <SiNpm className="h-3 w-3" />
                NPM
              </Badge>
              <Badge variant="outline">Tree-shakable</Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-python-sdk">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiPython className="h-5 w-5 text-blue-500" />
              Python SDK
            </CardTitle>
            <CardDescription>PyPI package with async/await support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Installation</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(pythonInstallCode, 'py')}
                  data-testid="button-copy-py-install"
                >
                  {copiedPy ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                <code className="text-sm font-mono">{pythonInstallCode}</code>
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Python 3.7+</Badge>
              <Badge variant="outline">Type Hints</Badge>
              <Badge variant="outline">Async/Await</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6" data-testid="card-code-examples">
        <CardHeader>
          <CardTitle>Quick Start Examples</CardTitle>
          <CardDescription>Get started in minutes with these code examples</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-language">
              <TabsTrigger value="javascript" data-testid="tab-javascript">
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" data-testid="tab-python">
                Python
              </TabsTrigger>
            </TabsList>
            <TabsContent value="javascript" className="mt-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(jsExampleCode, 'js')}
                  data-testid="button-copy-js-example"
                >
                  {copiedJs ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="text-sm font-mono whitespace-pre">{jsExampleCode}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(pythonExampleCode, 'py')}
                  data-testid="button-copy-py-example"
                >
                  {copiedPy ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="text-sm font-mono whitespace-pre">{pythonExampleCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card data-testid="card-api-reference">
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>Complete list of available methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {apiMethods.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.methods.map((method, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-md bg-muted/30 hover-elevate space-y-2"
                      data-testid={`api-method-${category.category.toLowerCase()}-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <code className="text-sm font-mono font-semibold text-primary">{method.name}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-semibold text-foreground">Parameters:</span>
                          <code className="ml-2 text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {method.params}
                          </code>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-foreground">Returns:</span>
                          <code className="ml-2 text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {method.returns}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card className="hover-elevate" data-testid="card-documentation">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides, tutorials, and API documentation
            </p>
            <Button variant="outline" className="w-full" asChild data-testid="button-view-docs">
              <a href="https://docs.polkaconnect.io" target="_blank" rel="noopener noreferrer">
                View Docs
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-github">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View source code, report issues, and contribute
            </p>
            <Button variant="outline" className="w-full" asChild data-testid="button-view-github">
              <a href="https://github.com/polkaconnect/sdk" target="_blank" rel="noopener noreferrer">
                View on GitHub
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-examples">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Example Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download ready-to-run example applications
            </p>
            <Button variant="outline" className="w-full" asChild data-testid="button-download-examples">
              <a href="https://github.com/polkaconnect/sdk/tree/main/examples" target="_blank" rel="noopener noreferrer">
                Download Examples
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
