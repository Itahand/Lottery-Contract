// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable{
        require(msg.value > 0.1 ether, 'Not enough ether, please send at least 0.1 Ether');

        players.push(payable(msg.sender));
    }

    function random() private view returns(uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public  onlyManager {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }

    modifier onlyManager() {
        require(msg.sender == manager, 'Not the Manager!');
        _;
    }

    function allPlayers() public view returns(address payable[] memory) {
        return players;
    }
}
