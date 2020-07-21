// SPDX-License-Identifier: MIT

var Adb = {};

(function() {
	'use strict';

	Adb.Opt = {};
	Adb.Opt.debug = false;
	Adb.Opt.dump = false;

	Adb.Opt.key_size = 2048;
	Adb.Opt.reuse_key = -1;

	// Set this to false for new devices (post Dec 2017) if
	// autodetection doesn't handle it automatically.
	Adb.Opt.use_checksum = true;

	let db = init_db();
	let keys = db.then(load_keys);

	Adb.open = function(transport) {
		if (transport == "WebUSB")
			return Adb.WebUSB.Transport.open();

		throw new Error("Unsupported transport: " + transport);
	};

	Adb.WebUSB = {};

	Adb.WebUSB.Transport = function(device) {
		this.device = device;

		if (Adb.Opt.debug)
			console.log(this);
	};

	Adb.WebUSB.Transport.open = function() {
		let filters = [
			{ classCode: 255, subclassCode: 66, protocolCode: 1 },
			{ classCode: 255, subclassCode: 66, protocolCode: 3 }
		];

		return navigator.usb.requestDevice({ filters: filters })
			.then(device => device.open()
				.then(() => new Adb.WebUSB.Transport(device)));
	};

	Adb.WebUSB.Transport.prototype.close = function() {
		this.device.close();
	};

	Adb.WebUSB.Transport.prototype.send = function(ep, data) {
		if (Adb.Opt.dump)
			hexdump(new DataView(data), "" + ep + "==> ");

		return this.device.transferOut(ep, data);
	};

	Adb.WebUSB.Transport.prototype.receive = function(ep, len) {
		return this.device.transferIn(ep, len)
			.then(response => {
				if (Adb.Opt.dump)
					hexdump(response.data, "<==" + ep + " ");

				return response.data;
			});
	};

	Adb.WebUSB.Transport.prototype.find = function(filter) {
		for (let i in this.device.configurations) {
			let conf = this.device.configurations[i];
			for (let j in conf.interfaces) {
				let intf = conf.interfaces[j];
				for (let k in intf.alternates) {
					let alt = intf.alternates[k];
					if (filter.classCode == alt.interfaceClass &&
					    filter.subclassCode == alt.interfaceSubclass &&
					    filter.protocolCode == alt.interfaceProtocol) {
						return { conf: conf, intf: intf, alt: alt };	
					}
				}
			}
		}

		return null;
	}

	Adb.WebUSB.Transport.prototype.isAdb = function() {
		let match = this.find({ classCode: 255, subclassCode: 66, protocolCode: 1 });
		return match != null;
	};

	Adb.WebUSB.Transport.prototype.isFastboot = function() {
		let match = this.find({ classCode: 255, subclassCode: 66, protocolCode: 3 });
		return match != null;
	};

	Adb.WebUSB.Transport.prototype.getDevice = function(filter) {
		let match = this.find(filter);
		return this.device.selectConfiguration(match.conf.configurationValue)
			.then(() => this.device.claimInterface(match.intf.interfaceNumber))
			.then(() => this.device.selectAlternateInterface(match.intf.interfaceNumber, match.alt.alternateSetting))
			.then(() => match);
	};

	Adb.WebUSB.Transport.prototype.connectAdb = function(banner, auth_user_notify = null) {
		let VERSION = 0x01000000;
		let VERSION_NO_CHECKSUM = 0x01000001;
		let MAX_PAYLOAD = 256 * 1024;

		let key_idx = 0;
		let AUTH_TOKEN = 1;

		let version_used = Adb.Opt.use_checksum ? VERSION : VERSION_NO_CHECKSUM;
		let m = new Adb.Message("CNXN", version_used, MAX_PAYLOAD, "" + banner + "\0");
		return this.getDevice({ classCode: 255, subclassCode: 66, protocolCode: 1 })
			.then(match => new Adb.WebUSB.Device(this, match))
			.then(adb => m.send_receive(adb)
				.then((function do_auth_response(response) {
					if (response.cmd != "AUTH" || response.arg0 != AUTH_TOKEN)
						return response;

					return keys.then(keys =>
						do_auth(adb, keys, key_idx++, response.data.buffer, do_auth_response, auth_user_notify));
				}))
				.then(response => {
					if (response.cmd != "CNXN")
						throw new Error("Failed to connect with '" + banner + "'");
					console.log('version', response.arg0);
					if (response.arg0 != VERSION && response.arg0 != VERSION_NO_CHECKSUM)
						throw new Error("Version mismatch: " + response.arg0 + " (expected: " + VERSION + " or " + VERSION_NO_CHECKSUM + ")");
					if (Adb.Opt.debug)
						console.log("Connected with '" + banner + "', max_payload: " + response.arg1);
					adb.max_payload = response.arg1;
					if (response.arg0 == VERSION_NO_CHECKSUM)
						Adb.Opt.use_checksum = false;
					return adb;
				})
			);
	};

	Adb.WebUSB.Transport.prototype.connectFastboot = function() {
		return this.getDevice({ classCode: 255, subclassCode: 66, protocolCode: 3 })
			.then(match => new Fastboot.WebUSB.Device(this, match))
			.then(fastboot => fastboot.send("getvar:max-download-size")
				.then(() => fastboot.receive()
					.then(response => {
						let cmd = decode_cmd(response.getUint32(0, true));
						if (cmd == "FAIL")
							throw new Error("Unable to open Fastboot");

						fastboot.get_cmd = r => decode_cmd(r.getUint32(0, true));
						fastboot.get_payload = r => r.buffer.slice(4);
						return fastboot;
					})
				)
			);
	};

	Adb.WebUSB.Device = function(transport, match) {
		this.transport = transport;
		this.max_payload = 4096;

		this.ep_in = get_ep_num(match.alt.endpoints, "in");
		this.ep_out = get_ep_num(match.alt.endpoints, "out");
	}

	Adb.WebUSB.Device.prototype.open = function(service) {
		return Adb.Stream.open(this, service);
	};

	Adb.WebUSB.Device.prototype.shell = function(command) {
		return Adb.Stream.open(this, "shell:" + command);
	};

	Adb.WebUSB.Device.prototype.tcpip = function(port) {
		return Adb.Stream.open(this, "tcpip:" + port);
	};

	Adb.WebUSB.Device.prototype.sync = function() {
		return Adb.Stream.open(this, "sync:");
	};

	Adb.WebUSB.Device.prototype.reboot = function(command="") {
		return Adb.Stream.open(this, "reboot:" + command);
	};

	Adb.WebUSB.Device.prototype.send = function(data) {
		if (typeof data === "string") {
			let encoder = new TextEncoder();
			let string_data = data;
			data = encoder.encode(string_data).buffer;
		}

		if (data != null && data.length > this.max_payload)
			throw new Error("data is too big: " + data.length + " bytes (max: " + this.max_payload + " bytes)");

		return this.transport.send(this.ep_out, data);
	};

	Adb.WebUSB.Device.prototype.receive = function(len) {
		return this.transport.receive(this.ep_in, len);
	};

	let Fastboot = {};
	Fastboot.WebUSB = {};

	Fastboot.WebUSB.Device = function(transport, match) {
		this.transport = transport;
		this.max_datasize = 64;

		this.ep_in = get_ep_num(match.alt.endpoints, "in");
		this.ep_out = get_ep_num(match.alt.endpoints, "out");
	};
	
	Fastboot.WebUSB.Device.prototype.send = function(data) {
		if (typeof data === "string") {
			let encoder = new TextEncoder();
			let string_data = data;
			data = encoder.encode(string_data).buffer;
		}

		if (data != null && data.length > this.max_datasize)
			throw new Error("data is too big: " + data.length + " bytes (max: " + this.max_datasize + " bytes)");

		return this.transport.send(this.ep_out, data);
	};

	Fastboot.WebUSB.Device.prototype.receive = function() {
		return this.transport.receive(this.ep_in, 64);
	};

	Adb.Message = function(cmd, arg0, arg1, data = null) {
		if (cmd.length != 4)
			throw new Error("Invalid command: '" + cmd + "'");

		this.cmd = cmd;
		this.arg0 = arg0;
		this.arg1 = arg1;
		this.length = (data === null) ? 0 : (typeof data === "string") ? data.length : data.byteLength;
		this.data = data;
	};

	Adb.Message.checksum = function(data_view) {
		let sum = 0;

		for (let i = 0; i < data_view.byteLength; i++)
			sum += data_view.getUint8(i);

		return sum & 0xffffffff;
	};

	Adb.Message.send = function(device, message) {
		let header = new ArrayBuffer(24);
		let cmd = encode_cmd(message.cmd);
		let magic = cmd ^ 0xffffffff;
		let data = null;
		let len = 0;
		let checksum = 0;

		if (Adb.Opt.debug)
			console.log(message);

		if (message.data != null) {
			if (typeof message.data === "string") {
				let encoder = new TextEncoder();
				data = encoder.encode(message.data).buffer;
			} else if (ArrayBuffer.isView(message.data)) {
				data = message.data.buffer;
			} else {
				data = message.data;
			}

			len = data.byteLength;
			if (Adb.Opt.use_checksum)
				checksum = Adb.Message.checksum(new DataView(data));

			if (len > device.max_payload)
				throw new Error("data is too big: " + len + " bytes (max: " + device.max_payload + " bytes)");
		}

		let view = new DataView(header);
		view.setUint32(0, cmd, true);
		view.setUint32(4, message.arg0, true);
		view.setUint32(8, message.arg1, true);
		view.setUint32(12, len, true);
		view.setUint32(16, checksum, true);
		view.setUint32(20, magic, true);

		let seq = device.send(header);
		if (len > 0)
			seq.then(() => device.send(data));
		return seq;
	};

	Adb.Message.receive = function(device) {
		return device.receive(24) //Adb.Opt.use_checksum ? 24 : 20)
			.then(response => {
				let cmd = response.getUint32(0, true);
				let arg0 = response.getUint32(4, true);
				let arg1 = response.getUint32(8, true);
				let len = response.getUint32(12, true);
				let check = response.getUint32(16, true);
				// Android seems to have stopped providing checksums
				if (Adb.use_checksum && response.byteLength > 20) {
					let magic = response.getUint32(20, true);

					if ((cmd ^ magic) != -1)
						throw new Error("magic mismatch");
				}

				cmd = decode_cmd(cmd);

				if (len == 0) {
					let message = new Adb.Message(cmd, arg0, arg1);
					if (Adb.Opt.debug)
						console.log(message);
					return message;
				}

				return device.receive(len)
					.then(data => {
						if (Adb.Opt.use_checksum && Adb.Message.checksum(data) != check)
							throw new Error("checksum mismatch");

						let message = new Adb.Message(cmd, arg0, arg1, data);
						if (Adb.Opt.debug)
							console.log(message);
						return message;
					});
			});
	};

	Adb.Message.prototype.send = function(device) {
		return Adb.Message.send(device, this);
	};

	Adb.Message.prototype.send_receive = function(device) {
		return this.send(device)
			.then(() => Adb.Message.receive(device));
	};

	Adb.SyncFrame = function(cmd, length = 0, data = null) {
		if (cmd.length != 4)
			throw new Error("Invalid command: '" + cmd + "'");

		this.cmd = cmd;
		this.length = length;
		this.data = data;
	};

	Adb.SyncFrame.send = function(stream, frame) {
		let data = new ArrayBuffer(8);
		let cmd = encode_cmd(frame.cmd);

		if (Adb.Opt.debug)
			console.log(frame);

		let view = new DataView(data);
		view.setUint32(0, cmd, true);
		view.setUint32(4, frame.length, true);

		return stream.send("WRTE", data);
	};

	Adb.SyncFrame.receive = function(stream) {
		return stream.receive()
			.then(response => {
				if (response.cmd == "WRTE") {
					let cmd = decode_cmd(response.data.getUint32(0, true));

					if (cmd == "OKAY" || cmd == "DATA" || cmd == "DONE" || cmd == "FAIL") {
						let len = response.data.getUint32(4, true);
						let data = new DataView(response.data.buffer.slice(8));

						if (len == 0 || data.byteLength >= len) {
							let frame = new Adb.SyncFrame(cmd, len, data);
							if (Adb.Opt.debug)
								console.log(frame);
							return frame;
						}

						return stream.send("OKAY")
							.then(() => stream.receive())
							.then(response => {
								if (response.data == null) {
									let frame = new Adb.SyncFrame(cmd);
									if (Adb.Opt.debug)
										console.log(frame);
									return frame;
								}

								let cmd2 = decode_cmd(response.data.getUint32(0, true));

								if (cmd2 == "OKAY" || cmd2 == "DATA" || cmd2 == "DONE" || cmd2 == "FAIL") {
									let len = response.data.getUint32(4, true);
									let data = new DataView(response.data.buffer.slice(8));

									if (len == 0 || data.byteLength >= len) {
										let frame = new Adb.SyncFrame(cmd2, len, data);
										if (Adb.Opt.debug)
											console.log(frame);
										return frame;
									}
								}

								if (response.data.byteLength < len)
									throw new Error("expected at least " + len + ", got " + response.data.byteLength);

								let frame = new Adb.SyncFrame(cmd, len, response.data);
								if (Adb.Opt.debug)
									console.log(frame);
								return frame;
							});
					}

					if (Adb.Opt.debug)
						console.log(response);
					if (Adb.Opt.dump)
						hexdump(response.data, "WRTE: ");

					throw new Error("invalid WRTE frame");
				}

				if (response.cmd == "OKAY") {
					let frame = new Adb.SyncFrame("OKAY");
					if (Adb.Opt.debug)
						console.log(frame);
					return frame;
				}

				if (Adb.Opt.debug)
					console.log(response);

				throw new Error("invalid SYNC frame");
			});
	};

	Adb.SyncFrame.prototype.send = function(stream) {
		return Adb.SyncFrame.send(stream, this);
	};

	Adb.SyncFrame.prototype.send_receive = function(stream) {
		return Adb.SyncFrame.send(stream, this)
			.then(() => Adb.SyncFrame.receive(stream));
	};

	Adb.Stream = function(device, service, local_id, remote_id) {
		this.device = device;
		this.service = service;
		this.local_id = local_id;
		this.remote_id = remote_id;
		this.cancel = null;
	};

	let next_id = 1;

	Adb.Stream.open = function(device, service) {
		let local_id = next_id++;
		let remote_id = 0;

		let m = new Adb.Message("OPEN", local_id, remote_id, "" + service + "\0");
		return m.send_receive(device)
			.then(function do_response(response) {
				if (response.arg1 != local_id)
					return Adb.Message.receive(device).then(do_response);

				if (response.cmd != "OKAY")
					throw new Error("Open failed");

				remote_id = response.arg0;

				if (Adb.Opt.debug) {
					console.log("Opened stream '" + service + "'");
					console.log(" local_id: 0x" + toHex32(local_id));
					console.log(" remote_id: 0x" + toHex32(remote_id));
				}

				return new Adb.Stream(device, service, local_id, remote_id);
			});
	};

	Adb.Stream.prototype.close = function() {
		if (this.local_id != 0) {
			this.local_id = 0;
			return this.send("CLSE");
		}

		if (Adb.Opt.debug) {
			console.log("Closed stream '" + this.service + "'");
			console.log(" local_id: 0x" + toHex32(this.local_id));
			console.log(" remote_id: 0x" + toHex32(this.remote_id));
		}

		this.service = "";
		this.remote_id = 0;
	};

	Adb.Stream.prototype.send = function(cmd, data=null) {
		let m = new Adb.Message(cmd, this.local_id, this.remote_id, data);
		return m.send(this.device);
	};

	Adb.Stream.prototype.receive = function() {
		return Adb.Message.receive(this.device)
			.then(response => {
				// remote's prospective of local_id/remote_id is reversed
				if (response.arg0 != 0 && response.arg0 != this.remote_id)
					throw new Error("Incorrect arg0: 0x" + toHex32(response.arg0) + " (expected 0x" + toHex32(this.remote_id) + ")");
				if (this.local_id != 0 && response.arg1 != this.local_id)
					throw new Error("Incorrect arg1: 0x" + toHex32(response.arg1) + " (expected 0x" + toHex32(this.local_id) + ")");
				return response;
			});
	};

	Adb.Stream.prototype.send_receive = function(cmd, data=null) {
		return this.send(cmd, data)
			.then(() => this.receive());
	};

	Adb.Stream.prototype.abort = function() {
		if (Adb.Opt.debug)
			console.log("aborting...");

		let self = this;
		return new Promise(function(resolve, reject) {
			self.cancel = function() {
				if (Adb.Opt.debug)
					console.log("aborted");
				self.cancel = null;
				resolve();
			};
		});
	};

	Adb.Stream.prototype.stat = function(filename) {
		let frame = new Adb.SyncFrame("STAT", filename.length);
		return frame.send_receive(this)
			.then(check_ok("STAT failed on " + filename))
			.then(response => {
				let encoder = new TextEncoder();
				return this.send_receive("WRTE", encoder.encode(filename))
			})
			.then(check_ok("STAT failed on " + filename))
			.then(response => {
				return this.receive().then(response =>
					this.send("OKAY").then(() =>
					response.data));
			})
			.then(response => {
				let id = decode_cmd(response.getUint32(0, true));
				let mode = response.getUint32(4, true);
				let size = response.getUint32(8, true);
				let time = response.getUint32(12, true);

				if (Adb.Opt.debug) {
					console.log("STAT: " + filename);
					console.log("id: " + id);
					console.log("mode: " + mode);
					console.log("size: " + size);
					console.log("time: " + time);
				}

				if (id != "STAT")
					throw new Error("STAT failed on " + filename);

				return { mode: mode, size: size, time: time };
			});
	};

	Adb.Stream.prototype.pull = function(filename) {
		let frame = new Adb.SyncFrame("RECV", filename.length);
		return frame.send_receive(this)
			.then(check_ok("PULL RECV failed on " + filename))
			.then(response => {
				let encoder = new TextEncoder();
				return this.send_receive("WRTE", encoder.encode(filename))
			})
			.then(check_ok("PULL WRTE failed on " + filename))
			.then(() => Adb.SyncFrame.receive(this))
			.then(check_cmd("DATA", "PULL DATA failed on " + filename))
			.catch(err => {
				return this.send("OKAY")
					.then(() => { throw err; });
			})
			.then(response => {
				return this.send("OKAY")
					.then(() => response);
			})
			.then(response => {
				let len = response.length;
				if (response.data.byteLength == len + 8) {
					let cmd = response.data.getUint32(len, true);
					let zero = response.data.getUint32(len + 4, true);
					if (decode_cmd(cmd) != "DONE" || zero != 0)
						throw new Error("PULL DONE failed on " + filename);

					return new DataView(response.data.buffer, 0, len);
				}

				if (response.data.byteLength > 64 * 1024) {
					let cmd = response.data.getUint32(response.data.byteLength - 8, true);
					let zero = response.data.getUint32(response.data.byteLength - 4, true);
					if (decode_cmd(cmd) != "DONE" || zero != 0)
						throw new Error("PULL DONE failed on " + filename);

					return new DataView(response.data.buffer, 0, response.data.byteLength - 8);
				}

				if (response.data.byteLength != len)
				  throw new Error("PULL DATA failed on " + filename + ": " + response.data.byteLength + "!=" + len);

				return this.receive()
					.then(response => {
						let cmd = response.data.getUint32(0, true);
						let zero = response.data.getUint32(4, true);
						if (decode_cmd(cmd) != "DONE" || zero != 0)
							throw new Error("PULL DONE failed on " + filename);
					})
					.then(() => this.send("OKAY"))
					.then(() => response.data);
			});
	};

	Adb.Stream.prototype.push_start = function(filename, mode) {
		let mode_str = mode.toString(10);
		let encoder = new TextEncoder();

		let frame = new Adb.SyncFrame("SEND", filename.length + 1 + mode_str.length);
		return frame.send_receive(this)
			.then(check_ok("PUSH failed on " + filename))
			.then(response => {
				return this.send("WRTE", encoder.encode(filename))
			})
			.then(() => Adb.SyncFrame.receive(this))
			.then(check_ok("PUSH failed on " + filename))
			.then(response => {
				return this.send("WRTE", encoder.encode("," + mode_str))
			})
			.then(() => Adb.SyncFrame.receive(this))
			.then(check_ok("PUSH failed on " + filename));
	};

	Adb.Stream.prototype.push_data = function(data) {
		if (typeof data === "string") {
			let encoder = new TextEncoder();
			let string_data = data;
			data = encoder.encode(string_data).buffer;
		} else if (ArrayBuffer.isView(data)) {
			data = data.buffer;
		}

		let frame = new Adb.SyncFrame("DATA", data.byteLength);
		return frame.send_receive(this)
			.then(check_ok("PUSH failed"))
			.then(response => {
				return this.send("WRTE", data);
			})
			.then(() => Adb.SyncFrame.receive(this))
			.then(check_ok("PUSH failed"));
	};

	Adb.Stream.prototype.push_done = function() {
		let frame = new Adb.SyncFrame("DONE", Math.round(Date.now() / 1000));
		return frame.send_receive(this)
			.then(check_ok("PUSH failed"))
			.then(response => {
				return Adb.SyncFrame.receive(this);
			})
			.then(check_ok("PUSH failed"))
			.then(response => {
				return this.send("OKAY");
			});
	};

	Adb.Stream.prototype.push = function(file, filename, mode, on_progress = null) {
		// we need reduced logging during the data transfer otherwise the console may explode
		let old_debug = Adb.Opt.debug;
		let old_dump = Adb.Opt.dump;
		Adb.Opt.debug = false;
		Adb.Opt.dump = false;

		// read the whole file
		return read_blob(file).then(data =>
			this.push_start(filename, mode).then(() => {
				let seq = Promise.resolve();
				let rem = file.size;
				let max = Math.min(0x10000, this.device.max_payload);
				while (rem > 0) {
					// these two are needed here for the closure
					let len = Math.min(rem, max);
					let count = file.size - rem;
					seq = seq.then(() => {
						if (this.cancel) {
							Adb.Opt.debug = old_debug;
							Adb.Opt.dump = old_dump;
							this.cancel();
							throw new Error("cancelled");
						}
						if (on_progress != null)
							on_progress(count, file.size);
						return this.push_data(data.slice(count, count + len));
					});
					rem -= len;
				}
				return seq.then(() => {
					Adb.Opt.debug = old_debug;
					Adb.Opt.dump = old_dump;
					return this.push_done();
				});
			}));
	};

	Adb.Stream.prototype.quit = function() {
		let frame = new Adb.SyncFrame("QUIT");
		return frame.send_receive(this)
			.then(check_ok("QUIT failed"))
			.then(response => {
				return this.receive();
			})
			.then(check_cmd("CLSE", "QUIT failed"))
			.then(response => {
				return this.close();
			});
	};

	function check_cmd(cmd, err_msg)
	{
		return function(response) {
			if (response.cmd == "FAIL") {
				let decoder = new TextDecoder();
				throw new Error(decoder.decode(response.data));
			}
			if (response.cmd != cmd)
				throw new Error(err_msg);
			return response;
		};
	}

	function check_ok(err_msg)
	{
		return check_cmd("OKAY", err_msg);
	}

	function paddit(text, width, padding)
	{
		let padlen = width - text.length;
		let padded = "";

		for (let i = 0; i < padlen; i++)
			padded += padding;

		return padded + text;
	}

	function toHex8(num)
	{
		return paddit(num.toString(16), 2, "0");
	}

	function toHex16(num)
	{
		return paddit(num.toString(16), 4, "0");
	}

	function toHex32(num)
	{
		return paddit(num.toString(16), 8, "0");
	}

	function toB64(buffer)
	{
		return btoa(new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ""));
	}

	function hexdump(view, prefix="")
	{
		let decoder = new TextDecoder();

		for (let i = 0; i < view.byteLength; i += 16) {
			let max = (view.byteLength - i) > 16 ? 16 : (view.byteLength - i);
			let row = prefix + toHex16(i) + " ";
			let j;

			for (j = 0; j < max; j++)
				row += " " + toHex8(view.getUint8(i + j));
			for (; j < 16; j++)
				row += "   ";

			row += " | " + decoder.decode(new DataView(view.buffer, i, max));
			console.log(row);
		}
	}

	function get_ep_num(endpoints, dir, type = "bulk")
	{
		let e, ep;
		for (e in endpoints)
			if (ep = endpoints[e], ep.direction == dir && ep.type == type)
				return ep.endpointNumber;
		if (Adb.Opt.debug)
			console.log(endpoints);
		throw new Error("Cannot find " + dir + " endpoint");
	}

	function encode_cmd(cmd)
	{
		let encoder = new TextEncoder();
		let buffer = encoder.encode(cmd).buffer;
		let view = new DataView(buffer);
		return view.getUint32(0, true);
	}

	function decode_cmd(cmd)
	{
		let decoder = new TextDecoder();
		let buffer = new ArrayBuffer(4);
		let view = new DataView(buffer);
		view.setUint32(0, cmd, true);
		return decoder.decode(buffer);
	}

	function generate_key()
	{
		let extractable = Adb.Opt.dump;

		return crypto.subtle.generateKey({
					name: "RSASSA-PKCS1-v1_5",
					modulusLength: Adb.Opt.key_size,
					publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
					hash: { name: "SHA-1" }
				}, extractable, [ "sign", "verify" ])
			.then(key => {
				if (!Adb.Opt.dump)
					return key;

				return privkey_dump(key)
					.then(() => pubkey_dump(key))
					.then(() => key);
			});
	}

	function do_auth(adb, keys, key_idx, token, do_auth_response, auth_user_notify)
	{
		let AUTH_SIGNATURE = 2;
		let AUTH_RSAPUBLICKEY = 3;

		if (key_idx < keys.length) {
			let slot = keys.length - key_idx - 1;
			let key = keys[slot];
			let seq = Promise.resolve();

			if (Adb.Opt.debug)
				console.log("signing with key " + slot + "...");
			if (Adb.Opt.dump) {
				seq = seq.then(() => privkey_dump(key))
					.then(() => pubkey_dump(key))
					.then(() => hexdump(new DataView(token)))
					.then(() => console.log("-----BEGIN TOKEN-----\n" + toB64(token) + "\n-----END TOKEN-----"));
			}

			return seq.then(() => crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key.privateKey, token))
				.then(signed => {
					if (Adb.Opt.dump)
						console.log("-----BEGIN SIGNATURE-----\n" + toB64(signed) + "\n-----END SIGNATURE-----");

					let m = new Adb.Message("AUTH", AUTH_SIGNATURE, 0, signed);
					return m.send_receive(adb).then(do_auth_response);
				});
		}

		let seq = null;
		let dirty = false;

		if (Adb.Opt.reuse_key !== false) {
			key_idx = Adb.Opt.reuse_key === true ? -1 : Adb.Opt.reuse_key;

			if (key_idx < 0)
				key_idx += keys.length;

			if (key_idx >= 0 && key_idx < keys.length) {
				if (Adb.Opt.debug)
					console.log("reusing key " + key_idx + "...");
				seq = Promise.resolve(keys[key_idx]);
			}
		}

		if (seq === null) {
			if (Adb.Opt.debug)
				console.log("generating key " + key_idx + " (" + Adb.Opt.key_size + " bits)...");

			seq = generate_key();
			dirty = true;
		}

		return seq.then(key => {
			return crypto.subtle.exportKey("spki", key.publicKey)
				.then(pubkey => {
					let m = new Adb.Message("AUTH", AUTH_RSAPUBLICKEY, 0, toB64(pubkey) + "\0");
					return m.send(adb);
				})
				.then(() => {
					if (Adb.Opt.debug)
						console.log("waiting for user confirmation...");
					if (auth_user_notify != null)
						auth_user_notify(key.publicKey);
					return Adb.Message.receive(adb);
				})
				.then(response => {
					// return response;
					if (response.cmd != "CNXN")
						return response;
					if (!dirty)
						return response;

					keys.push(key);
					return db.then(db => store_key(db, key))
						.then(() => response);
				});
		});
	}

	function privkey_dump(key)
	{
		if (!key.privateKey.extractable) {
			console.log("cannot dump the private key, it's not extractable");
			return;
		}

		return crypto.subtle.exportKey("pkcs8", key.privateKey)
			.then(privkey => console.log("-----BEGIN PRIVATE KEY-----\n" + toB64(privkey) + "\n-----END PRIVATE KEY-----"));
	}

	function pubkey_dump(key)
	{
		if (!key.publicKey.extractable) {
			console.log("cannot dump the public key, it's not extractable");
			return;
		}

		return crypto.subtle.exportKey("spki", key.publicKey)
			.then(pubkey => console.log("-----BEGIN PUBLIC KEY-----\n" + toB64(pubkey) + "\n-----END PUBLIC KEY-----"));
	}

	function read_blob(blob)
	{
		return new Promise(function(resolve, reject) {
			let reader = new FileReader();
			reader.onload = e => resolve(e.target.result);
			reader.onerror = e => reject(e.target.error);
			reader.readAsArrayBuffer(blob);
		});
	}

	function promisify(request, onsuccess = "onsuccess", onerror = "onerror")
	{
		return new Promise(function (resolve, reject) {
			request[onsuccess] = event => resolve(event.target.result);
			request[onerror] = event => reject(event.target.errorCode);
		});
	}

	function init_db()
	{
		let req = window.indexedDB.open("WebADB", 1);

		req.onupgradeneeded = function (event) {
			let db = event.target.result;

			if (Adb.Opt.debug)
				console.log("DB: migrating from version " + event.oldVersion + " to " + event.newVersion + "...");

			if (db.objectStoreNames.contains('keys')) {
				if (Adb.Opt.debug)
					console.log("DB: deleting old keys...");

				db.deleteObjectStore('keys');
			}

			db.createObjectStore("keys", { autoIncrement: true });
		};

		return promisify(req);
	}

	function load_keys(db)
	{
		let transaction = db.transaction("keys");
		let store = transaction.objectStore("keys");
		let cursor = store.openCursor();
		let keys = [];

		cursor.onsuccess = function (event) {
			let result = event.target.result;
			if (result != null) {
				keys.push(result.value);
				result.continue();
			}
		};

		return promisify(transaction, "oncomplete").then(function (result) {
			if (Adb.Opt.debug)
				console.log("DB: loaded " + keys.length + " keys");
			return keys;
		});
	}

	function store_key(db, key)
	{
		let transaction = db.transaction("keys", "readwrite");
		let store = transaction.objectStore('keys');
		let request = store.put(key);

		return promisify(request).then(function (result) {
			if (Adb.Opt.debug)
				console.log("DB: stored key " + (result - 1));
			return result;
		});
	}

	function clear_keys(db)
	{
		let transaction = db.transaction("keys", "readwrite");
		let store = transaction.objectStore("keys");
		let request = store.clear();

		return promisify(request).then(function (result) {
			if (Adb.Opt.debug)
				console.log("DB: removed all the keys");
			return result;
		});
	}
})();

window.Adb = Adb;