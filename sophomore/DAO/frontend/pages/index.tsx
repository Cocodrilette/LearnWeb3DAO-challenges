import Head from "next/head";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { BaseContract, BigNumber, Contract, providers, Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

import styles from "../styles/Home.module.css";
import { CryptoDevsDAO } from "../../backend/typechain-types/contracts/CryptoDevsDAO.sol/CryptoDevsDAO";
import { FakeNFTMarketplace } from "../../backend/typechain-types/contracts/FakeNFTMartketplace.sol/FakeNFTMarketplace";
import {
  CRYPTODEVS_DAO_ABI,
  CRYPTODEVS_DAO_CONTRACT_ADDRESS,
  CRYPTODEVS_NFT_ABI,
  CRYPTODEVS_NFT_CONTRACT_ADDRESS,
} from "../constants";
import { formatEther } from "ethers/lib/utils";

type tabState = "" | "createProposal" | "viewProposals";

interface NFTContract extends BaseContract {
  balanceOf: (address: string) => Promise<BigNumber>;
}

interface Proposal {
  id: number;
  nftTokenId: string;
  deadline: Date;
  YESVotes: string;
  NOVotes: string;
  executed: boolean;
}

type VoteParam = "YES" | "NO";

type Vote = 0 | 1;

export default function Home() {
  // ETH balance of the DAO contract
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  // Number of proposals created in the DAO
  const [numProposals, setNumProposals] = useState("0");
  // Array of all proposals created in the DAO
  const [proposals, setProposals] = useState<Proposal[]>([]);
  // User's balance of CryptoDevs NFTs
  const [nftBalance, setNftBalance] = useState(0);
  // fake NFT token id to purchase. Used when creating a proposal
  const [isOwner, setIsOwner] = useState(false);
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  const [selectedTab, setSelectedTab] = useState<tabState>("");
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef<Web3Modal>();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner: boolean = false) => {
    const provider = await web3ModalRef.current?.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch to the Goerli network!");
      throw new Error("Please switch to the Goerli network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  /**
   * getOwner: gets the contract owner by connected address
   */
  const getDAOOwner = async () => {
    try {
      const signer = (await getProviderOrSigner(true)) as Signer;
      const contract = getDAOContractInstance(signer);
      const contractOwner = await contract.owner();
      const address = await signer.getAddress();
      if (address.toLowerCase() === contractOwner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * withdrawCoins: withdraws ether by calling
   * the withdraw function in the contract
   */
  const withdrawDAOEther = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDAOContractInstance(signer);
      setLoading(true);
      const tx = await contract.withdrawEther();
      await tx.wait();
      setLoading(false);
      getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error);
      setLoading(false);
    }
  };

  // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = (await getProviderOrSigner()) as Web3Provider;
      const balance = await provider.getBalance(
        CRYPTODEVS_DAO_CONTRACT_ADDRESS
      );
      setTreasuryBalance(balance.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
  const getNumsProposalsInDAO = async () => {
    try {
      const provider = (await getProviderOrSigner()) as Web3Provider;
      const contract = getDAOContractInstance(provider);
      const numProposals = await contract.numProposals();
      setNumProposals(numProposals.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the balance of the user's CryptoDevs NFTs and sets the `nftBalance` state variable
  const getUserNFTBalances = async () => {
    try {
      const signer = (await getProviderOrSigner(true)) as Signer;
      const contract = getCryptodevsNFTContractInstance(signer) as NFTContract;
      const address = await signer.getAddress();
      const NFTBalance = await contract.balanceOf(address);
      console.log(NFTBalance);
      setNftBalance(parseInt(NFTBalance.toString()));
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  const createProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDAOContractInstance(signer);
      setLoading(true);
      const tx = await contract.createProposal(fakeNftTokenId);
      await tx.wait();
      await getNumsProposalsInDAO();
      setLoading(false);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  // Helper function to fetch and parse one proposal from the DAO contract
  // Given the Proposal ID
  // and converts the returned data into a Javascript object with values we can use
  const fetchProposalById = async (id: number) => {
    try {
      const provider = (await getProviderOrSigner()) as Web3Provider;
      const contract = getDAOContractInstance(provider);
      const proposal = await contract.proposals(id);
      const parsedProposal: Proposal = {
        id,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString())),
        YESVotes: proposal.YESVotes.toString(),
        NOVotes: proposal.NOVotes.toString(),
        executed: proposal.executed,
      };
      return parsedProposal;
    } catch (error) {
      console.error();
    }
  };

  // Runs a loop `numProposals` times to fetch all proposals in the DAO
  // and sets the `proposals` state variable
  const fetchAllProposals = async () => {
    try {
      const proposals: Proposal[] = [];
      for (let i = 0; i < parseInt(numProposals); i++) {
        const proposal = (await fetchProposalById(i)) as Proposal;
        proposals.push(proposal);
      }
      setProposals(proposals);
    } catch (error) {
      console.error(error);
    }
  };

  // Calls the `voteOnProposal` function in the contract, using the passed
  // proposal ID and Vote
  const voteOnProposal = async (proposalId: number, _vote: VoteParam) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDAOContractInstance(signer);
      let vote: Vote = _vote === "YES" ? 0 : 1;
      setLoading(true);
      const tx = await contract.voteOnProposal(proposalId, vote);
      await tx.wait();
      await fetchAllProposals();
      setLoading(false);
    } catch (error) {}
  };

  // Calls the `executeProposal` function in the contract, using
  // the passed proposal ID
  const executeProposal = async (proposalId: number) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getDAOContractInstance(signer);
      setLoading(true);
      const tx = await contract.executeProposal(proposalId);
      await tx.wait();
      setLoading(false);
      await fetchAllProposals();
      await getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  const getDAOContractInstance = (
    providerOrSigner: Web3Provider | Signer
  ): CryptoDevsDAO => {
    return new Contract(
      CRYPTODEVS_DAO_CONTRACT_ADDRESS,
      CRYPTODEVS_DAO_ABI,
      providerOrSigner
    ) as CryptoDevsDAO;
  };

  const getCryptodevsNFTContractInstance = (
    providerOrSigner: Web3Provider | Signer
  ) => {
    return new Contract(
      CRYPTODEVS_NFT_CONTRACT_ADDRESS,
      CRYPTODEVS_NFT_ABI,
      providerOrSigner
    );
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {
        getUserNFTBalances();
        getDAOTreasuryBalance();
        getNumsProposalsInDAO();
        getDAOOwner();
      });
    }
  }, [walletConnected]);

  function renderTabs() {
    if (selectedTab === "createProposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "viewProposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.proposalCard}>
              <p>Proposal ID: {p.id}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Votes for: {p.YESVotes}</p>
              <p>Votes against: {p.NOVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.id, "YES")}
                  >
                    Vote YES
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.id, "NO")}
                  >
                    Vote NO
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.id)}
                  >
                    Execute Proposal {p.YESVotes > p.NOVotes ? "(YES)" : "(NO)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance}
            <br />
            Treasury Balance: {formatEther(treasuryBalance)} ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("createProposal")}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("viewProposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {isOwner ? (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <img className={styles.image} src="/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
