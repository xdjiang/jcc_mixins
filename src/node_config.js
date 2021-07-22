module.exports = {
  computed: {
    hosts() {
      return this.$store.getters.hosts
    },
    bizHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.bizHosts.length > 0 ? this.hosts.bizHosts : process.env.bizHosts
    },
    exHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.exHosts.length > 0 ? this.hosts.exHosts : process.env.exHosts
    },
    infoHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.infoHosts.length > 0 ? this.hosts.infoHosts : process.env.infoHosts
    },
    cfgHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.cfgHosts.length > 0 ? this.hosts.cfgHosts : process.env.cfgHosts
    },
    jcNodes() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.jcNodes.length > 0 ? this.hosts.jcNodes : process.env.jcNodes
    },
    callHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.callHosts.length > 0 ? this.hosts.callHosts : process.env.callHosts
    },
    rippleHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.rippleHosts.length > 0 ? this.hosts.rippleHosts : process.env.rippleHosts
    },
    streamHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.streamHosts.length > 0 ? this.hosts.streamHosts : process.env.streamHosts
    },
    bizainHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.bizainHosts.length > 0 ? this.hosts.bizainHosts : process.env.bizainHosts
    },
    bvcadtHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.bvcadtHosts.length > 0 ? this.hosts.bvcadtHosts : process.env.bvcadtHosts
    },
    tronHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.tronHosts.length > 0 ? this.hosts.tronHosts : process.env.tronHosts
    },
    eosHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.eosHosts.length > 0 ? this.hosts.eosHosts : process.env.eosHosts
    },
    bscHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.bscHosts.length > 0 ? this.hosts.bscHosts : process.env.bscHosts
    },
    hecoHosts() {
      if (process.env.proxy) {
        return [];
      }
      return this.hosts.hecoHosts.length > 0 ? this.hosts.hecoHosts : process.env.hecoHosts
    },
    https() {
      return process.env.NODE_ENV === 'production'
    },
    bizPort() {
      return this.https ? 443 : process.env.bizPort
    },
    exPort() {
      return this.https ? 443 : process.env.exPort
    },
    infoPort() {
      return this.https ? 443 : process.env.infoPort
    },
    cfgPort() {
      return this.https ? 443 : process.env.cfgPort
    }
  }
}