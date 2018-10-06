pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;


import "./libs/LibOrder.sol";
import "./libs/LibFillResults.sol";


contract Wyre {
    function balanceOf(address _owner) public view returns (uint256 _balance);
}


contract Exchange {
    function fillOrder(
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        bytes memory signature
    )
        public
        returns (LibFillResults.FillResults memory fillResults);
}


contract WyreFilter {
    address constant WYRE_ADDRESS = 0xB14fA2276D8bD26713A6D98871b2d63Da9eefE6f;
    address constant EXCHANGE_ADDRESS = 0x35dD2932454449b14Cee11A94d3674a936d5d7b2;

    function conditionalFillOrder(
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        bytes memory signature)
        public
    {
        // Check Wyre verification
        Wyre wyre = Wyre(WYRE_ADDRESS);
        require(wyre.balanceOf(order.makerAddress) >= 1, "Maker is not verified");
        require(wyre.balanceOf(msg.sender) >= 1, "Taker is not verified");

        // Fill order
        Exchange exchange = Exchange(EXCHANGE_ADDRESS);
        exchange.fillOrder(order, takerAssetFillAmount, signature);
    }
}
