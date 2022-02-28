module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		var self = i
		var variables = []

		variables.push({ name: 'bulb_type', label: 'Bulb Type' });

		variables.push({ name: 'power_state', label: 'Power State' });

		variables.push({ name: 'color_rgb', label: 'Current Color RGB' });
		variables.push({ name: 'color_hex', label: 'Current Color Hex' });
		variables.push({ name: 'color_decimal', label: 'Current Color Decimal' });

		variables.push({ name: 'warm_white', label: 'Warm White Level' });
		variables.push({ name: 'cold_white', label: 'Cold White Level' });

		variables.push({ name: 'pattern', label: 'Current Pattern' });
		variables.push({ name: 'pattern_speed', label: 'Current Pattern Speed' });

		variables.push({ name: 'brightness', label: 'Brightness'});

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		try {
			var self = i;

			self.setVariable('bulb_type', self.BULBINFO.type);

			self.setVariable('power_state', (self.BULBINFO.on ? 'On' : 'Off'));
			
			self.setVariable('color_rgb', self.CURRENT_COLOR_RGB.r + ',' + self.CURRENT_COLOR_RGB.g + ',' + self.CURRENT_COLOR_RGB.b);
			self.setVariable('color_hex', self.CURRENT_COLOR_HEX);
			self.setVariable('color_decimal', self.CURRENT_COLOR_DECIMAL);

			self.setVariable('warm_white', self.BULBINFO.warm_white);
			self.setVariable('cold_white', self.BULBINFO.cold_white);

			let pattern = self.CHOICES_PATTERNS.find((PATTERN) => PATTERN.id == self.BULBINFO.pattern);
			if (pattern) {
				self.setVariable('pattern', pattern.label);
				self.setVariable('pattern_speed', Math.round(self.BULBINFO.speed));
			}
			else {
				self.setVariable('pattern', '');
				self.setVariable('pattern_speed', '');
			}

			self.setVariable('brightness', self.CURRENT_BRIGHTNESS);
		}
		catch(error) {
			if (String(error).indexOf('Cannot use \'in\' operator to search') === -1) {
				self.log('error', 'Error from Bulb: ' + String(error));
			}
		}
	}
}
