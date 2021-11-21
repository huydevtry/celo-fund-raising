import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import fundraisingAbi from '../contract/fundraising.abi.json'

const ERC20_DECIMALS = 18
const MPContractAddress = "0xfb65566b4fEa0F919015E1fceCbA2e214f360524"

let kit
let contract
let projects = []



//Show list fund
function renderProject() {
    document.getElementById("fund-list").innerHTML = ""
    projects.forEach((_project) => {
        const newDiv = document.createElement("div")
        newDiv.className = "col-lg-4 col-sm-6 fund-card"
        newDiv.innerHTML = fundTemplate(_project)
        document.getElementById("fund-list").appendChild(newDiv)
    })
}

function fundTemplate(_project) {
    return  `<div class="card">
                <img src="${_project.image}" class="card-img-top fund-image" alt="...">
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
                <h5 class="card-title">${_project.name}</h5>
                <div class="probootstrap-date" style="argin-bottom: 0.5rem; color: #b3b2b2;" >2 days remain</div>
                <p class="card-text fund-des" style="color: #646262;">${_project.description}</p>
                <a href="#" class="btn btn-warning">Donate</a>
                </div>
            </div>`
}

//Add project
document
  .querySelector("#addProject")
  .addEventListener("click", async (e) => {
    const params = [
        document.getElementById("prjName").value,
        document.getElementById("prjDescription").value,
        document.getElementById("prjImage").value,
        document.getElementById("prjEndDate").value,
        new BigNumber(document.getElementById("prjTarget").value)
        .shiftedBy(ERC20_DECIMALS)
        .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
        const result = await contract.methods
          .addProject(...params)
          .send({ from: kit.defaultAccount })
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`🎉 You successfully added "${params[0]}".`)
      getProjects()
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
      try {
        notification("⚠️ Please approve this DApp to use it.")
        await window.celo.enable()
        notificationOff()
        const web3 = new Web3(window.celo)
        kit = newKitFromWeb3(web3)
  
        const accounts = await kit.web3.eth.getAccounts()
        kit.defaultAccount = accounts[0]
  
        contract = new kit.web3.eth.Contract(fundraisingAbi, MPContractAddress)
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

//Get Projects
const getProjects = async function() {
    const _projectCount = await contract.methods.getProjectCount().call()
    const _projects = []
    for (let i = 0; i < _projectCount; i++) {
        let _project = new Promise(async (resolve, reject) => {
          let p = await contract.methods.getProject(i).call()
          resolve({
            index: i,
            owner: p[0],
            name: p[1],
            description: p[2],
            image: p[3],
            endDate: p[4],
            target: new BigNumber(p[5]),
          })
        })
        _projects.push(_project)
      }
      projects = await Promise.all(_projects)
      renderProject()
    }


    window.addEventListener('load', async () => {
        notification("⌛ Loading...")
        await connectCeloWallet()
        await getBalance()
        await getProjects()
        notificationOff()
      });