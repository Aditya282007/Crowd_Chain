import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Wallet, ChevronDown, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletSimulatorProps {
  onInvest?: (amount: string) => void;
  projectId?: string;
  className?: string;
}

export function WalletSimulator({ onInvest, projectId, className }: WalletSimulatorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [balance, setBalance] = useState('1000.00');
  const [investAmount, setInvestAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const walletTypes = [
    { 
      name: 'MetaMask', 
      icon: '🦊', 
      description: 'Most popular Web3 wallet',
      balance: '1000.00 LavaCoins'
    },
    { 
      name: 'Rainbow', 
      icon: '🌈', 
      description: 'Beautiful & user-friendly',
      balance: '875.50 LavaCoins'
    },
    { 
      name: 'Coinbase Wallet', 
      icon: '💎', 
      description: 'Secure & trusted',
      balance: '1250.75 LavaCoins'
    },
    { 
      name: 'WalletConnect', 
      icon: '🔗', 
      description: 'Connect any wallet',
      balance: '950.25 LavaCoins'
    }
  ];

  const connectWallet = async (walletType: string) => {
    try {
      setIsInvesting(true);
      
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock address
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setAddress(mockAddress);
      
      const selectedWalletData = walletTypes.find(w => w.name === walletType);
      setBalance(selectedWalletData?.balance.replace(' LavaCoins', '') || '1000.00');
      setSelectedWallet(walletType);
      setIsConnected(true);
      setShowWallets(false);
      
      // Call backend to register wallet connection
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ walletType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect wallet');
      }
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  const handleInvest = async () => {
    if (!investAmount || !onInvest) return;
    
    setIsInvesting(true);
    console.log('Investing:', investAmount);
    
    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onInvest(investAmount);
      
      // Update balance after investment
      const newBalance = (parseFloat(balance) - parseFloat(investAmount)).toFixed(2);
      setBalance(newBalance);
      setInvestAmount('');
      
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setSelectedWallet('');
    setAddress('');
    setBalance('1000.00');
    setInvestAmount('');
  };

  if (!isConnected) {
    return (
      <Card className={cn("wallet-simulator border-2 border-black", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-black">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your wallet to invest in this project
          </p>
          
          <Button 
            onClick={() => setShowWallets(!showWallets)}
            className="w-full bg-black text-white font-bold hover:bg-gray-800"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Choose Wallet
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>

          {showWallets && (
            <div className="space-y-2 mt-4">
              {walletTypes.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full justify-start p-4 h-auto border-2 border-black hover:bg-yellow-100"
                  onClick={() => connectWallet(wallet.name)}
                  disabled={isInvesting}
                >
                  <span className="text-xl mr-3">{wallet.icon}</span>
                  <div className="text-left">
                    <div className="font-bold">{wallet.name}</div>
                    <div className="text-xs text-gray-500">{wallet.description}</div>
                    <div className="text-xs font-bold text-green-600">{wallet.balance}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          {isInvesting && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-2 text-sm">Connecting to {selectedWallet}...</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("wallet-simulator border-2 border-black", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-black">
          <div className="flex items-center gap-2">
            <span className="text-xl">{walletTypes.find(w => w.name === selectedWallet)?.icon}</span>
            {selectedWallet}
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-800">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="p-3 bg-gray-50 border-2 border-black rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600">WALLET ADDRESS</p>
              <p className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyAddress}
              className="border-black"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="p-3 bg-gray-50 border-2 border-black rounded">
          <p className="text-xs font-bold text-gray-600">BALANCE</p>
          <p className="text-2xl font-black">{balance} LavaCoins</p>
          <p className="text-xs text-gray-500">≈ ${(parseFloat(balance) * 3.50).toLocaleString()} USD</p>
        </div>

        {/* Investment Section */}
        {projectId && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                INVESTMENT AMOUNT (ETH)
              </label>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border-2 border-black rounded font-mono text-lg"
                min="0"
                max={balance}
                step="0.01"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setInvestAmount((parseFloat(balance) * 0.25).toFixed(2))}
                variant="outline"
                size="sm"
                className="border-black"
              >
                25%
              </Button>
              <Button
                onClick={() => setInvestAmount((parseFloat(balance) * 0.5).toFixed(2))}
                variant="outline"
                size="sm"
                className="border-black"
              >
                50%
              </Button>
              <Button
                onClick={() => setInvestAmount((parseFloat(balance) * 0.75).toFixed(2))}
                variant="outline"
                size="sm"
                className="border-black"
              >
                75%
              </Button>
              <Button
                onClick={() => setInvestAmount(balance)}
                variant="outline"
                size="sm"
                className="border-black"
              >
                MAX
              </Button>
            </div>

            <Button
              onClick={handleInvest}
              disabled={!investAmount || parseFloat(investAmount) <= 0 || parseFloat(investAmount) > parseFloat(balance) || isInvesting}
              className="w-full bg-black text-white font-bold hover:bg-gray-800 py-3"
            >
              {isInvesting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Transaction...
                </>
              ) : (
                `Invest ${investAmount || '0'} LavaCoins`
              )}
            </Button>
          </div>
        )}

        {/* Wallet Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-black"
              onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View on Etherscan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}