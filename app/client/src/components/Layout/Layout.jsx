// External libraries
import React, { Component } from "react";
import WyreVerification from 'wyre-react-library';
import { Button, Col, Panel } from "react-bootstrap";
import Web3Provider, { Web3Consumer } from 'web3-webpacked-react'

import getZeroEx from '../../services/getZeroEx';
import config from '../../config';

// Components
import Loading from "../Loading/Loading";
import Main from "./Main/Main";
import Header from "./Header/Header";

// Styling
import "./Layout.css";

const WYRE_ABI = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"takeOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"approvedFor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]');


const WyreButton = (props) => {
  return (
    <div>      
      <Button {...props} variant="contained" color="primary">Open Wyre</Button>
    </div>    
  );
}

class Layout extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      account: null,
      verified: false,
      loading: true
    };
  }

  async componentDidMount() {
    const { contractWrappers, web3Wrapper, providerEngine, web3 } = await getZeroEx;

    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    console.log('accounts', accounts);
    const isLoggedIn = accounts && accounts.length > 0;
    const account = isLoggedIn ? accounts[0] : null;

    let verified = false;
    if (isLoggedIn) {
      verified = await this.verifyAddress(account, web3);
    }
    this.setState({ isLoggedIn, account, verified, loading: false });
  }


  verifyAddress = async (address, web3) => {
    const wyreYesInstance = new web3.eth.Contract(WYRE_ABI, config.wyreContractAddress);
    const balance = await wyreYesInstance.methods.balanceOf(address).call({ from: address });
    
    return balance > 0;
  }

  /*openWyre = (e) => {
    // e.preventDefault();
    

    var handler = new Wyre({
      apiKey: "AK-EE7WEGNJ-TC2XTFC7-VD3VAPTC-4BJTDLAZ",
      env: "test",
      onExit: function (error) {
          if (error != null)
              console.error(error)
          else
              console.log("exited!")
      },
      onSuccess: function () {
          console.log("success!")
      }
    });

    handler.open();
    console.log('handler open');
  }*/

  render() {
    const { isLoggedIn, account, verified, loading } = this.state;


    if (loading) {
      return (
        <div><Loading/></div>
      );
    }

    if (!isLoggedIn || !verified) {
      return (
        <Web3Provider supportedNetworks={[42]} >
          <Web3Consumer>
          {context =>
            <div>
              <Col md={3}></Col>
              <Col md={6}>
                <Panel bsStyle="primary">
                  <Panel.Heading>
                    <Panel.Title componentClass="h3">Verification Required</Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    <WyreVerification myButton={WyreButton} apiKey={'AK-EE7WEGNJ-TC2XTFC7-VD3VAPTC-4BJTDLAZ'}/>
                  </Panel.Body>
                </Panel>                            
              </Col>
              <Col md={3}></Col>
            </div>
          }
          </Web3Consumer>
        </Web3Provider>        
      )
    }

    return (
      <div className="Layout">
        <Header />
        <Main />
      </div>
    );
  }
}

export default Layout;
