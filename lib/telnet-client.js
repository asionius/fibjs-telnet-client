'use strict'
let net = require("net");

module.exports = function() {
	this.connect = (opts) => {
		const host = (typeof opts.host !== 'undefined' ? opts.host : '127.0.0.1')
		const port = (typeof opts.port !== 'undefined' ? opts.port : 23)
		const timeout = (typeof opts.timeout !== 'undefined' ? opts.timeout : 500)

		// Set prompt regex defaults
		this.shellPrompt = (typeof opts.shellPrompt !== 'undefined' ? opts.shellPrompt : /(?:\/ )?#\s/)
		this.loginPrompt = (typeof opts.loginPrompt !== 'undefined' ? opts.loginPrompt : /login[: ]*$/i)
		this.passwordPrompt = (typeof opts.passwordPrompt !== 'undefined' ? opts.passwordPrompt : /Password: /i)

		// username and password
		this.username = (typeof opts.username !== 'undefined' ? opts.username : 'root')
		this.password = (typeof opts.password !== 'undefined' ? opts.password : 'guest')
		this.irs = (typeof opts.irs !== 'undefined' ? opts.irs : '\r\n')
		this.ors = (typeof opts.ors !== 'undefined' ? opts.ors : '\n')
		this.echoLines = (typeof opts.echoLines !== 'undefined' ? opts.echoLines : 1)
		this.stripShellPrompt = (typeof opts.stripShellPrompt !== 'undefined' ? opts.stripShellPrompt : true)
		this.execTimeout = (typeof opts.execTimeout !== 'undefined' ? opts.execTimeout : 2000)
		this.sendTimeout = (typeof opts.sendTimeout !== 'undefined' ? opts.sendTimeout : 2000)
		this.maxBufferLength = (typeof opts.maxBufferLength !== 'undefined' ? opts.maxBufferLength : 1048576)

		this.socket = new net.Socket()
		this.socket.timeout = timeout;
		this.socket.connect(host, port)

		let ctimeout = null;
		if (timeout) {
			ctimeout = setTimeout(() => {
				this.socket.close();
			}, timeout)
		}
		while (1) {
			let res = _parseData(this.socket.recv())
			if (!res) continue
			if (ctimeout !== null) {
				clearTimeout(ctimeout);
			}
			if (_search(res, this.loginPrompt) !== -1) {
				this.socket.write(new Buffer(this.username + this.ors))
			} else if (_search(res, this.passwordPrompt) !== -1) {
				this.socket.write(new Buffer(this.password + this.ors))
			} else if (_search(res, this.shellPrompt) !== -1) {
				return this.shellPrompt;
			}
		}
	}

	this.exec = (cmd, opts) => {
		if (opts && opts instanceof Object) {
			this.shellPrompt = opts.shellPrompt || this.shellPrompt
			this.loginPrompt = opts.loginPrompt || this.loginPrompt
			this.failedLoginMatch = opts.failedLoginMatch || this.failedLoginMatch
			this.timeout = opts.timeout || this.timeout
			this.execTimeout = opts.execTimeout || this.execTimeout
			this.irs = opts.irs || this.irs
			this.ors = opts.ors || this.ors
			this.echoLines = opts.echoLines || this.echoLines
			this.maxBufferLength = opts.maxBufferLength || this.maxBufferLength
		}
		cmd += this.ors;
		let execTimeout = null;
		if (this.execTimeout) {
			execTimeout = setTimeout(() => {
				this.socket.close();
			}, this.execTimeout);
		}
		this.socket.write(new Buffer(cmd));
		let ret = ""
		while (1) {
			ret += _parseData(this.socket.recv())
			if (_search(ret, this.shellPrompt) !== -1) {
				let rets = ret.split(this.irs)
				if (this.echoLines == 1)
					rets.shift()
				else if (this.echoLines > 1)
					rets.splice(0, this.echoLines)
				if (this.stripShellPrompt) {
					rets.pop()
				}
				if (execTimeout !== null) {
					clearTimeout(execTimeout)
				}
				return rets.join(this.irs)
			}
		}

	}

	this.send = (data, opts) => {
		if (opts && opts instanceof Object) {
			this.ors = opts.ors || this.ors
			this.sendTimeout = opts.timeout || this.sendTimeout
			this.maxBufferLength = opts.maxBufferLength || this.maxBufferLength

			data += this.ors
		}
		this.socket.write(new Buffer(data));
		return this.socket.read();
	}

	this.recv = () => {
		return this.socket.recv();
	}
	this.close = () => {
		this.socket.close()
		this.socket.dispose()
	}

	var _parseData = (chunk) => {
		if (!chunk) {
			throw (new Error("Broken pipe"));
		}
		if (chunk[0] === 255 && chunk[1] !== 255) {
			const negReturn = _negotiate(chunk)

			if (negReturn == undefined) return
			else chunk = negReturn
		}
		return chunk.toString();
	}

	var _negotiate = (chunk) => {
		// info: http://tools.ietf.org/html/rfc1143#section-7
		// refuse to start performing and ack the start of performance
		// DO -> WONT WILL -> DO
		const packetLength = chunk.length

		let negData = chunk
		let cmdData = null
		let negResp = null

		for (let i = 0; i < packetLength; i += 3) {
			if (chunk[i] != 255) {
				negData = chunk.slice(0, i)
				cmdData = chunk.slice(i)
				break
			}
		}

		negResp = negData.toString('hex').replace(/fd/g, 'fc').replace(/fb/g, 'fd')

		this.socket.write(new Buffer(negResp, 'hex'));

		if (cmdData != undefined) return cmdData
		else return
	}

	var _search = (str, pattern) => {
		if (pattern instanceof RegExp) return str.search(pattern)
		else return str.indexOf(pattern)
	}
}