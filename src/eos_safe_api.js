const { Api } = require('eosjs');
const { digestFromSerializedData } = require('eosjs/dist/eosjs-jssig');
const EC = require("elliptic").ec;
const { PrivateKey } = require('eosjs/dist/eosjs-key-conversions');
const defaultEc = new EC('secp256k1');

const axios = require("axios");
const service = axios.create({
  timeout: 30000
});
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (err) => {
    return Promise.reject(err)
  }
);

const sign = ({ chainId, privateKeys, serializedTransaction, serializedContextFreeData }) => {
  const digest = digestFromSerializedData(chainId, serializedTransaction, serializedContextFreeData, defaultEc);
  const signatures = [];
  for (const priv of privateKeys) {
    const signature = priv.sign(digest, false);
    signatures.push(signature.toString());
  }

  return { signatures, serializedTransaction, serializedContextFreeData };
};

Api.prototype.safeTransact = async function (transaction, privateKeys, options) {
  let info;
  let { blocksBehind, useLastIrreversible, expireSeconds, compression } = options;

  if (typeof blocksBehind === 'number' && useLastIrreversible) {
    throw new Error('Use either blocksBehind or useLastIrreversible');
  }

  if (!this.chainId) {
    info = await this.rpc.get_info();
    this.chainId = info.chain_id;
  }

  if ((typeof blocksBehind === 'number' || useLastIrreversible) && expireSeconds) {
    transaction = await this.generateTapos(info, transaction, blocksBehind, useLastIrreversible, expireSeconds);
  }

  if (!this.hasRequiredTaposFields(transaction)) {
    throw new Error('Required configuration or TAPOS fields are not present');
  }

  const abis = await this.getTransactionAbis(transaction);
  transaction = {
    ...transaction,
    context_free_actions: await this.serializeActions(transaction.context_free_actions || []),
    actions: await this.serializeActions(transaction.actions)
  };
  const serializedTransaction = this.serializeTransaction(transaction);
  const serializedContextFreeData = this.serializeContextFreeData(transaction.context_free_data);
  let pushTransactionArgs = {
    serializedTransaction,
    serializedContextFreeData,
    signatures: []
  };

  const availableKeys = [];
  const privs = [];
  for (const k of privateKeys) {
    const priv = PrivateKey.fromString(k);
    privs.push(priv);
    const pubStr = priv.getPublicKey().toString();
    availableKeys.push(pubStr);
  }
  const requiredKeys = await this.authorityProvider.getRequiredKeys({ transaction, availableKeys });
  pushTransactionArgs = await sign({
    chainId: this.chainId,
    requiredKeys,
    privateKeys: privs,
    serializedTransaction,
    serializedContextFreeData,
    abis
  });
  if (compression) {
    return this.pushCompressedSignedTransaction(pushTransactionArgs);
  }
  return this.pushSignedTransaction(pushTransactionArgs);
};

const tpSign = async (trans, signer) => {
  const res = await service({
    // https://preserver.mytokenpocket.vip/v1/sign 规避跨域问题，由同源nginx服务器代理
    url: process.env.NODE_ENV === "production" ? `${window.location.origin}/v1/sign` : "/v1/sign",
    data: trans,
    method: "post",
    headers: JSON.stringify({ Signer: signer })
  })
  if (res.message !== "success") {
    throw new Error(res.message);
  }
  return res.data.signature;
}

Api.prototype.safeBillAuthTransact = async function (transaction, privateKeys, options) {
  let info;
  let { blocksBehind, useLastIrreversible, expireSeconds, compression, billAccount } = options;
  if (typeof blocksBehind === 'number' && useLastIrreversible) {
    throw new Error('Use either blocksBehind or useLastIrreversible');
  }

  if (!this.chainId) {
    info = await this.rpc.get_info();
    this.chainId = info.chain_id;
  }
  if ((typeof blocksBehind === 'number' || useLastIrreversible) && expireSeconds) {
    transaction = await this.generateTapos(info, transaction, blocksBehind, useLastIrreversible, expireSeconds);
  }

  if (!this.hasRequiredTaposFields(transaction)) {
    throw new Error('Required configuration or TAPOS fields are not present');
  }

  const abis = await this.getTransactionAbis(transaction);

  // 代付账号
  const billActor = {
    actor: billAccount,
    permission: "active"
  }
  transaction = {
    ...transaction,
    context_free_actions: await this.serializeActions(transaction.context_free_actions || []),
    actions: await this.serializeActions(transaction.actions)
  };
  const availableKeys = [];
  const privs = [];
  for (const k of privateKeys) {
    const priv = PrivateKey.fromString(k);
    privs.push(priv);
    const pubStr = priv.getPublicKey().toString();
    availableKeys.push(pubStr);
  }
  const requiredKeys = await this.authorityProvider.getRequiredKeys({ transaction, availableKeys });
  // 代付账号放入actions数组首位
  transaction.actions[0].authorization.unshift(JSON.stringify(billActor));
  const serializedTransaction = this.serializeTransaction(transaction);
  const serializedContextFreeData = this.serializeContextFreeData(transaction.context_free_data);
  let pushTransactionArgs = {
    serializedTransaction,
    serializedContextFreeData,
    signatures: []
  };
  pushTransactionArgs = await sign({
    chainId: this.chainId,
    requiredKeys,
    privateKeys: privs,
    serializedTransaction,
    serializedContextFreeData,
    abis
  });
  const tpsign = await tpSign(transaction, billAccount);
  pushTransactionArgs.signatures.unshift(tpsign)
  if (compression) {
    return this.pushCompressedSignedTransaction(pushTransactionArgs);
  }
  return this.pushSignedTransaction(pushTransactionArgs);
};

module.exports = Api;
