import BigNumber from "bignumber.js";
import fingateInstance from "./instance";

export default {
  data() {
    return {
      currentOrder: null,
      moacTokens: {},
      ethTokens: {},
      tronTokens: {},
      eosTokens: {},
      bscTokens: {},
      hecoTokens: {},
    }
  },
  methods: {
    init(coin) {
      console.log("deposit coin: " + coin);
    },
    initData(coin) {
      this.init(coin);
    },
    getChainHost(hostsName) {
      let hosts = this.$store.getters.hosts[hostsName];
      if (!Array.isArray(hosts) || hosts.length === 0) {
        hosts = process.env[hostsName];
      }
      let host = hosts[Math.floor(Math.random() * hosts.length)];
      if (hostsName === "ethHosts" || hostsName === "moacHosts") {
        host = `https://${host}`;
      }
      return host;
    },
    depositStream(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("streamHosts");
        const destination = "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK";
        let stmFingateInstance
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "STM" }));
          const instance = await fingateInstance.init("stream", node);
          stmFingateInstance = instance.stmFingateInstance;
          stmFingateInstance.connect();
          const balance = await stmFingateInstance.getBalance(address);
          console.log('stream balance:', balance);
          if (new BigNumber(amount).gt(balance)) {
            return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance })));
          }
          this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
          const hash = await stmFingateInstance.transfer(secret, destination, amount, memo);
          return resolve(hash);
        } catch (error) {
          console.log("deposit stream error:", error);
          return reject(new Error(this.$t('message.deposit.failed')));
        } finally {
          stmFingateInstance.disconnect();
        }
      })
    },
    depositBizain(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("bizainHosts");
        const destination = "bwtC9ARd3wo7Kx3gKQ49uVgcKxoAiV1iM2";
        let bizInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "BIZ" }));
          const instance = await fingateInstance.init("bizain", node);
          bizInstance = instance.bizainFingateInstance;
          await bizInstance.connect();
          const balance = await bizInstance.balanceOf(address);
          console.log('bizain balance:', balance);
          if (new BigNumber(amount).gt(balance)) {
            return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance })));
          }
          this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
          const hash = await bizInstance.transfer(secret, destination, amount, memo);
          return resolve(hash);
        } catch (error) {
          console.log("deposit bizain error:", error);
          return reject(new Error(this.$t('message.deposit.failed')));
        } finally {
          bizInstance.disconnect();
        }
      });
    },
    depositRipple(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("rippleHosts");
        const destination = "rMUpPikgdhmtCida2zf4CMBLrBREfCeYcy";
        const limit = 20.1;
        let rippleFingateInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "XRP" }));
          const instance = await fingateInstance.init("ripple", node);
          rippleFingateInstance = instance.rippleFingateInstance;
          await rippleFingateInstance.connect();
          const balance = await rippleFingateInstance.getXrpBalance(address);
          console.log('xrp balance:', balance);
          if (new BigNumber(amount).gt(balance)) {
            return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance })));
          }
          if (new BigNumber(balance).minus(amount).lt(limit)) {
            return reject(new Error(this.$t("message.deposit.xrp_limit")));
          }
          this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
          const hash = await rippleFingateInstance.transfer(secret, destination, amount, memo);
          return resolve(hash);
        } catch (error) {
          console.log("deposit ripple error:", error);
          return reject(new Error(this.$t('message.deposit.failed')));
        } finally {
          rippleFingateInstance.disconnect();
        }
      })
    },
    depositCall(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("callHosts");
        const destination = "cs9AWskwRmJrcMsszqC4hWeedCL5vSpexv";
        let callFingateInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "CALL" }));
          const instance = await fingateInstance.init("call", node);
          callFingateInstance = instance.callFingateInstance;
          await callFingateInstance.connect();
          const balance = await callFingateInstance.getCallBalance(address);
          console.log('call balance:', balance);
          if (new BigNumber(amount).gt(balance)) {
            return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance })));
          }
          this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
          const hash = await callFingateInstance.transfer(secret, destination, amount, memo);
          return resolve(hash);
        } catch (error) {
          console.log("deposit call error:", error);
          return reject(new Error(this.$t('message.deposit.failed')));
        } finally {
          callFingateInstance.disconnect();
        }
      })
    },
    depositMoac(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("moacHosts");
        const minLimit = 0.1;
        const scAddress = "0x66c9b619215db959ec137ede6b96f3fa6fd35a8a";
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "MOAC" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("moac", node, scAddress)
        const { moacInstance, moacFingateInstance } = instance;
        const balance = await moacInstance.getBalance(address);
        console.log('moac balance:', balance);
        const isJMOAC = this.coin.toLowerCase() === "jmoac";
        if (isJMOAC) {
          try {
            if (new BigNumber(amount).gt(balance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance })));
            }
            if (new BigNumber(balance).minus(minLimit).lt(amount)) {
              return reject(new Error(this.$t('message.deposit.moac_limit')));
            }
            const state = await moacFingateInstance.depositState(address);
            if (moacFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            const hash = await moacFingateInstance.deposit(memo.jtaddress, amount, secret);
            return resolve(hash);
          } catch (error) {
            console.log("deposit moac error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        } else {
          if (new BigNumber(balance).lt(minLimit)) {
            return reject(new Error(this.$t('message.deposit.moac_limit')));
          }
          let coin = this.coin.toUpperCase();
          console.log("deposit moac erc20:" + coin);
          let tokenContract = this.moacTokens[coin].contract;
          try {
            const instance = await fingateInstance.initWithContract("moac", node, scAddress, tokenContract);
            const moacErc20Instance = instance.moacERC20Instance;
            const state = await moacFingateInstance.depositState(address, tokenContract);
            if (moacFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            let tokenBalance = await moacErc20Instance.balanceOf(address);
            console.log(coin + " balance:", tokenBalance);
            if (new BigNumber(amount).gt(tokenBalance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: tokenBalance })));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            let hash = await moacErc20Instance.transfer(secret, scAddress, amount);
            let depositTokenHash = null;
            while (depositTokenHash === null) {
              try {
                depositTokenHash = await moacFingateInstance.depositToken(memo.jtaddress, tokenContract, await moacErc20Instance.decimals(), amount, hash, secret);
              } catch (error) {
                console.log("deposit token error:", error);
              }
            }
            /* istanbul ignore else  */
            if (depositTokenHash) {
              return resolve(depositTokenHash);
            }
          } catch (error) {
            console.log("deposit moac erc20 error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        }
      });
    },
    depositEthereum(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("ethHosts");
        const scAddress = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";
        const minLimit = this.ethBalanceMinLimit || 0.04;
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "ETH" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("ethereum", node, scAddress)
        const { ethereumInstance, ethereumFingateInstance } = instance;
        let ethBalance = await ethereumInstance.getBalance(address);
        const isJETH = this.coin.toUpperCase() === "JETH";
        if (isJETH) {
          try {
            if (new BigNumber(amount).gt(ethBalance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: ethBalance })));
            }
            if (new BigNumber(ethBalance).minus(minLimit).lt(amount)) {
              return reject(new Error(this.$t('message.deposit.eth_limit', { value: minLimit })));
            }
            const state = await ethereumFingateInstance.depositState(address);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            const hash = await ethereumFingateInstance.deposit(secret, memo.jtaddress, amount);
            return resolve(hash);
          } catch (error) {
            console.log("deposit eth error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        } else {
          try {
            if (new BigNumber(ethBalance).lt(minLimit)) {
              return reject(new Error(this.$t('message.deposit.eth_limit', { value: minLimit })));
            }
            const coin = this.coin.toUpperCase();
            const tokenContract = this.ethTokens[coin].contract;
            const instance = await fingateInstance.initWithContract("ethereum", node, scAddress, tokenContract);
            const etherErc20Instance = instance.ethereumERC20Instance;
            const state = await ethereumFingateInstance.depositState(address, tokenContract);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            const balance = await etherErc20Instance.balanceOf(address);
            console.log(coin + " balance:", balance);
            if (new BigNumber(amount).gt(balance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: balance })));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            const decimals = await etherErc20Instance.decimals();
            const transferHash = await etherErc20Instance.transfer(secret, scAddress, amount);
            let depositTokenHash = null;
            while (depositTokenHash === null) {
              try {
                depositTokenHash = await ethereumFingateInstance.depositToken(memo.jtaddress, tokenContract, decimals, amount, transferHash, secret)
              } catch (error) {
                console.log("deposit token error:", error);
              }
            }
            /* istanbul ignore else  */
            if (depositTokenHash) {
              return resolve(depositTokenHash);
            }
          } catch (error) {
            console.log("deposit ethereum erc20 error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        }
      })
    },
    depositBvc(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("bvcadtHosts");
        const destination = "bKTVoMNDrKijfmNDSBPqYmBiUPbCjHaviB";
        let bvcadtFingateInstance;
        try {
          const instance = await fingateInstance.init("bvcadt", node);
          bvcadtFingateInstance = instance.bvcadtFingateInstance;
          const res = await bvcadtFingateInstance.transfer("CADT", { secret, address }, { address: destination }, amount, memo);
          if (res.result && res.data.result.engine_result === 'tesSUCCESS') {
            return resolve(res.data.result.tx_json.hash);
          } else {
            return reject(res.data.result.engine_result_message)
          }
        } catch (error) {
          console.log("deposit bvcadt error:", error);
          return reject(new Error(this.$t('message.deposit.failed')));
        }
      })
    },
    depositTron(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("tronHosts");
        const coin = this.coin.toUpperCase();
        const destination = "TYRd6uRb4QFByw4ovRopETwXrb9vZdyz7E"
        let tronFingateInstance;
        try {
          const instance = await fingateInstance.init("tron", node);
          tronFingateInstance = instance.tronFingateInstance;
          if (coin === "JTRX") {
            let resTRX = await tronFingateInstance.sendTrx(secret, address, destination, amount, memo);
            if (resTRX.result) {
              return resolve(resTRX.txid);
            } else {
              return reject(resTRX);
            }
          } else if (coin === "JUSDT" || coin === "JTPT" || coin === "JJST") {
            const tokenContract = this.tronTokens[coin].contract;
            let resTRC20 = await tronFingateInstance.sendTrc20(secret, address, destination, amount, tokenContract, memo)
            if (resTRC20.result) {
              return resolve(resTRC20.txid);
            } else {
              return reject(resTRC20);
            }
          }
        } catch (error) {
          return reject(new Error(this.$t('message.deposit.failed')));
        }
      })
    },
    depositEos(secret, address, amount, memos) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("eosHosts");
        const coin = this.coin.toUpperCase();
        const code = this.eosTokens[coin].contract;
        const decimal = this.eosTokens[coin].decimal;
        const symbol = coin.substr(1);
        const destination = "jccfingate11" // 银关账号
        let eosFingateInstance;
        try {
          const instance = await fingateInstance.init("eos", node);
          eosFingateInstance = instance.eosFingateInstance;
          let resEOS = "";
          // TP 顺畅模式
          if (this.isTpSmoothMode) {
            resEOS = await eosFingateInstance.billAuthTransfer({ secret, from: address, to: destination, amount, decimal, symbol, code, memo: `${JSON.stringify(memos)}`, billAccount: "1stbill.tp" });
          } else {
            resEOS = await eosFingateInstance.transfer({ secret, from: address, to: destination, amount, decimal, symbol, code, memo: `${JSON.stringify(memos)}` });
          }
          if (resEOS && resEOS.transaction_id) {
            return resolve(resEOS.transaction_id);
          } else {
            return reject(new Error(resEOS));
          }
        } catch (error) {
          console.log("deposit eos error:", error.message);
          let resource = "";
          if (error.message.indexOf("is greater than the maximum billable CPU time for the transaction") !== -1) {
            resource = "CPU";
          } else if (error.message.indexOf("NET") !== -1) {
            resource = "NET";
          } else if (error.message.indexOf("RAM") !== -1) {
            resource = "RAM";
          } else {
            console.log(error.message)
            return reject(new Error(this.$t('message.deposit.failed')));
          }
          return reject(new Error(this.$t('message.depositEosFailedTip', { resource })));
        }
      })
    },
    depositHeco(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("hecoHosts");
        const scAddress = "0x1cda44Da59E8e621088a06756Eb772eF1a6024D9";
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "HECO" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("ethereum", node, scAddress)
        const { ethereumInstance, ethereumFingateInstance } = instance;
        let hecoBalance = await ethereumInstance.getBalance(address);
        const coin = this.coin.toUpperCase();
        if (coin === "JHT") {
          try {
            if (new BigNumber(amount).gt(hecoBalance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: hecoBalance })));
            }
            const state = await ethereumFingateInstance.depositState(address);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            const hash = await ethereumFingateInstance.deposit(secret, memo.jtaddress, amount);
            return resolve(hash);
          } catch (error) {
            console.log("deposit eth error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        } else {
          try {
            const tokenContract = this.hecoTokens[coin].contract;
            const instance = await fingateInstance.initWithContract("ethereum", node, scAddress, tokenContract);
            const etherErc20Instance = instance.ethereumERC20Instance;
            const state = await ethereumFingateInstance.depositState(address, tokenContract);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            const balance = await etherErc20Instance.balanceOf(address);
            console.log(coin + " balance:", balance);
            if (new BigNumber(amount).gt(balance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: balance })));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            ethereumFingateInstance.initErc20(etherErc20Instance);
            let receipts = ethereumFingateInstance.depositErc20(secret, memo.jtaddress, amount);
            if (receipts && receipts.length === 2) {
              return resolve(receipts[0])
            } else {
              return reject(new Error(this.$t('message.deposit.failed')));
            }
          } catch (error) {
            console.log("deposit ethereum erc20 error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        }
      });
    },
    depositBsc(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const node = this.getChainHost("bscHosts");
        const scAddress = "0xf2fa7c80f7f5272a820981c8168859242525b807";
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "BSC" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("ethereum", node, scAddress)
        const { ethereumInstance, ethereumFingateInstance } = instance;
        let bscBalance = await ethereumInstance.getBalance(address);
        const coin = this.coin.toUpperCase();
        if (coin === "JBNB") {
          try {
            if (new BigNumber(amount).gt(bscBalance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: bscBalance })));
            }
            const state = await ethereumFingateInstance.depositState(address);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            const hash = await ethereumFingateInstance.deposit(secret, memo.jtaddress, amount);
            return resolve(hash);
          } catch (error) {
            console.log("deposit eth error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        } else {
          try {
            const tokenContract = this.bscTokens[coin].contract;
            const instance = await fingateInstance.initWithContract("ethereum", node, scAddress, tokenContract);
            const etherErc20Instance = instance.ethereumERC20Instance;
            const state = await ethereumFingateInstance.depositState(address, tokenContract);
            if (ethereumFingateInstance.isPending(state)) {
              return reject(new Error(this.$t('message.deposit.previous_deposit_not_finish')));
            }
            const balance = await etherErc20Instance.balanceOf(address);
            console.log(coin + " balance:", balance);
            if (new BigNumber(amount).gt(balance)) {
              return reject(new Error(this.$t('message.deposit.more_than_available_balance', { balance: balance })));
            }
            this.changeLoadingState(this.$t("message.deposit.request_balance_success"));
            ethereumFingateInstance.initErc20(etherErc20Instance);
            let receipts = ethereumFingateInstance.depositErc20(secret, memo.jtaddress, amount);
            if (receipts && receipts.length === 2) {
              return resolve(receipts[0])
            } else {
              return reject(new Error(this.$t('message.deposit.failed')));
            }
          } catch (error) {
            console.log("deposit ethereum erc20 error:", error);
            return reject(new Error(this.$t('message.deposit.failed')));
          }
        }
      })
    }
  }
}