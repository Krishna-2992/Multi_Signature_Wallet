import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { contractAddress, contractABI } from './constants'

function App() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
    })
    const [account, setAccount] = useState('')
    const [balance, setBalance] = useState('')
    const [owners, setOwners] = useState()
    const [withdrawTxCount, setWithdrawTxCount] = useState()
    const [withdrawTxs, setWithdrawTxs] = useState()

    const [contractBalance, setContractBalance] = useState()

    const getOwners = async () => {
        const owners = await state.contract.getOwners()
        setOwners(owners)
    }
    const getTxCount = async () => {
        const count = await state.contract.getWithdrawTxCount()
        setWithdrawTxCount(count)
        console.log('count', count.toNumber())
    }
    const getContractBalance = async () => {
        const contractBalance = await state.contract.balanceOf()
        setContractBalance(contractBalance)
    }
    const getWithdrawTransactions = async () => {
        const withdrawTransactions = await state.contract.getWithdrawTxes()
        // console.log('wt', withdrawTransactions)
        setWithdrawTxs(withdrawTransactions)
    }

    useEffect(() => {
        if (state.provider) {
            getOwners()
            getTxCount()
            getContractBalance()
            getWithdrawTransactions()
        }
    }, [state])

    const connectWallet = async () => {
        console.log('connecting wallet to metamask!')
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send('eth_requestAccounts', [])

            const signer = provider.getSigner()
            const account = await signer.getAddress()
            let balance = await signer.getBalance()

            balance = ethers.utils.formatEther(balance)
            setAccount(account)
            setBalance(balance)

            const contract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            )
            setState({ provider, signer, contract })
        } catch (error) {
            console.log('Error Krishna💥💥 :', error)
        }
    }

    const depositEther = async () => {
        try {
            let amount = document.querySelector('#depositValue').value
            amount = ethers.utils.parseEther(amount)
            const transaction = await state.contract.deposit({
                value: amount,
            })
            await transaction.wait()
            console.log('transaction completed!!')
        } catch (error) {
            console.log('Error Krishna💥💥 :', error)
        }
    }

    const withdrawTransaction = async () => {
        try {
            let receiver = document.querySelector('#withdrawAddress').value
            let amount = document.querySelector('#withdrawAmount').value
            amount = ethers.utils.parseEther(amount)

            const transaction = await state.contract.createWithdrawTx(
                receiver,
                amount
            )
            await transaction.wait()
            console.log('withdraw transaction made!!')
        } catch (error) {
            console.log('Error Krishna💥💥 :', error)
        }
    }

    const approveTransaction = async () => {
        try {
            const txIndex = document.querySelector('#approveTxIndex').value
            const transaction = await state.contract.approveWithdrawTx(txIndex)
            await transaction.wait()
            console.log('approved', txIndex)
        } catch (error) {
            console.log('Error Krishna💥💥 :', error)
        }
    }

    return (
        <>
        <div className='text-3xl font-semibold mb-4 underline'>Multi sig wallet</div>
            {!account && (
                <button onClick={connectWallet}>connect wallet</button>
            )}
            <div className='border'>
            Owners:
            {owners && owners.map((item, index) => <p key={index}>{item}</p>)}
            </div>
            <div>
                Transaction count:{' '}
                {withdrawTxCount && withdrawTxCount.toNumber()}
            </div>
            <div>
                Contract Balance:{' '}
                {contractBalance && ethers.utils.formatEther(contractBalance)}
            </div>
            <div>account connected: {account}</div>
            <div>account balance: {balance}</div>
            <div>
                <input type='text' id='depositValue' />
                <button onClick={depositEther}>Deposit</button>
            </div>
            <div>
                <input
                    type='text'
                    id='withdrawAddress'
                    placeholder='receiver address'
                />
                <input type='text' id='withdrawAmount' placeholder='amount' />
                <button onClick={withdrawTransaction}>
                    Withdraw Transaction
                </button>
            </div>
            <div>
                {withdrawTxs &&
                    withdrawTxs.map((item, index) => (
                        <div key={index} className='border'>
                            {console.log(index, item)}
                            <div>receiver: {item[0]}</div>
                            <div>amount: {item[1].toString()}</div>
                            <div>approvals: {item[2].toString()}</div>
                            <div>sent:{item[3].toString()}</div>
                        </div>
                    ))}
            </div>
            <div>
                <input type="text" placeholder='transactionId' id="approveTxIndex" />
                <button onClick={approveTransaction}>Approve Transaction</button>
            </div>
        </>
    )
}

export default App
