import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { setWalletAddress } from "../redux/web3Slice";
import type { RootState } from "../redux/store";

const Login = () => {
  const walletAddress = useSelector(
    (state: RootState) => state.web3Reducer.walletAddress
  );
  const dispatch = useDispatch();

  const requestAccount = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        dispatch(setWalletAddress(accounts[0]));
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Metamask not installed");
    }
  };

  const connect = async () => {
    if (window.ethereum) {
      await requestAccount();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log({ provider, signer });
    }
  };

  return (
    <div>
      {!walletAddress ? (
        <button
          onClick={connect}
          className="bg-blue-800 px-4 py-3 text-white font-medium rounded-xl cursor-pointer"
        >
          Connect Wallet
        </button>
      ) : (
        <>Wallet address {walletAddress}</>
      )}
    </div>
  );
};

export default Login;
