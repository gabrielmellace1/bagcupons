


$(document).ready(function() {
    let contract;
    let userAccount;

    const usdtContractAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
let usdtContract;
const usdtAbi = [
    // allowance
    {
        "constant": true,
        "inputs": [{"name":"owner","type":"address"},{"name":"spender","type":"address"}],
        "name": "allowance",
        "outputs": [{"name":"","type":"uint256"}],
        "type": "function"
    },
    // approve
    {
        "constant": false,
        "inputs": [{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],
        "name": "approve",
        "outputs": [{"name":"","type":"bool"}],
        "type": "function"
    }
];


    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                userAccount = accounts[0];
                
                fetchContractABI();
            })
            .catch(error => {
                console.error(error);
            });

        
        window.ethereum.on('accountsChanged', function (accounts) {
            userAccount = accounts[0];
            
            fetchContractABI();
            initializeUsdtContract();
        });
    } else {
        console.log('Ethereum wallet not detected. Install MetaMask or another wallet.');
    }

    function fetchContractABI() {
        fetch('/cuponsAbi.json')
            .then(response => response.json())
            .then(abi => {
                initializeContract(abi);
            })
            .catch(error => console.error('Error fetching ABI:', error));
    }

    function initializeContract(abi) {
        const contractAddress = '0x412B59C22815b8e4Cf2E1e89fc1b8E4E87B8151b'; 
        contract = new web3.eth.Contract(abi, contractAddress);
    }
    function initializeUsdtContract() {
        usdtContract = new web3.eth.Contract(usdtAbi, usdtContractAddress);
    }

    function checkAndApproveUsdt(couponValue, callback) {
        usdtContract.methods.allowance(userAccount, contract._address).call({ from: userAccount })
            .then(allowance => {
                if (new web3.utils.BN(allowance).lt(new web3.utils.BN(couponValue))) {
                    
                    const max = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // A large number, essentially unlimited
                    usdtContract.methods.approve(contract._address, max).send({ from: userAccount })
                        .then(approvalResult => {
                            console.log('Approval successful', approvalResult);
                            callback(); 
                        })
                        .catch(approvalError => {
                            console.error('Approval failed', approvalError);
                            alert('Approval failed. Please try again.');
                        });
                } else {
                    
                    callback();
                }
            })
            .catch(error => {
                console.error('Error fetching allowance:', error);
                alert('Error checking USDT allowance.');
            });
    }
    


    $('#createSingleCoupon').click(function() {

        


        const couponCode = $('#singleCouponCode').val();
        let couponValue = $('#singleCouponValue').val(); 
    
        const decimals = 6; 
        couponValue = ethers.utils.parseUnits(couponValue, decimals);
    
        if (!couponCode || couponValue <= 0) {
            alert('Please enter a valid coupon code and value.');
            return;
        }
    
        
        const couponValueStr = couponValue.toString();
        const couponHash = web3.utils.sha3(couponCode);
        console.log(couponHash);
        console.log(couponValueStr);

        contract.methods.createSingleCoupon(couponHash, couponValueStr).send({ from: userAccount })
            .then(result => {
                console.log('Coupon created:', result);
                alert('Coupon created successfully.');
            })
            .catch(error => {
                console.error('Error creating coupon:', error);
                alert('Error creating coupon.');
            });
    });
    

    $('#redeemCoupon').click(function() {
        const couponCode = $('#redeemCouponCode').val();
        if (!couponCode) {
            alert('Please enter a valid coupon code.');
            return;
        }
    
       
        contract.methods.isCouponValidAndNotRedeemed(couponCode).call({ from: userAccount })
            .then(result => {
                const isValid = result[0];
                const isRedeemed = result[1];
                const value = result[2]; 
    
                if (isValid && !isRedeemed) {
                   
                    contract.methods.redeemCoupon(couponCode).send({ from: userAccount })
                        .then(redeemResult => {
                            console.log('Coupon redeemed:', redeemResult);
                            alert('Coupon redeemed successfully.');
                        })
                        .catch(redeemError => {
                            console.error('Error redeeming coupon:', redeemError);
                            alert('Error redeeming coupon.');
                        });
                } else {
                   
                    if (!isValid) {
                        alert('This coupon is invalid.');
                    } else if (isRedeemed) {
                        alert('This coupon has already been redeemed.');
                    }
                }
            })
            .catch(error => {
                console.error('Error checking coupon status:', error);
                alert('Error checking coupon status.');
            });
    });


    $('#createMultipleCoupons').click(function() {
        const couponCodesStr = $('#multipleCouponCodes').val();
        const couponValue = $('#multipleCouponValue').val(); 
    
        
        const couponCodes = couponCodesStr.trim().split('\n').filter(line => line.trim() !== '');
    
        if (couponCodes.length === 0 || couponValue <= 0) {
            alert('Please enter valid coupon codes and value.');
            return;
        }
    
       
        const decimals = 6; 
        const couponValueInWei = ethers.utils.parseUnits(couponValue, decimals);
    
        
        const couponHashes = couponCodes.map(code => web3.utils.sha3(code));
    
        
        const values = Array(couponCodes.length).fill(couponValueInWei.toString());
    
       
        contract.methods.createMultipleCoupons(couponHashes, values).send({ from: userAccount })
            .then(result => {
                console.log('Multiple coupons created:', result);
                alert('Multiple coupons created successfully.');
            })
            .catch(error => {
                console.error('Error creating multiple coupons:', error);
                alert('Error creating multiple coupons.');
            });
    });
    
});
