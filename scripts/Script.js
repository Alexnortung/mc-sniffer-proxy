class Script {
    constructor(proxy) {
        this.proxy = proxy
        this.aborted = false
    }

    async execute() {

    }
    
    abort() {
        this.aborted = true
        this.proxy = null
    }
}

module.exports = Script