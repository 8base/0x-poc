import React, { Component } from "react";
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Radio, Tabs, Tab } from "react-bootstrap";
import Web3 from 'web3';

import { dropdownWidth, inputWidth, labelWidth } from './constants';
import TimeUnitSelect from "../TimeUnitSelect/TimeUnitSelect";
import TokenPairSelect from "../TokenPairSelect/TokenPairSelect";
import config from '../../../config';

import getZeroEx from '../../../services/getZeroEx';

const DDT_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "from",
        "type": "address"
      },
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "from",
        "type": "address"
      },
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenByIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "from",
        "type": "address"
      },
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "symbol",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  }
];

class DharmaForm extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      price: 0,
      tokenId: "",
      tokenIds: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);    
  }

  async componentDidMount() {
    // Read list of tokens for current user
    const web3 = new Web3(window.web3.currentProvider);    
    const DDT = new web3.eth.Contract(DDT_ABI, config.dharmaDebtToken);    
    const { web3Wrapper } = await getZeroEx;
    const account = '0x878368019cec9498d22e28b41fe59ab3deb0673c';//(await web3Wrapper.getAvailableAddressesAsync())[0];
    
    const balance = await DDT.methods.balanceOf(account).call();    
    console.log('balance', balance);

/*    const tokenIds = [];
    for(let i = 0; i < balance; i++) {
      const tokenId = await DDT.methods.tokenOfOwnerByIndex(account, i).call();
      tokenIds.push(tokenId);
    }   */
    
    //let tokenIds = [];
    const promises = [];
    for(let i = 0; i < balance; i++) {
      promises.push(DDT.methods.tokenOfOwnerByIndex(account, i).call());
//      tokenIds.push(tokenId);
    }    
    const tokenIds = await Promise.all(promises);

    this.setState({ tokenIds });
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  getTokenPairById = (tokenPairId) => {
    const { tokenPairs } = this.props;
    return tokenPairs.find((tokenPair) => {
      return tokenPair.id == tokenPairId;
    });
  }

  render() {

    const { handleSubmit } = this.props;
    const { tokenIds, tokenId, price } = this.state;

    return (
      <Form horizontal onSubmit={handleSubmit}>
        <br />
        <FormGroup controlId="tokenPair">
          <Col componentClass={ControlLabel} sm={labelWidth}>
            Dharma Debt Token
        </Col>
          <Col sm={inputWidth}>
          <FormControl
                name="tokenId"
                onChange={this.handleInputChange}
                componentClass="select"
                placeholder="select"
                defaultValue={tokenId}>
                {tokenIds.map((tId) => (
                    <option key={tId} value={tId}>
                        {`DDT ${tId}`}
                    </option>
                ))}
            </FormControl>
          </Col>
        </FormGroup>
        <FormGroup controlId="price">
          <Col componentClass={ControlLabel} sm={labelWidth}>
            Price (WETH)
        </Col>
          <Col sm={inputWidth}>
            <FormControl
              onChange={this.handleInputChange}
              type="number"
              name="price"
              placeholder="Price"
              value={price}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={labelWidth} sm={10}>
            <Button type="submit" bsStyle="primary">
              Create
          </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

export default DharmaForm;