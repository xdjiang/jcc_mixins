const JcWalletTool = require('jcc_wallet').JcWalletTool;
const createOrder = require('jcc_exchange').createOrder;
const isNumber = require('jcc_common').isNumber;
const formatNumber = require('./utils').formatNumber;
const BigNumber = require('bignumber.js');
const decimal = require('./decimal');
const currency = require('./currency');
const exchangeRate = require('./exchange_rate');
const nodeConfig = require('./node_config');
const bus = require('./utils').bus;
module.exports = {
    data() {
        return {
            lowestSellPrice: 0,
            hightestBuyPrice: 0,
            nowTime: new Date().getTime(),
            id: null,
            form: {
                price: "",
                amount: ""
            },
            ind: ""
        }
    },
    mixins: [exchangeRate, currency, decimal, nodeConfig],
    created() {
        bus.$on("setBasePrice", this.setBasePrice);
        bus.$on("choosePrice", this.choosePrice);
    },
    beforeDestroy() {
        clearInterval(this.id);
        bus.$off("setBasePrice", this.setBasePrice);
        bus.$off("choosePrice", this.choosePrice);
    },
    methods: {
        limitDecimal() {
            if (this.counter.toLowerCase() !== "swt") {
                return
            }
            let value = this.form.price
            if (!isNumber(value)) {
                this.form.price = 0;
                return
            }
            let n = 10 ** this.priceDecimal
            let price = Math.round(value * n) / n;
            this.form.price = price;
        },
        setBasePrice(hightestBuyPrice = 0, lowestSellPrice = 0) {
            this.hightestBuyPrice = hightestBuyPrice;
            this.lowestSellPrice = lowestSellPrice;
        },
        // check fat finger
        checkFatFinger(price, buy) {
            if (buy) {
                if (this.hightestBuyPrice === 0) {
                    return false;
                }
                return price / this.hightestBuyPrice >= 1.2;
            } else {
                if (this.lowestSellPrice === 0) {
                    return false;
                }
                return this.lowestSellPrice / price >= 1.2;
            }
        },
        validatePassword(checked, password) {
            return new Promise((resolve, reject) => {
                let inst = new JcWalletTool(this.jcWallet);
                inst.validatePassword(password, 'swt').then(secret => {
                    this.secretFree(checked, password);
                    this.confirmSubmit(secret).then(() => {
                        return resolve();
                    }).catch(err => {
                        return reject(err);
                    })
                }).catch(err => {
                    return reject(err);
                });
            })
        },
        getcheckClick() {
            var vm = this;
            vm.nowTime = new Date().getTime();
            var secretTemp = {
                timeStamp: 0,
                secret: ""
            };
            vm.$store.dispatch("updateSecretTemp", secretTemp);
        },
        secretFree(checked, secret) {
            let secretTemp = {
                timeStamp: 0,
                secret: ""
            };
            if (!checked) {
                this.$store.dispatch("updateSecretTemp", secretTemp);
            } else {
                secretTemp.timeStamp = new Date().getTime();
                secretTemp.secret = secret;
                this.$store.dispatch("updateSecretTemp", secretTemp);
                this.$store.dispatch("updateFreePasswordState", checked);
            }
        },
        confirmSubmit(secret) {
            return new Promise((resolve, reject) => {
                let counter = this.counter;
                let base = this.base;
                let issuer = process.env.currencies.UST.issuer;
                let address = this.publicKey;
                let type = this.type;
                let amount = this.form.amount;
                let sum = this.sum;
                let hosts = this.exHosts;
                let port = this.exPort;
                let https = this.https;
                createOrder(counter, base, issuer, address, type, amount, sum, secret, hosts, port, https).then(() => {
                    return resolve();
                }).catch(err => {
                    return reject(err);
                })
            });
        }
    },
    computed: {
        jcWallet() {
            return this.$store.getters.jcWallet;
        },
        priceText() {
            return this.type === 0 ? this.$t('message.bidPrice') : this.$t('message.askPrice');
        },
        numText() {
            return this.type === 0 ? this.$t('message.bidPrice') : this.$t('message.askPrice');
        },
        buttonText() {
            let base = this.baseTitle;
            let k = this.type === 0 ? 'message.bidToken' : 'message.askToken';
            return this.$t(k, {
                token: base
            });
        },
        publicKey() {
            return this.$store.getters.swtAddress;
        },
        available() {
            let counter = this.counter;
            let balance = this.balance;
            let aim;
            if (this.type === 0) {
                aim = counter;
            } else {
                aim = this.base;
            }
            if (aim.toLowerCase() === "cnt") aim = "cny";
            let available = balance[`balance_${aim.toLowerCase()}`];
            return formatNumber(available);
        },
        freezed() {
            let counter = this.counter;
            let balance = this.balance;
            let aim;
            if (this.type === 0) {
                aim = counter;
            } else {
                aim = this.base;
            }
            if (aim.toLowerCase() === "cnt") aim = "cny";
            let freezed = balance[`freezed_${aim.toLowerCase()}`];
            return formatNumber(freezed);
        },
        sum() {
            let price = this.form.price;
            let amount = this.form.amount;
            let sum
            if (isNumber(price) && isNumber(amount)) {
                sum = new BigNumber(price).multipliedBy(amount);
                sum = sum.toFixed(6);
                // sum = scientificToDecimal(Number(sum))
            } else {
                sum = 0;
            }
            return sum;
        },
        isZero() {
            return new BigNumber(this.sum).isEqualTo(0);
        },
        currentPrice() {
            let counter = this.counter;
            let price = parseFloat(this.form.price);
            let sum;
            if (!isNumber(price)) {
                sum = 0;
            } else {
                let rate = this.getExchangeRate(counter);
                sum = new BigNumber(price).multipliedBy(rate);
                sum = sum.toString();
                sum = isNumber(sum) ? formatNumber(sum) : 0;
            }
            return formatNumber(sum);
        },
        currency() {
            let aim;
            this.ind = "";
            if (this.type === 0) {
                aim = this.counterTitle;
            } else {
                aim = this.baseTitle;
            }
            return aim.toUpperCase();
        },
        checked: {
            get() {
                return this.$store.getters.freePasswordState;
            },
            set() {}
        },
        showPassword() {
            let isTimeout = this.nowTime - this.$store.getters.secretTemp.timeStamp >= 15 * 60 * 1000;
            return !this.checked || isTimeout;
        }
    }
};