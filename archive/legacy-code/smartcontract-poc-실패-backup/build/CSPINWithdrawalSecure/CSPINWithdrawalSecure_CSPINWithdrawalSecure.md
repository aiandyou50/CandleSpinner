# Tact compilation report
Contract: CSPINWithdrawalSecure
BoC Size: 1469 bytes

## Structures (Structs and Messages)
Total structures: 22

### DataSize
TL-B: `_ cells:int257 bits:int257 refs:int257 = DataSize`
Signature: `DataSize{cells:int257,bits:int257,refs:int257}`

### SignedBundle
TL-B: `_ signature:fixed_bytes64 signedData:remainder<slice> = SignedBundle`
Signature: `SignedBundle{signature:fixed_bytes64,signedData:remainder<slice>}`

### StateInit
TL-B: `_ code:^cell data:^cell = StateInit`
Signature: `StateInit{code:^cell,data:^cell}`

### Context
TL-B: `_ bounceable:bool sender:address value:int257 raw:^slice = Context`
Signature: `Context{bounceable:bool,sender:address,value:int257,raw:^slice}`

### SendParameters
TL-B: `_ mode:int257 body:Maybe ^cell code:Maybe ^cell data:Maybe ^cell value:int257 to:address bounce:bool = SendParameters`
Signature: `SendParameters{mode:int257,body:Maybe ^cell,code:Maybe ^cell,data:Maybe ^cell,value:int257,to:address,bounce:bool}`

### MessageParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 to:address bounce:bool = MessageParameters`
Signature: `MessageParameters{mode:int257,body:Maybe ^cell,value:int257,to:address,bounce:bool}`

### DeployParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 bounce:bool init:StateInit{code:^cell,data:^cell} = DeployParameters`
Signature: `DeployParameters{mode:int257,body:Maybe ^cell,value:int257,bounce:bool,init:StateInit{code:^cell,data:^cell}}`

### StdAddress
TL-B: `_ workchain:int8 address:uint256 = StdAddress`
Signature: `StdAddress{workchain:int8,address:uint256}`

### VarAddress
TL-B: `_ workchain:int32 address:^slice = VarAddress`
Signature: `VarAddress{workchain:int32,address:^slice}`

### BasechainAddress
TL-B: `_ hash:Maybe int257 = BasechainAddress`
Signature: `BasechainAddress{hash:Maybe int257}`

### Deploy
TL-B: `deploy#946a98b6 queryId:uint64 = Deploy`
Signature: `Deploy{queryId:uint64}`

### DeployOk
TL-B: `deploy_ok#aff90f57 queryId:uint64 = DeployOk`
Signature: `DeployOk{queryId:uint64}`

### FactoryDeploy
TL-B: `factory_deploy#6d0ff13b queryId:uint64 cashback:address = FactoryDeploy`
Signature: `FactoryDeploy{queryId:uint64,cashback:address}`

### ChangeOwner
TL-B: `change_owner#819dbe99 queryId:uint64 newOwner:address = ChangeOwner`
Signature: `ChangeOwner{queryId:uint64,newOwner:address}`

### ChangeOwnerOk
TL-B: `change_owner_ok#327b2b4a queryId:uint64 newOwner:address = ChangeOwnerOk`
Signature: `ChangeOwnerOk{queryId:uint64,newOwner:address}`

### JettonTransfer
TL-B: `jetton_transfer#be035951 queryId:uint64 amount:coins destination:address responseDestination:address customPayload:Maybe ^cell forwardTonAmount:coins forwardPayload:Maybe ^cell = JettonTransfer`
Signature: `JettonTransfer{queryId:uint64,amount:coins,destination:address,responseDestination:address,customPayload:Maybe ^cell,forwardTonAmount:coins,forwardPayload:Maybe ^cell}`

### ClaimRequest
TL-B: `claim_request#5897d2ee queryId:uint64 = ClaimRequest`
Signature: `ClaimRequest{queryId:uint64}`

### SetClaimable
TL-B: `set_claimable#26461da2 user:address amount:coins = SetClaimable`
Signature: `SetClaimable{user:address,amount:coins}`

### UpdateGameWallet
TL-B: `update_game_wallet#4c092fc5 newWallet:address = UpdateGameWallet`
Signature: `UpdateGameWallet{newWallet:address}`

### WithdrawTON
TL-B: `withdraw_ton#5a1c970b amount:coins = WithdrawTON`
Signature: `WithdrawTON{amount:coins}`

### CSPINWithdrawalSecure$Data
TL-B: `_ owner:address jettonMaster:address gameJettonWallet:address paused:bool maxSingleWithdraw:int257 claimableAmounts:dict<address, int> = CSPINWithdrawalSecure`
Signature: `CSPINWithdrawalSecure{owner:address,jettonMaster:address,gameJettonWallet:address,paused:bool,maxSingleWithdraw:int257,claimableAmounts:dict<address, int>}`

### ContractInfo
TL-B: `_ owner:address jettonMaster:address gameJettonWallet:address paused:bool maxSingleWithdraw:int257 = ContractInfo`
Signature: `ContractInfo{owner:address,jettonMaster:address,gameJettonWallet:address,paused:bool,maxSingleWithdraw:int257}`

## Get methods
Total get methods: 5

## getClaimable
Argument: user

## balance
No arguments

## contractInfo
No arguments

## isPaused
No arguments

## owner
No arguments

## Exit codes
* 2: Stack underflow
* 3: Stack overflow
* 4: Integer overflow
* 5: Integer out of expected range
* 6: Invalid opcode
* 7: Type check error
* 8: Cell overflow
* 9: Cell underflow
* 10: Dictionary error
* 11: 'Unknown' error
* 12: Fatal error
* 13: Out of gas error
* 14: Virtualization error
* 32: Action list is invalid
* 33: Action list is too long
* 34: Action is invalid or not supported
* 35: Invalid source address in outbound message
* 36: Invalid destination address in outbound message
* 37: Not enough Toncoin
* 38: Not enough extra currencies
* 39: Outbound message does not fit into a cell after rewriting
* 40: Cannot process a message
* 41: Library reference is null
* 42: Library change action error
* 43: Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree
* 50: Account state size exceeded limits
* 128: Null reference exception
* 129: Invalid serialization prefix
* 130: Invalid incoming message
* 131: Constraints error
* 132: Access denied
* 133: Contract stopped
* 134: Invalid argument
* 135: Code of a contract was not found
* 136: Invalid standard address
* 138: Not a basechain address
* 10905: Invalid address
* 17373: Amount cannot be negative
* 19792: Contract is paused
* 29489: No claimable amount
* 37178: Claimable amount is zero
* 39184: Insufficient balance or must keep min balance
* 58403: Amount exceeds limit
* 61135: Amount must be positive

## Trait inheritance diagram

```mermaid
graph TD
CSPINWithdrawalSecure
CSPINWithdrawalSecure --> BaseTrait
CSPINWithdrawalSecure --> Deployable
Deployable --> BaseTrait
CSPINWithdrawalSecure --> Ownable
Ownable --> BaseTrait
```

## Contract dependency diagram

```mermaid
graph TD
CSPINWithdrawalSecure
```