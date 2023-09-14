import { ethers } from "ethers";
import BuyABI from "./contract/BuyABI.json";

// export const BUY_ADDRESS = "0x528cA991113B55F52Ec43556363d36ceBA3b1489";
export const BUY_ADDRESS = "0x2e86F9b17e861a418037B556039a3E1Db70AaAD9";
export const BUY_ADDR = "0x5ce881C5b190E956D3e012513fbe9d91789A4A19";

export const buyInstance = async () => {
  const { ethereum } = window;
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    if (!provider) {
      console.log("Metamask is not installed, please install!");
    }
    const con = new ethers.Contract(BUY_ADDR, BuyABI, signer);
    // console.log(con);
    return con;
  } else {
    console.log("error");
  }
};
