import { useState, useCallback } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';

const CLT_ADDRESS = '0xAE1e1b4D8f590371b77bEe27257ef038D4B835A1';
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export default function useWallet() {
  const [address, setAddress] = useState(null);
  const [cltBalance, setCltBalance] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask.');
      setConnecting(false);
      return null;
    }
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const addr = accounts[0];
    setAddress(addr);

    // Read CLT balance on Ethereum mainnet
    const contract = new Contract(CLT_ADDRESS, ERC20_ABI, provider);
    const [raw, decimals] = await Promise.all([
      contract.balanceOf(addr),
      contract.decimals(),
    ]);
    const balance = parseFloat(formatUnits(raw, decimals));
    setCltBalance(balance);
    setConnecting(false);
    return { address: addr, balance };
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setCltBalance(null);
  }, []);

  return { address, cltBalance, connecting, error, connect, disconnect };
}