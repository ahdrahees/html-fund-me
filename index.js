// import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js"
import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected 🙂"
    } else {
        connectButton.innerHTML = "Please install Metamask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value

    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provide / connection to the blockchain
        // signer / wallet / someone with gas to
        // contract that we are interacting with
        // ^ ABI && address
        const provider = new ethers.providers.Web3Provider(window.ethereum) //  here Web3Provider is the metamask, this line of code is essential because this line pop up the metamask wallet
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // hey wait for the this tx to finsh
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // create a listener for the blockchian
    //listen for the transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()

            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdraw successful!")
        } catch (error) {
            console.log(error)
        }
    }
}
