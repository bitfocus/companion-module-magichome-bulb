var instance_skel = require('../../../instance_skel')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var debug;

const colorsys = require('colorsys');
const { Control } = require('magic-home');

instance.prototype.BULB = null; //represents Device

instance.prototype.INTERVAL = null; //used for polling device
instance.prototype.BULBINFO = {};

instance.prototype.BRIGHTNESS_INTERVAL = null; //used for brightness up/down actions

instance.prototype.CURRENT_COLOR_RGB = {r: 255, g: 213, b: 2};
instance.prototype.CURRENT_COLOR_HEX = '#ffd503';
instance.prototype.CURRENT_COLOR_DECIMAL = 16766211;

instance.prototype.CHOICES_PATTERNS = [
	{ id: 'seven_color_cross_fade', label: 'Seven Color Cross Fade' },
	{ id: 'red_gradual_change', label: 'Red Gradual Change' },
	{ id: 'green_gradual_change', label: 'Green Gradual Change' },
	{ id: 'blue_gradual_change', label: 'Blue Gradual Change' },
	{ id: 'yellow_gradual_change', label: 'Yellow Gradual Change' },
	{ id: 'cyan_gradual_change', label: 'Cyan Gradual Change' },
	{ id: 'purple_gradual_change', label: 'Purple Gradual Change' },
	{ id: 'white_gradual_change', label: 'White Gradual Change' },
	{ id: 'red_green_cross_fade', label: 'Red Green Cross Fade' },
	{ id: 'red_blue_cross_fade', label: 'Red Blue Cross Fade' },
	{ id: 'green_blue_cross_fade', label: 'Green Blue Cross Fade' },
	{ id: 'seven_color_strobe_flash', label: 'Seven Color Strobe Flash' },
	{ id: 'red_strobe_flash', label: 'Red Strobe Flash' },
	{ id: 'green_strobe_flash', label: 'Green Strobe Flash' },
	{ id: 'blue_stobe_flash', label: 'Blue Strobe Flash' },
	{ id: 'yellow_strobe_flash', label: 'Yellow Strobe Flash' },
	{ id: 'cyan_strobe_flash', label: 'Cyan Strobe Flash' },
	{ id: 'purple_strobe_flash', label: 'Purple Strobe Flash' },
	{ id: 'white_strobe_flash', label: 'White Strobe Flash' },
	{ id: 'seven_color_jumping', label: 'Seven Color Jumping' }
];

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	var self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this

	self.stopInterval();
	self.brightness_fader_stop();

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	var self = this

	debug = self.debug
	log = self.log

	self.BULBINFO = {
		type: 0x33,
		on: true,
		mode: 'color',
		color: {
			red: 255,
			green: 213,
			blue: 2
		},
		warm_white: 0,
		cold_white: 0
	};

	self.status(self.STATUS_WARNING, 'connecting');

	self.getInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
}

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	var self = this
	self.config = config
	self.status(self.STATUS_WARNING, 'connecting');
	
	self.getInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

instance.prototype.getInformation = function () {
	//Get all information from Device
	var self = this;

	try {
		if (self.config.host) {
			if (!self.BULB) {
				self.BULB = new Control(self.config.host, { cold_white_support: true });
			}
	
			self.BULB.queryState().then(info => {
				if (info) {
					self.status(self.STATUS_OK);
					self.BULBINFO = info;
					
					try {
						self.updateData();
						self.checkFeedbacks();
						self.checkVariables();
					}
					catch(error) {
						self.log('error', 'Error from Bulb: ' + String(error));
						self.log('error', 'Stopping Update interval due to error.');
						self.stopInterval();
					}
				}
			});
		}
	}
	catch(error) {
		self.log('error', `Error getting bulb information: ${error}`);
	}
};


instance.prototype.updateData = function () {
	let self = this;

	if (!self.BULBINFO.cold_white) {
		self.BULBINFO.cold_white = 0;
	}

	if (self.BULBINFO.warm_white === 0 && self.BULBINFO.cold_white === 0) {
		self.CURRENT_COLOR_RGB = { r: self.BULBINFO.color.red, g: self.BULBINFO.color.green, b: self.BULBINFO.color.blue };

		// calculate brightness - get the highest and lowest out of red green and blue, then get the average and divide by 255
		let rgbIntArray = [self.BULBINFO.color.red, self.BULBINFO.color.green, self.BULBINFO.color.blue];
		let highest = Math.max(...rgbIntArray);
		let lowest = Math.min(...rgbIntArray);
	
		self.CURRENT_BRIGHTNESS = Math.round((highest + lowest) / 255 * 100);
	}
	else {
		self.CURRENT_COLOR_RGB = { r: 255, g: 255, b: 255 };
		let value = 255;

		if (self.BULBINFO.warm_white > 0) {
			value = self.BULBINFO.warm_white;
		}
		else {
			value = self.BULBINFO.cold_white;
		}
		
		self.CURRENT_BRIGHTNESS = Math.round((value / 255) * 100);
	}

	if (self.CURRENT_BRIGHTNESS > 100) {
		self.CURRENT_BRIGHTNESS = 100;
	}

	self.CURRENT_COLOR_HEX = colorsys.rgbToHex(self.CURRENT_COLOR_RGB.r, self.CURRENT_COLOR_RGB.g, self.CURRENT_COLOR_RGB.b);
	self.CURRENT_COLOR_DECIMAL = parseInt(self.CURRENT_COLOR_HEX.replace('#',''), 16);
};

