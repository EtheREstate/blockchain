// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract Etherente {

    address owner = msg.sender;
    ///register the owner's address

    struct Deposit {
        uint date;
        address from;
        uint amount;
    }
    /// keep track of the transfers
    mapping(uint => Deposit) public balances; 

    uint public depositCount = 0; 
    event NewDeposit (
            uint date,
            address indexed from,
            uint amount
            );
    ///invest in the smart contract
    function invest() external payable {
        if(msg.value < 50 finney){
            revert();
        }
        depositCount++;
        balances[depositCount]= Deposit (now, msg.sender,msg.value);
        emit NewDeposit(now, msg.sender,msg.value);
    }
    function balanceSum() external view returns(uint) {
        return address(this).balance;
    }

    /// destroy the contract and reclaim the leftover funds.
    function kill() public {
        require(msg.sender == owner);
        selfdestruct(msg.sender);
    }
}
