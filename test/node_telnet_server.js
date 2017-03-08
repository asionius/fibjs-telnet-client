var telnet_server = require('telnet')

srv = telnet_server.createServer(function(c) {
	c.write(new Buffer("BusyBox v1.19.2 () built-in shell (ash)\n" + "Enter 'help' for a list of built-in commands.\n\n/ # ", 'ascii'))

	c.on('data', function() {
		c.write(new Buffer("uptime\r\n23:14  up 1 day, 21:50, 6 users, " + "load averages: 1.41 1.43 1.41\r\n", 'ascii'))
		c.write(new Buffer("/ # ", 'ascii'))
	})
})

srv.listen(2323, function() {})