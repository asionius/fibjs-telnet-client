var telnet = require("../lib/telnet-client");
var test = require("test")
test.setup();

var opt = {
	host: "127.0.0.1",
	port: 2323,
	shellPrompt: "/ # ",
	timeout: 3000
}

describe("fibjs-telnet-client", function() {
	var conn = new telnet();
	it("connect", function() {
		var res = conn.connect(opt);
		assert.equal(res, opt.shellPrompt);
	});
	it("exec", function() {
		var res = conn.exec('uptime');
		assert.equal(res, "23:14  up 1 day, 21:50, 6 users, " + "load averages: 1.41 1.43 1.41");
	});
	it("close", function() {
		assert.doesNotThrow(() => {
			conn.close();
		})
	});
});
test.run();