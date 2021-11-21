
// import marketplaceAbi from '../contract/marketplace.abi.json'
// import erc20Abi from "../contract/erc20.abi.json"


// const MPContractAddress = "0xb21dA83eFFBeee50e7eDb8bAD1A7BD03fd99E8e5"
// const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"


// let contract
//let funds = []

import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"

const ERC20_DECIMALS = 18

let kit

const funds = [
    {
        name: "Lũ lụt",
        image: "https://uicookies.com/demo/theme/charity/img/img_sm_1.jpg",
        description: "ho tro lut lut mien trung",
        owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
        endDate: "",
        target: 1000
    }
    
]


//Show list fund
function getFund() {
    document.getElementById("fund-list").innerHTML = ""
    funds.forEach((_fund) => {
        const newDiv = document.createElement("div")
        newDiv.className = "col-lg-4 col-sm-6 fund-card"
        newDiv.innerHTML = fundTemplate(_fund)
        document.getElementById("fund-list").appendChild(newDiv)
    })
}

function fundTemplate(_fund) {
    return  `<div class="card">
                <img src="${_fund.image}" class="card-img-top fund-image" alt="...">
                <div class="progress" style="margin: 1rem;">
                    <div class="progress-bar bg-warning" role="progressbar" style="width: 25%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">25%</div>
                </div>
                <div class="row mb30" style="padding: 0 1rem;">
                    <div class="col-md-6" style="color: #01c632">
                        <span> 25 </span> cUSD
                    </div>
                    <div class="col-md-6" style="text-align: right; color: #01c632">
                        <span> 100  </span> cUSD
                    </div>
                </div>
                <div class="card-body">
                <h5 class="card-title">${_fund.name}</h5>
                <div class="probootstrap-date" style="argin-bottom: 0.5rem; color: #b3b2b2;" >2 days remain</div>
                <p class="card-text fund-des" style="color: #646262;">${_fund.description}</p>
                <a href="#" class="btn btn-warning">Donate</a>
                </div>
            </div>`
}

//Add project
document
  .querySelector("#addProject")
  .addEventListener("click", () => {
    const _fund = {
      owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
      name: document.getElementById("prjName").value,
      image: document.getElementById("prjImage").value,
      description: document.getElementById("prjDescription").value,
      target: document.getElementById("prjTarget").value,
      endDate: document.getElementById("prjEndDate").value,
      index: funds.length,
    }
    funds.push(_fund)
    notification(`🎉 You successfully added "${_fund.endDate}".`)
    getFund()
  })

//Notification handle
function notification(_text) {
    document.querySelector(".alert").style.display = "block"
    document.querySelector("#notification").textContent = _text
}

function notificationOff() {
    document.querySelector(".alert").style.display = "none"
}

//Connect Wallet
const connectCeloWallet = async function () {
    if (window.celo) {
        notification("⚠️ Please approve this DApp to use it.")
        try {
            await window.celo.enable()
            notificationOff()

            const web3 = new Web3(window.celo)
            kit = newKitFromWeb3(web3)

            const accounts = await kit.web3.eth.getAccounts()
            kit.defaultAccount = accounts[0]

        } catch (error) {
            notification(`⚠️ ${error}.`)
        }
    } else {
        notification("⚠️ Please install the CeloExtensionWallet.")
    }
}

//Get Balance
const getBalance = async function () {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
    document.querySelector("#balance").textContent = cUSDBalance
  }


window.addEventListener("load", async () => {
    notification("⌛ Loading...")
    // await connectCeloWallet()
    // await getBalance()
    
   getFund()
    notificationOff()
})