instance.prototype.setupInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	self.config.interval = parseInt(self.config.interval);

	if (self.config.interval > 0) {
		self.log('info', 'Starting Update Interval.');
		self.INTERVAL = setInterval(self.getInformation.bind(self), self.config.interval);
	}
};

instance.prototype.stopInterval = function () {
	let self = this;

	self.log('info', 'Stopping Update Interval.');

	if (self.INTERVAL) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}
};

instance.prototype.brightness_change = function(direction) {
	let self = this;

	let newLevel = self.CURRENT_BRIGHTNESS;

	if (direction === 'up') {
		newLevel = newLevel + 5;
	}
	else {
		newLevel = newLevel - 5;
	}

	if ((newLevel > 100) || (newLevel < 0)) {
		self.brightness_fader(direction, 'stop', null);
	}
	else {
		self.setBrightness(newLevel);
		self.CURRENT_BRIGHTNESS = newLevel;
		self.setVariable('brightness', newLevel);
	}
};

instance.prototype.brightness_fader = function(direction, mode, rate) {
	let self = this;

	self.brightness_fader_stop();

	if (mode === 'start') {
		self.stopInterval(); //stop the regular update interval as it will mess with the brightness otherwise
		self.BRIGHTNESS_INTERVAL = setInterval(self.brightness_change.bind(self), parseInt(rate), direction);
	}
	else {
		self.setupInterval(); //restart regular update interval if needed
	}
};

instance.prototype.brightness_fader_stop = function() {
	let self = this;

	if (self.BRIGHTNESS_INTERVAL !== null) {
		clearInterval(self.BRIGHTNESS_INTERVAL);
		self.BRIGHTNESS_INTERVAL = null;
	}
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module controls Magic Home Bulbs.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Bulb IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'text',
			id: 'intervalInfo',
			width: 12,
			label: 'Update Interval',
			value: 'Please enter the amount of time in milliseconds to request new information from the bulb. Set to 0 to disable.'
		},
		{
			type: 'textinput',
			id: 'interval',
			label: 'Update Interval',
			width: 3,
			default: 0
		}
	]
}

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.setPower = function(powerState) {
	let self = this;

	try {
		self.BULB.setPower(powerState)
		.then(success => {
			// do something with the result
		})
		.catch(error => {
			//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
		});
	}
	catch(error) {
		self.log('error', `Error setting power: ${error}`);
	}
};

instance.prototype.setBrightness = function(brightness) {
	let self = this;

	try {
		if (self.BULBINFO.warm_white === 0 && self.BULBINFO.cold_white === 0) {
			//set color brightness
			let red = self.CURRENT_COLOR_RGB.r;
			let green = self.CURRENT_COLOR_RGB.g;
			let blue = self.CURRENT_COLOR_RGB.b;
	
			self.BULB.setColorWithBrightness(red, green, blue, brightness)
			.then(success => {
				// do something with the result
			})
			.catch(error => {
				//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
			});
		}
		else {
			let ww = 0;
			let cw = 0;
			if (self.BULBINFO.warm_white > 0) {
				//set warm white brightness
				ww = Math.round((brightness / 100) * 255);
				cw = 0;
			}
			else {
				//set cold white brightness
				ww = 0;
				cw = Math.round((brightness / 100) * 255);
			}

			self.BULB.setWhites(ww, cw)
			.then(success => {
				// do something with the result
			})
			.catch(error => {
				//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
			});
		}
	}
	catch(error) {
		self.log('error', `Error setting brightness: ${error}`);
	}
};

instance.prototype.setWhites = function(ww, cw) {
	let self = this;

	try {
		let mode = 'Warm White';

		if ((ww === 0) && (cw !== 0)) {
			mode = 'Cool White';
		}

		self.log('info', `Setting Bulb to ${mode}.`);
		self.BULB.setWhites(ww, cw)
		.then(success => {
			// do something with the result
		})
		.catch(error => {
			//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
		});
	}
	catch(error) {
		self.log('error', `Error setting white levels: ${error}`);
	}
};

instance.prototype.setColor = function(rgb) {
	let self = this;

	try {
		self.log('info', `Setting bulb color: R${rgb.r} G${rgb.g} B${rgb.b}`);
		self.BULB.setColor(rgb.r, rgb.g, rgb.b)
		.then(success => {
			// do something with the result
		})
		.catch(error => {
			//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
		});
	}
	catch(error) {
		self.log('error', `Error setting color: ${error}`);
	}
};

instance.prototype.setPattern = function(pattern, speed) {
	let self = this;

	try {
		let patternName = self.CHOICES_PATTERNS.find((PATTERN) => PATTERN.id == pattern).label;
		self.log('info', `Running pattern: ${patternName}`);
		self.BULB.setPattern(pattern, speed)
		.then(success => {
			// do something with the result
		})
		.catch(error => {
			//sometimes it times out but still does the thing, so just catching it is enough to not destroy the logging
		});
	}
	catch(error) {
		self.log('error', `Error setting pattern: ${error}`);
	}
};

instance.prototype.actions = function (system) {
	this.setActions(actions.setActions(this));
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;