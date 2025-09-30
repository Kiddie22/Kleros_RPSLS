import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ethers } from "ethers";

export interface Web3State {
  walletAddress: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const initialState: Web3State = {
  walletAddress: "",
  provider: null,
  signer: null,
};

export const web3Slice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      console.log(state);
      state.walletAddress = action.payload;
    },
    setProvider: (
      state,
      action: PayloadAction<ethers.BrowserProvider | null>
    ) => {
      console.log(state);
      state.provider = action.payload;
    },
    setSigner: (state, action: PayloadAction<ethers.JsonRpcSigner | null>) => {
      console.log(state);
      state.signer = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setWalletAddress, setProvider, setSigner } = web3Slice.actions;

export default web3Slice.reducer;
