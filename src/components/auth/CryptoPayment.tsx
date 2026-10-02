import React, { useState } from 'react';
import { ethers } from 'ethers';
import { supabase } from '../../services/supabaseClient';

type EthereumProvider = ConstructorParameters<typeof ethers.BrowserProvider>[0];

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Standard BEP-20 (ERC-20) ABI for the `transfer` function
const USDT_ABI = [
  "function transfer(address to, uint amount) returns (bool)"
];

export function CryptoPayment({ userEmail, onActivated }: { userEmail: string; onActivated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receiverAddress = import.meta.env.VITE_CRYPTO_RECEIVER_ADDRESS;
  const usdtContractAddress = import.meta.env.VITE_USDT_BSC_CONTRACT;
  const fee = import.meta.env.VITE_ACTIVATION_FEE_USDT || "10";

  const handlePayment = async () => {
    setError(null);
    setLoading(true);

    try {
      const ethereum = window.ethereum;
      if (!ethereum) {
        throw new Error("MetaMask or a Web3 wallet is not installed. Please install it to pay with Crypto.");
      }

      // 1. Connect to MetaMask
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // 2. Ensure they are on BNB Smart Chain (Chain ID: 56 or 0x38)
      const network = await provider.getNetwork();
      if (network.chainId !== 56n) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // Hex for 56
          });
        } catch (switchError: any) {
          throw new Error("Please switch your wallet to the Binance Smart Chain (BSC) network to pay in USDT.");
        }
      }

      // 3. Setup USDT Contract
      const usdtContract = new ethers.Contract(usdtContractAddress, USDT_ABI, signer);
      
      // USDT on BSC has 18 decimals (usually).
      const amountToPay = ethers.parseUnits(fee, 18);

      // 4. Send Transaction
      console.log(`Sending ${fee} USDT to ${receiverAddress}...`);
      const tx = await usdtContract.transfer(receiverAddress, amountToPay);
      
      console.log("Transaction sent! Waiting for confirmation...", tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Payment successful!
        console.log("Payment confirmed!");
        
        // 5. Update user in Supabase
        const { error: dbError } = await supabase
          .from('profiles')
          .update({ is_active: true, tx_hash: tx.hash })
          .eq('email', userEmail);
          
        if (dbError) throw new Error("Payment succeeded but failed to update account. Please contact support.");
        
        onActivated();
      } else {
        throw new Error("Transaction failed on the blockchain.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">Activate Your Account</h2>
      <p className="text-slate-600">
        To use the BeGoo translation engine, please make a one-time payment of <strong>${fee} USDT</strong> on the BNB Smart Chain (BSC).
      </p>
      
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex justify-center items-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Processing Payment...</span>
        ) : (
          <span>Pay ${fee} USDT with MetaMask</span>
        )}
      </button>
      <p className="text-xs text-slate-400 font-mono break-all mt-2">
        Receiver: {receiverAddress}
      </p>
    </div>
  );
}
