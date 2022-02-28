module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		var self = i
		var actions = {}

		// ########################
		// #### Power Actions ####
		// ########################

		actions.powerOn = {
			label: 'Power On',
			callback: function (action, bank) {
				self.setPower(true);
			}
		}

		actions.powerOff = {
			label: 'Power Off',
			callback: function (action, bank) {
				self.setPower(false);
			}
		}

		actions.powerToggle = {
			label: 'Power Toggle',
			callback: function (action, bank) {
				let powerValue = false;

				powerValue = self.BULBINFO.on;

				if (powerValue === false) {
					powerValue = true;
				}
				else {
					powerValue = false;
				}

				self.BULBINFO.on = powerValue;

				self.setPower(powerValue);
			}
		}

		// ############################
		// #### Brightness Actions ####
		// ############################

		actions.brightness = {
			label: 'Set Brightness',
			options: [
				{
					type: 'number',
					label: 'Brightness',
					id: 'brightness',
					tooltip: 'Sets the brightness (0 - 100)',
					min: 0,
					max: 100,
					default: self.CURRENT_BRIGHTNESS,
					step: 1,
					required: true,
					range: true
				}
			],
			callback: function (action, bank) {
				self.setBrightness(action.options.brightness);
			}
		}

		actions.brightnessUp = {
			label: 'Brightness Up Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Increase Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.brightness_fader('up', 'start', rate);
			}
		}

		actions.brightnessUpStop = {
			label: 'Brightness Up Stop',
			callback: function (action, bank) {
				self.brightness_fader('up', 'stop', null);
			}
		}

		actions.brightnessDown = {
			label: 'Brightness Down Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Decrease Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.brightness_fader('down', 'start', rate);
			}
		}

		actions.brightnessDownStop = {
			label: 'Brightness Down Stop',
			callback: function (action, bank) {
				self.brightness_fader('down', 'stop', null);
			}
		}

		// ########################
		// #### Color Actions ####
		// ########################

		actions.warmWhite = {
			label: 'Set to Warm White',
			callback: function (action, bank) {
				self.setWhites(255, 0);
			}
		}

		actions.coolWhite = {
			label: 'Set to Cool White',
			callback: function (action, bank) {
				self.setWhites(0, 255);
			}
		}

		actions.colorPicker = {
			label: 'Set To Color by Picker',
			options: [
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					default: self.CURRENT_COLOR_DECIMAL
				}
			],
			callback: function (action, bank) {
				let rgb = self.rgbRev(action.options.color);
				self.setColor(rgb);
			}
		}

		actions.colorRgb = {
			label: 'Set To Color by Red, Green, Blue',
			options: [
				{
					type: 'textinput',
					label: 'Red (0 - 255)',
					id: 'red',
					default: self.CURRENT_COLOR_RGB.r,
					required: true
				},
				{
					type: 'textinput',
					label: 'Green (0 - 255)',
					id: 'green',
					default: self.CURRENT_COLOR_RGB.g,
					required: true
				},
				{
					type: 'textinput',
					label: 'Blue (0 - 255)',
					id: 'blue',
					default: self.CURRENT_COLOR_RGB.b,
					required: true
				}
			],
			callback: function (action, bank) {
				let red = action.options.red;
				self.parseVariables(red, function (value) {
					red = value;
				});
				red = parseInt(red);
				if (red < 0) {
					red = 0;
				}
				else if (red > 255) {
					red = 255;
				}

				let green = action.options.green;
				self.parseVariables(green, function (value) {
					green = value;
				});
				green = parseInt(green);
				if (green < 0) {
					green = 0;
				}
				else if (green > 255) {
					green = 255;
				}

				let blue = action.options.blue;
				self.parseVariables(blue, function (value) {
					blue = value;
				});
				blue = parseInt(blue);
				if (blue < 0) {
					blue = 0;
				}
				else if (blue > 255) {
					blue = 255;
				}
				self.setColor({ r: red, g: green, b: blue });
			}
		}

		actions.pattern = {
			label: 'Set Pattern',
			options: [
				{
					type: 'dropdown',
					label: 'Pattern',
					id: 'pattern',
					default: self.CHOICES_PATTERNS[0].id,
					choices: self.CHOICES_PATTERNS
				},
				{
					type: 'textinput',
					label: 'Speed (0 - 100)',
					id: 'speed',
					default: '85',
					required: true
				},
			],
			callback: function (action, bank) {
				let opt = action.options;

				let pattern = opt.pattern;

				let speed = parseInt(opt.speed);
				if (speed > 100) {
					speed = 100;
				}

				self.setPattern(pattern, speed);
			}
		}

		return actions
	}
}