const { JsonRpc } = require('eosjs');
const SafeApi = require("./eos_safe_api");
const BigNumber = require("bignumber.js");
const { PrivateKey } = require('eosjs/dist/eosjs-key-conversions');
const { RpcError } = require("eosjs/dist/eosjs-rpcerror");

JsonRpc.prototype.fetch = async function (path, body) {
  let response;
  let json;
  try {
    const f = this.fetchBuiltin;
    response = await f(this.endpoint + path, {
      body: JSON.stringify(body),
      method: 'POST',
      timeout: 30000
    });
    json = await response.json();
    if (json.processed && json.processed.except) {
      throw new RpcError(json);
    }
  } catch (e) {
    e.isFetchError = true;
    throw e;
  }
  if (!response.ok) {
    throw new RpcError(json);
  }
  return json;
}

module.exports = {
  rpc: null,
  safeApi: null,
  init(node) {
    const rpc = new JsonRpc(node);
    this.rpc = rpc;
    this.safeApi = new SafeApi({ rpc });
  },
  async getKeyAccounts(secret) {
    const priv = PrivateKey.fromString(secret);
    const publicKey = priv.getPublicKey().toString();
    const res = await this.rpc.history_get_key_accounts(publicKey);
    return res;
  },
  // 获取账户某币种余额
  // code token合约账号
  // account eos账号
  // symbol token名称
  async getBalance(account, code, symbol) {
    const res = await this.rpc.get_currency_balance(code, account, symbol.toUpperCase());
    if (res.length === 0) {
      return "0";
    }
    return res[0].split(" ")[0];
  },
  // 查询用户的账户信息(资源等)
  async getAccount(account) {
    const res = await this.rpc.get_account(account);
    return res;
  },
  // 转账
  // secret 转出账号密钥
  // from 转出账号
  // to 转入账号
  // code token合约账号
  // amount 数量
  // symbol token名称
  // memo 备注
  async transfer({ secret, from, to, code, amount, decimal, symbol, memo }) {
    const quantity = `${new BigNumber(amount).toFixed(parseInt(decimal), 1)} ${symbol.toUpperCase()}`;
    const res = await this.safeApi.safeTransact({
      actions: [{
        account: code,
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active'
        }],
        data: {
          from,
          to,
          quantity,
          memo
        }
      }]
    }, [secret], {
      blocksBehind: 3,
      expireSeconds: 30
    });
    return res;
  },
  async billAuthTransfer({ secret, from, to, code, amount, decimal, symbol, memo, billAccount }) {
    const quantity = `${new BigNumber(amount).toFixed(parseInt(decimal), 1)} ${symbol.toUpperCase()}`;
    const res = await this.safeApi.safeBillAuthTransact({
      actions: [{
        account: code,
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active'
        }],
        data: {
          from,
          to,
          quantity,
          memo
        }
      }]
    }, [secret], {
      blocksBehind: 3,
      expireSeconds: 30,
      billAccount
    });
    return res;
  },
  isUnknownKey(err) {
    return err.message.includes("unknown key");
  }
}