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
		uint amount;
    }
    
    mapping (uint => Project) internal projects;
    uint internal projectCount = 0;
    
    function addProject(
		string memory _name,
		string memory _description, 
		string memory _image,
		string memory _endDate,
		uint  _target
		) public {
			require(bytes(_name).length > 0, "Project name is not empty");
			require(bytes(_description).length > 0, "Project description is not empty");
			require(bytes(_image).length > 0, "Project image is not empty");
			require(bytes(_endDate).length > 0, "Project end date is not empty");
			require(_target > 0, "Project target is invalid");
			uint _amount = 0;
			projects[projectCount] = Project(
				payable(msg.sender),
				_name,
				_description,
				_image,
				_endDate,
				_target,
				_amount
			);
			projectCount++;
    }
    
    function getProject(uint _index) public view returns (
		address payable,
		string memory, 
		string memory, 
		string memory, 
		string memory, 
		uint,
		uint
	) {
		return (
			projects[_index].owner, 
			projects[_index].name, 
			projects[_index].description, 
			projects[_index].image,
			projects[_index].endDate,
			projects[_index].target,
			projects[_index].amount
		);
	}
	
	function getProjectCount() public view returns (uint) {
	    return (projectCount);
	}
	
	function donate(uint _index, uint _amount) public payable  {
		require(_amount > 0, "Amount donate invalid");
		require(
		  IERC20Token(cUsdTokenAddress).transferFrom(
			msg.sender,
			projects[_index].owner,
			projects[_index].amount += _amount
		  ),
		  "Transfer failed."
		);
	}
    
}