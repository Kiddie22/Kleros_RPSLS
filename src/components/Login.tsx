import { Button } from "./ui/button";
import { useWeb3 } from "../contexts/Web3Context";

const Login = () => {
  const { walletAddress, connectWallet } = useWeb3();

  return (
    <div>
      {!walletAddress ? (
        <>
          <p>Please connect your wallet to begin</p>
          <Button onClick={connectWallet} variant="outline">
            Connect Wallet
          </Button>
        </>
      ) : (
        <p>Wallet address {walletAddress}</p>
      )}
    </div>
  );
};

export default Login;
