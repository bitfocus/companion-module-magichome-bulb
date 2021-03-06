module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function (i) {
		var self = i
		var feedbacks = {}

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red

		feedbacks.powerState = {
			type: 'boolean',
			label: 'Power State',
			description: 'Indicate if Bulb is On or Off',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X State',
					id: 'option',
					default: 1,
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
				},
			],
			callback: function (feedback, bank) {
				var opt = feedback.options
				if (self.BULBINFO.on == opt.option) {
					return true;
				}

				return false
			}
		}

		return feedbacks
	}
}
