import BigNumber from "bignumber.js";
import fingateInstance from "./instance";

const getEthHost = (hosts) => {
  /* istanbul ignore if  */
  if (!Array.isArray(hosts) || hosts.length === 0) {
    hosts = process.env.ethHosts;
  }
  let host = hosts[Math.floor(Math.random() * hosts.length)];
  let url = `https://${host}`;
  return url;
}

const getMoacHost = (hosts) => {
  /* istanbul ignore if  */
  if (!Array.isArray(hosts) || hosts.length === 0) {
    hosts = process.env.moacHosts;
  }
  let host = hosts[Math.floor(Math.random() * hosts.length)];
  let url = `https://${host}`;
  return url;
}

export default {
  data() {
    return {
      currentOrder: null,
      moacTokens: {
        JSNRC: { contract: "0x1b9bae18532eeb8cd4316a20678a0c43f28f0ae2" },
        JCKM: { contract: "0x4d206d18fd036423aa74815511904a2a40e25fb1" },
        JFST: { contract: "0x4c6007cea426e543551f2cb6392e6d6768f74706" },
        JPG: { contract: "0x8bbea7dbb25e4f0006d77e00083808e7eb0d45e8" },
        JAIT: { contract: "0xf0b340de6136416c934c55749d9adb58eb61a73e" },
        JJCT: { contract: "0x1ef191730c0094c8bba0c18818c2938da9909527" },
        JMAQ: { contract: "0x72f6a8ffa450feb4f88d92fc90a71e0d2986b275" }
      },
      ethTokens: {
        JETH: { contract: "0x0000000000000000000000000000000000000000" },
        JMOAC: { contract: "0xCBcE61316759D807c474441952cE41985bBC5a40" },
        JJCC: { contract: "0x9BD4810a407812042F938d2f69f673843301cfa6" },
        JEOS: { contract: "0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0" },
        JCALL: { contract: "0xcE3D828Bdb96d7c6C20Ecbfd63e572dc1C8AbD32" },
        JEKT: { contract: "0x4ecdb6385f3db3847f9c4a9bf3f9917bb27a5452" },
        JDABT: { contract: "0x1C6890825880566dd6Ad88147E0a6acE7930b7c0" },
        JBIZ: { contract: "0x399f9A95305114efAcB91d1d6C02CBe234dD36aF" },
        JSLASH: { contract: "0xE222e2e3517f5AF5e3abc667adF14320C848D6dA" },
        JGSGC: { contract: "0x0ec2a5ec6a976d6d4c101fb647595c9d8d21779e" },
        JUSDT: { contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
        JHT: { contract: "0x6f259637dcd74c767781e37bc6133cd6a68aa161" },
        JGN: { contract: "0x364b810aCBad792b8eEac401c7d4E5E001B92b67" },
        JTPT: { contract: "0x4161725d019690a3e0de50f6be67b07a86a9fae1" },
        JUNI: { contract: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
        JVEE: { contract: "0x340d2bde5eb28c1eed91b2f790723e3b160613b7" },
        JOST: { contract: "0x2c4e8f2d746113d0696ce89b35f0d8bf88e0aeca" },
        JSUSHI: { contract: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2" }
      },
      tronTokens: {
        JUSDT: { contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" },
        JTPT: { contract: "TYJ4Wn8juQL6PiY9o3c1PCN4Wh4wdXJL7S" },
        JJST: { contract: "TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9" }
      },
      eosTokens: {
        JUSDT: {
          contract: "tethertether",
          decimal: 4
        },
        JTPT: {
          contract: "eosiotptoken",
          decimal: 4
        },
        JEOS: {
          contract: "eosio.token",
          decimal: 4
        },
        JOGX: {
          contract: "core.ogx",
          decimal: 8
        }
      },
      bscTokens: {
        JUSDT: { contract: "0x55d398326f99059ff775485246999027b3197955" },
        JTPT: { contract: "0xeca41281c24451168a37211f0bc2b8645af45092" },
        SWT: { contract: "0x7defabf8d31dc4f784a20b330ab86a58e89b896e" },
        JMOAC: { contract: "0xae489db3ca42179c603d0e143cd1f9e14b64c7cd" },
        JETH: { contract: "0x2170ed0880ac9a755fd29b2688956bd959f933f8" },
        JCAKE: { contract: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82" },
        JUNI: { contract: "0xbf5140a22578168fd562dccf235e5d43a02ce9b1" },
        CSP: { contract: "0x9b5529C193f016BFBA6573B8A6d9e4bBEAd26149" },
        JEOS: { contract: "0x56b6fb708fc5732dec1afc8d8556423a2edccbd6" },
        JFLL: { contract: "0x7c9c6ec951dcc4f1bceffafb5af32062e2fb3b01" },
        JXVS: { contract: "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63" },
        JVRT: { contract: "0x5f84ce30dc3cf7909101c69086c50de191895883" },
        JSUSHI: { contract: "0x947950bcc74888a40ffa2593c5798f11fc9124c4" },
        JXRP: { contract: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE" }
      },
      hecoTokens: {
        JUSDT: { contract: "0xa71edc38d189767582c38a3145b5873052c3e47a" },
        JTPT: { contract: "0x9ef1918a9bee17054b35108bd3e2665e2af1bb1b" },
        SWT: { contract: "0xf3f9e20b9e03ce3e2922fa212103ed92bf06e401" },
        JMOAC: { contract: "0x8dbbc56380f3dae866729b2199538554ec9b3f15" },
        JETH: { contract: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd" },
        JPIPI: { contract: "0xaaae746b5e55d14398879312660e9fde07fbc1dc" },
        JUNI: { contract: "0x22c54ce8321a4015740ee1109d9cbc25815c46e6" },
        JEOS: { contract: "0xae3a94a6dc7fce46b40d63bbf355a3ab2aa2a588" },
        JSUSHI: { contract: "0x52e00b2da5bd7940ffe26b609a42f957f31118d5" },
        JXRP: { contract: "0xA2F3C2446a3E20049708838a779Ff8782cE6645a" }
      },
    }
  },
  methods: {
    init(coin) {
      console.log("deposit coin: " + coin);
    },
    initData(coin) {
      this.init(coin);
    },
    getEthHost() {
      let ethHosts = this.$store.getters.hosts.ethHosts;
      let host = getEthHost(ethHosts);
      return host;
    },
    getMoacHost() {
      let ethHosts = this.$store.getters.hosts.moacHosts;
      let host = getMoacHost(ethHosts);
      return host;
    },
    depositStream(secret, address, amount, memo) {
      return new Promise(async (resolve, reject) => {
        const destination = "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK";
        let stmFingateInstance
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "STM" }));
          const instance = await fingateInstance.init("stream");
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
        const destination = "bwtC9ARd3wo7Kx3gKQ49uVgcKxoAiV1iM2";
        let bizInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "BIZ" }));
          const instance = await fingateInstance.init("bizain");
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
        const destination = "rMUpPikgdhmtCida2zf4CMBLrBREfCeYcy";
        const limit = 20.1;
        let rippleFingateInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "XRP" }));
          const instance = await fingateInstance.init("ripple");
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
        const destination = "cs9AWskwRmJrcMsszqC4hWeedCL5vSpexv";
        let callFingateInstance;
        try {
          this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "CALL" }));
          const instance = await fingateInstance.init("call");
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
        const minLimit = 0.1;
        const scAddress = "0x66c9b619215db959ec137ede6b96f3fa6fd35a8a";
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "MOAC" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("moac", this.getMoacHost(), scAddress)
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
            const instance = await fingateInstance.initWithContract("moac", this.getMoacHost(), scAddress, tokenContract);
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
        const scAddress = "0x3907acb4c1818adf72d965c08e0a79af16e7ffb8";
        const minLimit = this.ethBalanceMinLimit || 0.04;
        this.changeLoadingState(this.$t("message.deposit.request_balance", { name: "ETH" }));
        fingateInstance.destroy();
        const instance = await fingateInstance.initWithContract("ethereum", this.getEthHost(), scAddress)
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
            const instance = await fingateInstance.initWithContract("ethereum", this.getEthHost(), scAddress, tokenContract);
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
        const destination = "bKTVoMNDrKijfmNDSBPqYmBiUPbCjHaviB";
        let bvcadtFingateInstance;
        try {
          const instance = await fingateInstance.init("bvcadt");
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
        const coin = this.coin.toUpperCase();
        const destination = "TYRd6uRb4QFByw4ovRopETwXrb9vZdyz7E" // trx银关
        let tronFingateInstance;
        try {
          const instance = await fingateInstance.init("tron");
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
        const coin = this.coin.toUpperCase();
        const code = this.eosTokens[coin].contract;
        const decimal = this.eosTokens[coin].decimal;
        const symbol = coin.substr(1);
        const destination = "jccfingate11" // 银关账号
        let eosFingateInstance;
        try {
          const instance = await fingateInstance.init("eos");
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
        const node = "https://http-mainnet-node.huobichain.com";
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
        const node = "https://bsc-dataseed1.binance.org:443";
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