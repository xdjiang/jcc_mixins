const crypto = require('bvcadt-crypto-core')
// const async = require('async')
const axios = require('axios')

var testNet = false;
/**
 * 测试链浏览器: http://bvcexplorer.hwelltech.net:88
 * 主链浏览器: https://explorer.bvcadt.com
 */
module.exports = {
  _server: null,
  _remote: null,
  init: function (node) {
    this._server = node;
    this._remote = axios.create({
      timeout: 60000
    })
  },
  _native: 'BVCADT',
  _drops: 1000000,
  createWallet: function () {
    try {
      return crypto.generateAddress().wallet;
    } catch (error) {
      return null;
    }
  },
  isValidAddress: function (address) {
    return crypto.isValidAddress(address)
  },
  isValidSecret: function (secret) {
    try {
      var w = crypto.generateAddress(secret).wallet;
      return crypto.isValidAddress(w.address)
    } catch (error) {
      return false
    }
  },
  getWallet: function (secret) {
    var self = this;
    if (!self.isValidSecret(secret)) {
      console.log('getWallet:secret is invalid');
      return null;
    }
    // console.log('getWallet:secret:', secret);
    try {
      return crypto.generateAddress(secret).wallet;
    } catch (error) {
      return null;
    }
  },

  getAddress: function (secret) {
    var self = this;
    if (!self.isValidSecret(secret)) {
      console.log('getAddress:secret is invalid');
      return null;
    }
    var wallet = self.getWallet(secret);
    if (wallet) {
      return wallet.address;
    } else {
      return null;
    }
  },
  getAccountInfo: async function (address) {
    var self = this;
    try {
      var data = JSON.stringify({
        "method": "account_info",
        "params": [{
          "account": address,
          "strict": true,
          "ledger_index": "current",
          "queue": true
        }]
      });
      let res = await self._remote({ method: "post", url: self._server, data: data });
      // console.log("balance res", res.data)
      return res.data.result
    } catch (e) {
      return e;
    }
  },
  getBalance: async function (address) {
    var self = this;
    var info = await self.getAccountInfo(address)
    if (info) {
      return Number(info.account_data.Balance) / self._drops
    }
    return null;
  },
  /**
   *
   * @param {*} currency 通证类型，比如CADT
   * @param {*} src 授权对象，收款的钱包
   * @param {*} dest 通证的issuer, CADT testnet是bKhzHBtWgiBEVAgDDRR3ioMbbv3wxf9VoX，mainnet是b9JGrM26e5hkweEBGPwfVfiyyXzpmmuG33
   * @param {*} amount 数量，即收取通证的上限
   */
  setTrustline: async function (currency, src, dest, amount) {
    var self = this;
    if (!self.isValidAddress(src.address)) {
      return null;
    }

    if (!self.isValidAddress(dest.address)) {
      return null;
    }

    if (isNaN(amount)) {
      return null;
    }

    if (!currency) {
      return null;
    }

    // get seq
    var info = await self.getAccountInfo(src.address);
    if (!info) {
      console.log("invalid source address");
      return null;
    }
    var seq = info.account_data.Sequence;

    // sign
    var txJson = {
      "TransactionType": "TrustSet",
      "Flags": 131072,
      "Account": src.address,
      "LimitAmount": {
        "currency": currency,
        "issuer": dest.address,
        "value": amount + ""
      },
      "Fee": "10000",
      "Sequence": seq
    }
    const signed = crypto.sign(txJson, src.secret)
    try {
      var data = {
        "method": "submit",
        "params": [{
          "tx_blob": signed.signedTransaction
        }]
      };
      let res = await self._remote({ url: self._server, method: 'post', data });
      if (res.status === 200) {
        return {
          result: res.data.result.status === 'success',
          data: res.data
        }
      }
      return {
        result: false
      }
    } catch (e) {
      return (e);
    }
  },

  /**
 *  余额不足 (钱包中有30BVC是激活时冻结的)
    engine_result: 'tecUNFUNDED_PAYMENT',
    engine_result_code: 104,
    engine_result_message: 'Insufficient BVC balance to send.',

  * 向未激活钱包转账时，如果低于30个BVC，则提示转账数量不足以激活钱包：
    engine_result: 'tecNO_DST_INSUF_BVC',
    engine_result_code: 125,
    engine_result_message:'Destination does not exist. Too little BVC sent to create it.',

  * 转账成功
    engine_result: 'tesSUCCESS',
    engine_result_code: 0,
    engine_result_message:The transaction was applied. Only final in a validated ledger
 */
  transfer: async function (currency, src, dest, amount, memo) {
    var self = this;
    if (!self.isValidAddress(src.address)) {
      console.log('src address is invalid');
      return null;
    }

    if (!self.isValidAddress(dest.address)) {
      console.log('dest address is invalid');
      return null;
    }

    if (isNaN(amount)) {
      console.log('amount is invalid');
      return null;
    }

    if (!currency) {
      console.log('currency is invalid');
      return null;
    }

    // get seq
    var info = await self.getAccountInfo(src.address);
    if (!info) {
      console.log("invalid source address: ", info);
      return null;
    }
    var seq = info.account_data.Sequence;

    // sign
    var txJson = {
      "TransactionType": "Payment",
      "Account": src.address,
      "Destination": dest.address,
      "Fee": "10000",
      "Memos": [{
        "Memo": {
          "MemoType": "6D656D6F",
          "MemoData": crypto.base.utils.convertStringToHex(JSON.stringify(memo))
        }
      }],
      "Sequence": seq
    }
    if (currency === 'BVC') {
      txJson.Amount = (amount * self._drops) + ""
    } else {
      txJson.Amount = {
        "value": "" + amount,
        "currency": "CADT",
        "issuer": testNet ? "bKhzHBtWgiBEVAgDDRR3ioMbbv3wxf9VoX" : "b9JGrM26e5hkweEBGPwfVfiyyXzpmmuG33"
      }
    }
    const signed = crypto.sign(txJson, src.secret)
    // console.log(signed)
    try {
      var data = {
        "method": "submit",
        "params": [{
          "tx_blob": signed.signedTransaction
        }]
      };
      let res = await self._remote({ url: self._server, method: 'post', data: JSON.stringify(data) });
      if (res.status === 200) {
        return {
          result: res.data.result.status === 'success',
          data: res.data
        }
      }
      return {
        result: false
      }
    } catch (e) {
      return (e);
    }
  },
  /*
   *    account(required): the query account
   *    ledger(option): specify ledger, ledger can be:
   *    ledger_index=xxx, ledger_hash=xxx, or ledger=closed|current|validated
   */
  getHistory: async function (address, idxFrom, idxTo) {
    var self = this

    if (!self.isValidAddress(address)) {
      console.log('address is invalid');
      return null;
    }
    var optns = {
      account: address
    };

    try {
      if (idxFrom && !isNaN(idxFrom)) {
        optns.ledger_min = idxFrom;
      }
      if (idxTo && !isNaN(idxTo)) {
        optns.ledger_max = idxTo;
      }
    } catch (error) {
      console.log('getHistory: idxFrom or  idxTo isinvalid,idxFrom ', idxFrom, ',idxTo ', idxTo);
      return null;
    }
    try {
      var data = {
        "method": "account_tx",
        "params": [{
          "account": optns.account,
          "binary": false,
          "forward": false,
          "ledger_index_max": Number(optns.ledger_max),
          "ledger_index_min": Number(optns.ledger_min),
          "limit": 100
        }]
      };
      console.log(data, null, 2)
      let res = await self._remote({ url: self._server, method: 'get', data });
      if (res.status === 200) {
        return {
          result: res.data.result.status === 'success',
          data: res.data
        }
      }
      return {
        result: false
      }
    } catch (e) {
      return (e);
    }
  }
}