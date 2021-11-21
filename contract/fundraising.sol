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

    struct Fund {
        address payable donateAddress;
        string name;
        string description;
        string image;
        string endDate;
        uint funding;
    }
    
    mapping (uint => Fund) internal funds;
    uint internal fundsCount = 0;

    
    function addFund (
		string memory _name,
		string memory _description, 
		string memory _image,
		string memory _endDate
		) public {
        uint _funding = 0;
		funds[fundsCount] = Fund(
			payable(msg.sender),
			_name,
			_description,
			_image,
			_endDate,
			_funding
		);
		fundsCount++;
    }
    
    function getFund(uint _index) public view returns (
		address payable,
		string memory, 
		string memory, 
		string memory, 
		string memory, 
		uint
	) {
		return (
			funds[_index].donateAddress, 
			funds[_index].name, 
			funds[_index].description, 
			funds[_index].image,
			funds[_index].endDate,
			funds[_index].funding
		);
	}
	
	function getFundsCount() public view returns (uint) {
	    return (fundsCount);
	}
	
	function donate(uint _index, uint _amount) public payable  {
		require(
		  IERC20Token(cUsdTokenAddress).transferFrom(
			msg.sender,
			funds[_index].donateAddress,
			_amount
		  ),
		  "Transfer failed."
		);
	}
	
    
}