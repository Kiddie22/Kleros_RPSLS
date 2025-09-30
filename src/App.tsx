import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import Login from "./components/Login";

const App = () => {
  const walletAddress = useSelector(
    (state: RootState) => state.web3Reducer.walletAddress
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="font-bold text-2xl">RCPLS</h1>
      {!walletAddress ? <Login /> : <>Wallet address {walletAddress}</>}
    </div>
  );
};

export default App;
