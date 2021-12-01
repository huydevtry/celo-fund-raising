// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract fundraising {
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Project {
        address payable owner;
        string name;
        string description;
        string image;
        string endDate;
        uint target;
    }
    
	//Storage list project
    mapping (uint => Project) internal projects;
	//Storage balance of project
    mapping (uint => uint) internal projectBalances;
    uint internal projectCount = 0;

	//Increase balance of project
    function increaseBalance(uint _index, uint _amount) internal {
        	projectBalances[_index] += _amount;
    }

	//Get balance of project
    function getProjectBalance(uint _index) public view returns (uint) {
        return (projectBalances[_index]);
    }
    
    function addProject(
		string memory _name,
		string memory _description, 
		string memory _image,
		string memory _endDate,
		uint  _target
		) public {
		projects[projectCount] = Project(
			payable(msg.sender),
			_name,
			_description,
			_image,
			_endDate,
			_target
		);
		projectCount++;
    }
    
    function getProject(uint _index) public view returns (
		address payable,
		string memory, 
		string memory, 
		string memory, 
		string memory, 
		uint
	) {
		return (
			projects[_index].owner, 
			projects[_index].name, 
			projects[_index].description, 
			projects[_index].image,
			projects[_index].endDate,
			projects[_index].target
		);
	}
	
	//Get number of project
	function getProjectCount() public view returns (uint) {
	    return (projectCount);
	}

	//Donate amount cusd for project
	function donate(uint _index, uint _amount) public payable  {
		require(
		  IERC20Token(cUsdTokenAddress).transferFrom(
			msg.sender,
			projects[_index].owner,
			_amount
		  ),
		  "Donate failed."
		);
		//Increase balance
		increaseBalance(_index, _amount);
	}
	
    
}