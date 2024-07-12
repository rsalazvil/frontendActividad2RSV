import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { abi } from "./assets/abis/CFETokenAbi";
import { CFE_CONTRACT_ADDRESS } from "./constants";
import { useState } from "react";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "./main";
import { toast } from "react-toastify";

function App() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const { data, isLoading, refetch } = useReadContract({
    abi,
    address: CFE_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync } = useWriteContract();

  const handleMint = async () => {
    setIsMinting(true);

    try {
      const txHash = await writeContractAsync({
        abi,
        address: CFE_CONTRACT_ADDRESS,
        functionName: "mint",
        args: [address, 150],
      });

      await waitForTransactionReceipt(config, {
        confirmations: 1,
        hash: txHash,
      });

      setIsMinting(false);
      toast.success("Minted 150 CFE tokens");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to mint CFE tokens");
      setIsMinting(false);
    }
  };

  return (
    <main className="w-full flex justify-center items-center min-h-svh flex-col">
      <h1 className="text-4xl font-bold">🚀 CFE Token Faucet 🚀</h1>
      <div className="my-5 p-4 flex flex-col gap-5 rounded border border-gray-300 items-center">
        <ConnectButton />
        {isConnected ? (
          <div className="space-y-5">
            <p>
              💰 <span>Balance:</span>{" "}
              {isLoading ? (
                <span className="opacity-50">Loading...</span>
              ) : (
                data?.toString()
              )}
            </p>

            <button
              className="px-3 py-1 font-semibold bg-slate-700 rounded-xl disabled:opacity-50"
              disabled={isMinting}
              onClick={handleMint}
            >
              {isMinting ? "Minting..." : "Mint tokens"}
            </button>
          </div>
        ) : (
          <div>Please connect your wallet to use the faucet</div>
        )}
      </div>
    </main>
  );
}

export default App;