// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

error txNotExists(uint transactionIndex);
error txAlreadyApproved(uint transactionIndex);
error txAlreadySent(uint transactionIndex);

contract MultisigWallet {
    event Deposit(address indexed sender, uint amount, uint balance);

    event CreateWithdrawTx(
        address indexed owner,
        uint indexed transactionIndex,
        address indexed to,
        uint amount
    );

   event ApproveWithdrawTx(
    address indexed owner, 
    uint indexed transactionIndex
   );

    address[] public owners;

   mapping (address => bool) public isOwner;

    uint public quorumRequired;

   struct WithdrawTx {
    address to;
    uint amount;
    uint approvals;
    bool sent;
   }

   mapping (uint => mapping(address => bool)) public isApproved;

    WithdrawTx[] public WithdrawTxes;

   constructor(address[] memory _owners, uint _quorumRequired) {
    uint ownersLength = _owners.length;
    require(ownersLength > 0, "no owner provided");
    require(_quorumRequired > 0 && _quorumRequired <= _owners.length, "quorum should be greater than one");

    for(uint i=0; i < ownersLength; i++) {
        require(_owners[i] != address(0), "null address provided!!");
        require(!isOwner[_owners[i]], "repeated owners");
        isOwner[_owners[i]] = true;
        owners.push(_owners[i]);
    }
    quorumRequired = _quorumRequired;
   }

    modifier onlyOwner {
        require(isOwner[msg.sender], "not an owner!!");
        _;
    }

    modifier transactionExists(uint txIndex) {
        if(WithdrawTxes.length <= txIndex){
            revert txNotExists(txIndex);
        }
        _;
    }

    modifier transactionNotApproved(uint txIndex) {
        if(isApproved[txIndex][msg.sender]){
            revert txAlreadyApproved(txIndex);
        }
        _;
    }

    modifier transactionNotSent(uint txIndex) {
        if(WithdrawTxes[txIndex].sent){
            revert txAlreadySent(txIndex);
        }
        _;
    }

   function createWithdrawTx(address _to, uint _amount) public onlyOwner {
        uint txIndex = WithdrawTxes.length;
        WithdrawTxes.push(WithdrawTx(_to, _amount, 0, false));

        emit CreateWithdrawTx(msg.sender, txIndex, _to, _amount);
   }
   
    function approveWithdrawTx(uint txIndex) public onlyOwner transactionExists(txIndex)
    transactionNotApproved(txIndex) transactionNotSent(txIndex) {
        WithdrawTx storage withdrawTx = WithdrawTxes[txIndex];
        withdrawTx.approvals++;
        isApproved[txIndex][msg.sender] = true;

        if(withdrawTx.approvals >= quorumRequired) {
            withdrawTx.sent = true;
            (bool sent, ) = payable(withdrawTx.to).call{value: withdrawTx.amount}("");
            require(sent, "ether transfer failed!!");
        }
        emit ApproveWithdrawTx(msg.sender, txIndex);
    }

    function getOwners() public view returns(address[] memory) {
        return owners;
    }
    
    function getWithdrawTxCount() public view returns(uint) {
        return WithdrawTxes.length;
    }
    
    function getWithdrawTxes() public view returns(WithdrawTx[] memory) {
        return WithdrawTxes;
    }
    
    function getWithdrawTx(uint txIndex) public view returns(WithdrawTx memory) {
        return WithdrawTxes[txIndex];
    }

    function deposit() public payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
   }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function balanceOf() public view returns(uint) {
        return address(this).balance;
    }
}
