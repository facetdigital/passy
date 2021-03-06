/*
 * jQuery Passy
 * Generating and analazing passwords, realtime.
 *
 * Tim Severien
 * http://timseverien.nl
 *
 * Copyright (c) 2013 Tim Severien
 * Released under the GPLv2 license.
 *
 */


(function($) {
	var passy = {
		character: { DIGIT: 1, LOWERCASE: 2, UPPERCASE: 4, PUNCTUATION: 8 },
		strength: { LOW: 0, MEDIUM: 1, HIGH: 2, EXTREME: 3 },

		blackList: [],

		patterns: [
			'0123456789',
			'abcdefghijklmnopqrstuvwxyz',
			'qwertyuiopasdfghjklzxcvbnm',
			'azertyuiopqsdfghjklmwxcvbn',
			'!#$*+-.:?@^'
		],

		threshold: {
			medium: 3,
			high: 4,
			extreme: 5
		}
	};

	passy.requirements = {
		characters: passy.character.DIGIT | passy.character.LOWERCASE | passy.character.UPPERCASE,
		length: {
			min: 6,
			max: Infinity
		}
	};

	if(Object.seal) {
		Object.seal(passy.character);
		Object.seal(passy.strength);
	}

	if(Object.freeze) {
		Object.freeze(passy.character);
		Object.freeze(passy.strength);
	}

	passy.analize = function(password) {
		var zStrength = zxcvbn(password, $.passy.blackList);

        $result = $.passy.strength.LOW;
        if (zStrength.score == 3) {
            $result = $.passy.strength.MEDIUM;
        } else if (zStrength.score > 3) {
            var crackTime = String(zStrength.crack_time_display);
            if(crackTime.indexOf("centuries") !=-1) {
                $result = $.passy.strength.EXTREME;
            } else {
                $result = $.passy.strength.HIGH;
            }
        }

        return $result;
	};

	passy.generate = function(len) {
		var chars = [
			'0123456789',
			'abcdefghijklmnopqrstuvwxyz',
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			'!#$&()*+<=>@[]^'
		];

		var password = [];
		var type, index;

		len = Math.max(len, $.passy.requirements.length.min);
		len = Math.min(len, $.passy.requirements.length.max);

		while(len--) {
			type = len % chars.length;
			index = Math.floor(Math.random() * chars[type].length);
			password.push(chars[type].charAt(index));
		}

		password.sort(function() {
			return Math.random() * 2 - 1;
		});

		return password.join('');
	};

	passy.contains = function(str, character) {
		if(character === $.passy.character.DIGIT) {
			return /\d/.test(str);
		} else if(character === $.passy.character.LOWERCASE) {
			return /[a-z]/.test(str);
		} else if(character === $.passy.character.UPPERCASE) {
			return /[A-Z]/.test(str);
		} else if(character === $.passy.character.PUNCTUATION) {
			return /[!"#$%&'()*+,\-./:;<=>?@[\\]\^_`{\|}~]/.test(str);
		}
	};

	passy.valid = function(str) {
		var valid = true;

		if(!$.passy.requirements) return true;

		if(str.length < $.passy.requirements.length.min) return false;
		if(str.length > $.passy.requirements.length.max) return false;

		for(var i in $.passy.character) {
			if($.passy.requirements.characters & $.passy.character[i]) {
				valid = $.passy.contains(str, $.passy.character[i]) && valid;
			}
		}

		return valid;
	};

	var methods = {
		init: function(callback) {
			var $this = $(this);

			$this.on('change keyup', function() {
				if(typeof callback !== 'function') return;

				var value = $this.val();
				callback.call($this, $.passy.analize(value), methods.valid.call($this));
			});
		},

		generate: function(len) {
			this.val($.passy.generate(len));
			this.change();
		},

		valid: function() {
			return $.passy.valid(this.val());
		}
	};

	$.fn.passy = function(opt) {
		if(methods[opt]) {
			return methods[opt].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof opt === 'function' || !opt) {
			return methods.init.apply(this, arguments);
		}

		return this;
	};

	$.extend({ passy: passy });
})(jQuery);
