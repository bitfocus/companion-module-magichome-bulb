module.exports = {
	setPresets: function (i) {
		var self = i
		var presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		// ########################
		// #### Power Presets ####
		// ########################

		presets.push({
			category: 'Power',
			label: 'Power On',
			bank: {
				style: 'text',
				text: 'Power\\nON',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'powerOn'
				}
			],
			feedbacks: [
				{
					type: 'powerState',
					options: {
						option: 1
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorGreen
					}
				}
			]
		})

		presets.push({
			category: 'Power',
			label: 'Power Off',
			bank: {
				style: 'text',
				text: 'Power\\nOFF',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'powerOff'
				}
			],
			feedbacks: [
				{
					type: 'powerState',
					options: {
						option: 0
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed
					}
				}
			]
		})

		presets.push({
			category: 'Power',
			label: 'Power Toggle',
			bank: {
				style: 'text',
				text: 'Power\\nTOGGLE',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'powerToggle'
				}
			],
			feedbacks: [
				{
					type: 'powerState',
					options: {
						option: 0
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed
					}
				},
				{
					type: 'powerState',
					options: {
						option: 1
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorGreen
					}
				}
			]
		})

		presets.push({
			category: 'Brightness',
			label: 'Brightness\\nUp',
			bank: {
				style: 'text',
				text: 'Brightness Up',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'brightnessUp',
					options: {
						rate: 50
					}
				}
			],
			release_actions: [
				{
					action: 'brightnessUpStop'
				}
			]
		})

		presets.push({
			category: 'Brightness',
			label: 'Brightness\\nDown',
			bank: {
				style: 'text',
				text: 'Brightness Down',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'brightnessDown',
					options: {
						rate: 50
					}
				}
			],
			release_actions: [
				{
					action: 'brightnessDownStop'
				}
			]
		})

		for (let i = 10; i <= 100; i = i + 10) {
			presets.push({
				category: 'Brightness',
				label: 'Brightness ' + i + '%',
				bank: {
					style: 'text',
					text: i + '%',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'brightness',
						options: {
							brightness: i 
						}
					}
				]
			})
		}

		presets.push({
			category: 'Whites',
			label: 'Warm White',
			bank: {
				style: 'text',
				text: 'WARM\\nWHITE',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'warmWhite',
				}
			]
		})

		presets.push({
			category: 'Whites',
			label: 'Cool White',
			bank: {
				style: 'text',
				text: 'COOL\\nWHITE',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'coolWhite'
				}
			]
		})

		presets.push({
			category: 'Colors',
			label: 'Red',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(255, 0, 0)
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(255, 0, 0)
					}
				}
			]
		})

		presets.push({
			category: 'Colors',
			label: 'Green',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 255, 0)
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(0, 255, 0)
					}
				}
			]
		})

		presets.push({
			category: 'Colors',
			label: 'Blue',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 255)
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(0, 0, 255)
					}
				}
			]
		})

		for (let i = 0; i < self.CHOICES_PATTERNS.length; i++) {
			presets.push({
				category: 'Patterns',
				label: self.CHOICES_PATTERNS[i].label,
				bank: {
					style: 'text',
					text: self.CHOICES_PATTERNS[i].label,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'pattern',
						options: {
							pattern: self.CHOICES_PATTERNS[i].id,
							speed: 85
						}
					}
				]
			})
		}

		return presets
	}
}
