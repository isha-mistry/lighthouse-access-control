import React from "react";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import "./App.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { buyInstance } from "./Contract";
import { BUY_ADDR } from "./Contract";

function App() {
  const encryptionSignature = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return {
      signedMessage: signedMessage,
      publicKey: address,
    };
  };

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  // Encrypt file

  const uploadFileEncrypted = async (file) => {
    const sig = await encryptionSignature();
    console.log("Upload file");
    const response = await lighthouse.uploadEncrypted(
      file,
      "4f19b20c.d2da2c4ccac94df3a38e7c31187d4eb1",
      sig.publicKey,
      sig.signedMessage,
      progressCallback
    );
    console.log("Response: ", response);

    //  Access Control
    const cid = response.data[0].Hash;

    // Conditions to add
    const conditions = [
      {
        id: 1,
        chain: "Mumbai",
        method: "getPurchaseStatus",
        standardContractType: "Custom",
        contractAddress: BUY_ADDR,
        returnValueTest: {
          comparator: "==",
          value: "1",
        },
        parameters: [],
        inputArrayType: [],
        outputType: "uint256",
      },
    ];

    const aggregator = "([1])";
    const { publicKey, signedMessage } = await encryptionSignature();

    const responseCondition = await lighthouse.applyAccessCondition(
      publicKey,
      cid,
      signedMessage,
      conditions,
      aggregator
    );

    console.log(responseCondition);
  };

  const buyDataset = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        if (!provider) {
          console.log("Metamask is not installed, please install!");
        }
        const con = await buyInstance();
        console.log("Hello");

        const tx = await con.buy({ value: ethers.utils.parseEther("0.0001") });

        console.log(tx);
        await tx.wait();

        const getResult = await con.getPurchaseStatus();
        console.log(getResult._hex);
      }
    } catch (e) {
      console.log("Error in buy function: ", e);
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <ConnectButton />
      <div style={{ paddingTop: "20px" }}>
        <input
          onChange={(e) => uploadFileEncrypted(e.target.files)}
          type="file"
        />

        <button onClick={buyDataset}>Buy</button>
        {/* <button onClick={accessConditions}>Get Access Conditions</button> */}
      </div>
    </div>
  );
}

export default App;
