const provider = new ethers.providers.Web3Provider(window.ethereum, "goerli");
const moodContractAddress = "0xD29f93a766E4BC05c3CDEb222f8A6AB7e965c305";
const jsonF = ethers.utils.fetchJson;
const moodContractAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "_mood",
        type: "string",
      },
    ],
    name: "MoodSetUp",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_mood",
        type: "string",
      },
    ],
    name: "setMood",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMood",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const currentMood = document.getElementById("currentMood");

let moodContract;
let signer;

provider.send("eth_requestAccounts", []).then(() => {
  provider.listAccounts().then((accounts) => {
    signer = provider.getSigner(accounts[0]);
    // console.log(signer); // todo: uncomment
    moodContract = new ethers.Contract(
      moodContractAddress,
      moodContractAbi,
      signer
    );
    // console.log(moodContract); // todo: uncomment
  });
});

// console.log(provider); // todo: uncomment

async function getMood() {
  const mood = await moodContract.getMood();
  currentMood.textContent = mood;
  console.log(mood);
}

async function setMood() {
  const mood = document.getElementById("mood").value;
  const setMoodPromise = await moodContract.setMood(mood);
  console.log(setMoodPromise);
}
