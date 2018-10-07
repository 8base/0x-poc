pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;


import "./libs/LibOrder.sol";
import "./libs/LibFillResults.sol";


contract IWyre {
    function balanceOf(address _owner) public view returns (uint256 _balance);
}


contract IExchange {
    function executeTransaction(
        uint256 salt,
        address signerAddress,
        bytes data,
        bytes signature
    )
        external;

    function fillOrder(
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        bytes memory signature
    )
        public
        returns (LibFillResults.FillResults memory fillResults);
}


contract WyreFilter {
    IExchange internal EXCHANGE;
    IWyre internal WYRE;
    bytes internal TX_ORIGIN_SIGNATURE;
    byte constant internal VALIDATOR_SIGNATURE_BYTE = "\x05";

    constructor (address _exchange, address _wyre)
        public
    {
        EXCHANGE = IExchange(_exchange);
        WYRE = IWyre(_wyre);
        TX_ORIGIN_SIGNATURE = abi.encodePacked(address(this), VALIDATOR_SIGNATURE_BYTE);
    }

    function isValidSignature(
        bytes32 hash,
        address signerAddress,
        bytes signature
    )
        external
        view
        returns (bool isValid)
    {
        // solhint-disable-next-line avoid-tx-origin
        return signerAddress == tx.origin;
    }

    function conditionalFillOrder(
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        uint256 salt,
        bytes memory signature)
        public
    {
        address takerAddress = msg.sender;

        // This contract must be the entry point for the transaction.
        require(
            // solhint-disable-next-line avoid-tx-origin
            takerAddress == tx.origin,
            "INVALID_SENDER"
        );

        // Check Wyre verification
        require(WYRE.balanceOf(order.makerAddress) >= 1, "Maker is not verified");
        require(WYRE.balanceOf(takerAddress) >= 1, "Taker is not verified");

        // Encode arguments into byte array.
        bytes memory data = abi.encodeWithSelector(
            EXCHANGE.fillOrder.selector,
            order,
            takerAssetFillAmount,
            signature
        );

        // Call `fillOrder` via `executeTransaction`.
        EXCHANGE.executeTransaction(
            salt,
            takerAddress,
            data,
            TX_ORIGIN_SIGNATURE
        );        
    }
}
