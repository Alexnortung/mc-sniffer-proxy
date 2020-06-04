const BoatTPScript = require('./BoatTPScript')

class ScriptLoader {
    constructor(proxy) {
        this.proxy = proxy
    }

    executeBoatScript(options) {
        try {
            let script = new BoatTPScript(this.proxy, options)
            script.execute()
        } catch (error) {
            console.log(error);
            return
        }

    }
}

module.exports = ScriptLoader