const TronWeb = require("tronweb");
const BigNumber = require("bignumber.js");
module.exports = {
  tronWeb: null,
  init(node) {
    this.tronWeb = new TronWeb({
      fullHost: node
    });
  },
  // 创建新Tron钱包
  createWallet() {
    return this.tronWeb.createAccount();
  },
  // 根据私钥解析钱包
  fromSecret(secret) {
    const { crypto, bytes, code } = TronWeb.utils;
    const priKeyBytes = code.hexStr2byteArray(secret)
    const pubKeyBytes = crypto.getPubKeyFromPriKey(priKeyBytes);
    const addressBytes = crypto.getAddressFromPriKey(priKeyBytes);

    const privateKey = bytes.byteArray2hexStr(priKeyBytes);
    const publicKey = bytes.byteArray2hexStr(pubKeyBytes);

    return {
      privateKey,
      publicKey,
      address: {
        base58: crypto.getBase58CheckAddress(addressBytes),
        hex: bytes.byteArray2hexStr(addressBytes)
      }
    }
  },
  // 判断波场地址是否合法
  isValidAddress(address) {
    return this.tronWeb.isAddress(address);
  },
  // trc20数量转换
  async toTrc20Sun(value, contractAddress) {
    this.tronWeb.setAddress(contractAddress);
    const contract = await this.tronWeb.contract().at(contractAddress);
    const decimals = await contract.decimals().call();
    return new BigNumber(value).times(10 ** decimals).toString(10);
  },
  // 获取TRX余额
  async getTrxBalance(address) {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.fromSun(balance).toString();
    } catch (error) {
      return null;
    }
  },
  fromSun(amount) {
    return this.tronWeb.fromSun(amount)
  },
  // 获取Trc20资产
  async getTrc20Balance(address, contractAddress) {
    try {
      this.tronWeb.setAddress(contractAddress);
      const contract = await this.tronWeb.contract().at(contractAddress);
      const decimals = await contract.decimals().call();
      const balance = await contract.balanceOf(address).call();
      return new BigNumber(balance.toString()).div(10 ** decimals).toString(10)
    } catch (error) {
      console.log(error)
      return null
    }
  },
  // 转账TRX
  async sendTrx(secret, from, to, amount, memo) {
    try {
      const unSignedTxn = await this.tronWeb.transactionBuilder.sendTrx(to, this.tronWeb.toSun(amount), from);
      const unSignedTxnWithNote = await this.tronWeb.transactionBuilder.addUpdateData(unSignedTxn, memo, 'utf8');
      const signedTxn = await this.tronWeb.trx.sign(unSignedTxnWithNote, secret);
      const ret = await this.tronWeb.trx.sendRawTransaction(signedTxn);
      return ret;
    } catch (error) {
      console.log(error)
      return null;
    }
    // {
    //     result: true,
    //     txid: 'a7ba668ec2317a95a7d2088e46a38a55d05c9f4764f61bb0a4159012bd40b135',
    //     transaction: {
    //       txID: 'a7ba668ec2317a95a7d2088e46a38a55d05c9f4764f61bb0a4159012bd40b135',
    //       raw_data: {
    //         data: '7472616e7366657220302e31',
    //         contract: [Array],
    //         ref_block_bytes: '12f6',
    //         ref_block_hash: '0b985ea5786ae503',
    //         expiration: 1611987753000,
    //         timestamp: 1611987697134
    //       },
    //       raw_data_hex: '0a0212f622080b985ea5786ae50340a8b0d48ff52e520c7472616e7366657220302e315a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a1541029da0f42fe29614712a26f429931a98857db3671215417f21b572a027008138357c7102449223a2344b1818a08d0670eefbd08ff52e',
    //       visible: false,
    //       signature: [
    //         '0cb9507b96ceb8d673288483c4d13734ff18267417204e2a3b575287d75297b4e105de55f07c8a2825ac560e6bebeb50b19051e45abc26dfad3e80937ed9f04800'
    //       ]
    //     }
    //   }
  },
  // 转账Trc20 Token
  async sendTrc20(secret, from, to, amount, contract, memo) {
    try {
      let {
        transaction,
        result
      } = await this.tronWeb.transactionBuilder.triggerSmartContract(
        this.tronWeb.address.toHex(contract), 'transfer(address,uint256)', {
        feeLimit: this.tronWeb.toSun(10)
      },
        [{
          type: 'address',
          value: to
        }, {
          type: 'uint256',
          value: await this.toTrc20Sun(amount, contract)
        }], this.tronWeb.address.toHex(from)
      );
      if (!result.result) {
        console.error("error:", result);
        return null;
      }
      const unSignedTxnWithNote = await this.tronWeb.transactionBuilder.addUpdateData(transaction, memo, 'utf8');

      const signature = await this.tronWeb.trx.sign(unSignedTxnWithNote, secret);

      const broadcast = await this.tronWeb.trx.sendRawTransaction(signature);

      return broadcast;
    } catch (error) {
      console.error("trigger smart contract error", error)
    }
    // {
    //     result: true,
    //     txid: 'b25b7688dd9f7b4e79811f574f5c2a4c3697a90ebdd8f17ad67fc82a84c6c3f7',
    //     transaction: {
    //       txID: 'b25b7688dd9f7b4e79811f574f5c2a4c3697a90ebdd8f17ad67fc82a84c6c3f7',
    //       raw_data: {
    //         data: '7472616e736665722075736474',
    //         contract: [Array],
    //         ref_block_bytes: '12e6',
    //         ref_block_hash: '6814c687c57356e8',
    //         expiration: 1611987705000,
    //         fee_limit: 10000000,
    //         timestamp: 1611987646465
    //       },
    //       raw_data_hex: '0a0212e622086814c687c57356e840a8b9d18ff52e520d7472616e7366657220757364745aae01081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541029da0f42fe29614712a26f429931a98857db367121541a614f803b6fd780986a42c78ec9c7f77e6ded13c2244a9059cbb0000000000000000000000007f21b572a027008138357c7102449223a2344b1800000000000000000000000000000000000000000000000000000000000000017081f0cd8ff52e900180ade204',
    //       visible: false,
    //       signature: [
    //         '8783bc0b5701e858069826707974495be466b9d0f45fa7d9b6fe683e33357271aa686e1c98a15660b4d485e1cfa297e05833eb2004cfc5696a707e83b1dd9aae01'
    //       ]
    //     }
    //   }
  }
}