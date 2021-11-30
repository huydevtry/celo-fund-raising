import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import fundraisingAbi from '../contract/fundraising.abi.json'
import erc20Abi from "../contract/erc20.abi.json"


const ERC20_DECIMALS = 18
const MPContractAddress = "0x230aeDbb9485dd0a11763177cB68C53B6973958B"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let projects = []

//Render list project
function renderProject() {
  let _target = 0;
  let _balance = 0;
  document.getElementById("fund-list").innerHTML = ""
  projects.forEach((_project) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-lg-4 col-sm-6 fund-card"
    newDiv.innerHTML = fundTemplate(_project)
    document.getElementById("fund-list").appendChild(newDiv)
  })
}

//Template project
function fundTemplate(_project) {
  const _balance = _project.balance.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  const _target = _project.target.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  //Progress bar
  const _progress = ((_balance / _target) * 100).toFixed(2)
  let donateSection
  //Check deadline
  if (isEndProject(_project.endDate) == true) {
    donateSection = `<div class="row">
                        <h5 style="color: #b3b2b2"> Project has ended!</h5>
                      </div>`
  } else {
    donateSection = `<div class="row">
                      <div class="col" style="width: 50%">
                        <input class="form-control" type="number" name="amountDonate" value="" id="amountDonate-${_project.index}">
                      </div>
                      <div class="col" style="width: 50%">
                        <a class="btn btnDonate btn-warning" id=${_project.index} data-bs-toggle="modal"
                        data-bs-target="#confirmDonate">Donate</a>
                      </div>
                    </div>`
  }
  return `<div class="card">
                <img src="${_project.image}" class="card-img-top fund-image" alt="...">
                <div class="progress" style="margin: 1rem;">
                    <div class="progress-bar bg-warning" role="progressbar" id="progressBar" style="width: ${_progress}%;">
                        ${_progress}%</div>
                </div>
                <div class="row mb30 d-flex flex-wrap" style="padding: 0 1rem;">
                    <div class="col-6 d-flex align-items-center" style="color: #01c632">
                        <span> ${_balance} </span> cUSD
                    </div>
                    <div class="col-6 d-flex align-items-center justify-content-end" style="text-align: right; color: #01c632">
                        <span> ${_target} </span> cUSD
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${_project.name}</h5>
                    <div class="probootstrap-date" style="margin-bottom: 0.5rem; color: #b3b2b2; display: flex; align-items: center;">
                        <ion-icon name="time" style="margin-right: 0.5rem;" ></ion-icon>${_project.endDate}
                    </div>
                    <p class="card-text fund-des" style="color: #646262;">${_project.description}</p>
                      ${donateSection}
                    </div>
                    
                </div>
            </div>`
}

document.querySelector("#connectWallet").addEventListener("click", async () => {
  //Connect Wallet
  await connectCeloWallet()
  //Show "Add project" button
  document.getElementById('addPrjSection').style.display = "block"
  //Get balance
  await getBalance()
  //Get list project
  await getProjects()
})


//Add project
document
  .querySelector("#addProject")
  .addEventListener("click", async (e) => {
    //Receive form data
    const prjName = document.getElementById("prjName").value
    const prjDescription = document.getElementById("prjDescription").value
    const prjImage = document.getElementById("prjImage").value
    const prjEndDate = document.getElementById("prjEndDate").value
    const prjTarget = document.getElementById("prjTarget").value
    if (prjName == "" || prjDescription == "" || prjImage == "" || prjEndDate == "" ||
      prjTarget == "") {
      notification(`Please fill in all the required fields.`, 'error')
      return
    }

    const params = [
      prjName,
      prjDescription,
      prjImage,
      prjEndDate,
      new BigNumber(prjTarget).shiftedBy(ERC20_DECIMALS).toString()
    ]
    notification(`Adding "${params[0]}"...`)
    try {
      //Call function add project
      await contract.methods
        .addProject(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`${error}.`)
    }
    notification(`You successfully added project "${prjName}".`, 'success')

    //Reset form
    document.getElementById("prjName").value = ""
    document.getElementById("prjDescription").value = ""
    document.getElementById("prjImage").value = ""
    document.getElementById("prjEndDate").value = ""
    document.getElementById("prjTarget").value = ""
    getProjects()

  })

//Notification handle
function notification(_text, type = 'info') {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text

  if (type == "success") {
    document.querySelector(".alert").className = 'alert alert-success'
  }
  if (type == "error") {
    document.querySelector(".alert").className = 'alert alert-danger'
  }
  if (type == "info") {
    document.querySelector(".alert").className = 'alert alert-primary'
  }
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

//Connect Wallet
const connectCeloWallet = async function () {
  notification("Connecting...", 'info')
  if (window.celo) {
    try {
      //Show conenct wallet button
      document.getElementById('connectWallet').style.display = "block"
      notification("Please approve this DApp to use it.")
      await window.celo.enable()
      notificationOff()
      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(fundraisingAbi, MPContractAddress)
      document.getElementById('connectWallet').style.display = "none"
    } catch (error) {
      notification(`${error}.`, 'error')
    }
  } else {
    notification("Please install the CeloExtensionWallet.")
  }
}

//Get Balance
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance + " cUSD"
  document.querySelector('#balance').style.display = "block"

}

//Get Projects
const getProjects = async function () {
  const _projectCount = await contract.methods.getProjectCount().call()
  const _projects = []
  for (let i = 0; i < _projectCount; i++) {
    let _project = new Promise(async (resolve, reject) => {
      //Project information
      let p = await contract.methods.getProject(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        description: p[2],
        image: p[3],
        endDate: p[4],
        target: new BigNumber(p[5]),
        balance: new BigNumber(p[6])
      })
    })
    _projects.push(_project)
  }
  projects = await Promise.all(_projects)
  renderProject()
}

//Approve function
async function approve(_amount) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _amount)
    .send({ from: kit.defaultAccount })
  return result
}

//Donate
document.querySelector("#fund-list").addEventListener("click", async (e) => {
  if (e.target.className.includes("btnDonate")) {
    const index = e.target.id

    //Check deadline
    if (isEndProject(projects[index].endDate)) {
      notification(`The project has end. Thank you very much!`, 'info')
      return
    }

    //Get amount donate
    const amount = new BigNumber(document.getElementById("amountDonate-" + index).value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()

    notification("Waiting for payment approval...", 'info')
    try {
      await approve(amount)
    } catch (error) {
      notification(`${error}.`, 'error')
    }
    notification(`Awaiting payment for "${projects[index].name}"...`)
    try {
      //Call function donate
      const result = await contract.methods
        .donate(index, amount)
        .send({ from: kit.defaultAccount })
      notification(`You successfully donate for "${projects[index].name}".`, 'success')
    } catch (error) {
      notification(`⚠️ ${error}.`, 'error')
    }
    getProjects()
  }
})

//reload page state
// const reState = (_index) => {
//   alert ("function restate ")
//   //clear amout value in form
//   document.getElementById("amountDonate-" + _index).value = "";
//   getProjects()
//   getBalance()
// }

//Check end date
const isEndProject = (_endDate) => {
  const today = new Date().toISOString().split('T')[0]
  if ((new Date(_endDate).getTime()) < (new Date(today).getTime())) {
    return true
  } else {
    return false
  }
}

// window.addEventListener('load', async () => {
//   kit = newKitFromWeb3(web3)
//   alert(kit.defaultAccount)
//   if (empty(kit.defaultAccount)) {
//     notification("Connect your celo wallet to continue", 'info')
//   } else {
//     await getBalance()
//     await getProjects()
//     notificationOff()
//   }
// });