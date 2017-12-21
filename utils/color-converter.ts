import colorConstants from './color-constants';

// Migrated from ember project
export default {
    isAlias: function(color) {
        return typeof colorConstants.colorsAlias[color.toLowerCase()] !== 'undefined';
    },
    isHexadecimal: function(color) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
    },
    rgbRegExp : /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(0?\.?\d+))?\)$/,
    isRGB: function(color) {
        return this.rgbRegExp.test(color.toLowerCase());
    },
    hslRegExp : /^hsla?\(\s*(0|[1-9]\d?|[12]\d\d|3[0-5]\d)\s*,\s*((0|[1-9]\d?|100)%)\s*,\s*((0|[1-9]\d?|100)%)\s*(?:,\s*(0?\.?\d+)?)?\)$/,
    isHSL : function (color) {
        return this.hslRegExp.test(color.toLowerCase());
    },
    fromHexadecimal: function (color, aChannel) {
        if (!this.isHexadecimal(color)) {
            throw new Error('The color passed has not a valid format: ' + color);
        }

        aChannel = aChannel || 'ff';

        color = color.replace('#', '');
        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }

        return '0x' + aChannel + color;
    },
    fromAlias: function (color) {
        if (!this.isAlias(color)) {
            throw new Error('The color passed has not a valid format.');
        }
        let alphaChannel = 1;
        if (color === 'transparent') {
            alphaChannel = 0;
        }
        alphaChannel = this.getHexaWithPadding(alphaChannel * 255);

        let hexColor = colorConstants.colorsAlias[color.toLowerCase()];
        return this.fromHexadecimal(hexColor, alphaChannel);
    },
    fromRGB: function(color) {
        if (!this.isRGB(color)) {
            throw new Error('The color passed has not a valid format: ' + color);        
        }
        let channels = this.rgbRegExp.exec(color);
        if (channels === null) {
            throw new Error('The color passed has not a valid format: ' + channels);
        }

        let hexaColor = '#' + this.getHexaWithPadding(channels[1]) + this.getHexaWithPadding(channels[2]) + this.getHexaWithPadding(channels[3]);

        let alphaChannel = 'ff';

        if (channels.length === 5 && channels[4] !== null) {
            //Convert Alpha Channel.
            alphaChannel = this.getHexaWithPadding(channels[4] * 255);
        }
        return this.fromHexadecimal(hexaColor, alphaChannel);
    },
    fromHSL: function(color) {
        if (!this.isHSL(color)) {
            throw new Error('The color passed has not a valid format: ' + color);
        }

        let channels = this.hslRegExp.exec(color);
        if (channels === null) {
            throw new Error('The color passed has not a valid format: ' + channels);
        }

        let alphaChannel = 'ff';
        if (channels.length === 7 && channels[6] !== null) {
            //Convert Alpha Channel.
            alphaChannel = this.getHexaWithPadding(channels[6] * 255);
        }
        
        let rgb = this.hslToRgb(channels[1], channels[3], channels[5]);

        let hexaColor = '#' + this.getHexaWithPadding(rgb.r) + this.getHexaWithPadding(rgb.g) + this.getHexaWithPadding(rgb.b);
        return this.fromHexadecimal(hexaColor, alphaChannel);    
    },
    toHexadecimal: function(color) {
        if (this.isAlias(color)) {
            return this.fromAlias(color);
        }
        if (this.isHexadecimal(color)) {
            return this.fromHexadecimal(color);
        }
        if (this.isRGB(color)) {
            return this.fromRGB(color);
        }
        if (this.isHSL(color)) {
            return this.fromHSL(color);
        }
        return null;
    },
    hslToRgb: function (h, s, l) {
        let r, g, b;

        h = this.bound01(h, 360);
        s = this.bound01(s, 100);
        l = this.bound01(l, 100);

        function hue2rgb(p, q, t) {
            if (t < 0) { 
                t += 1; 
            }
            if (t > 1) { 
                t -= 1; 
            }
            if (t < 1 / 6) { 
                return p + (q - p) * 6 * t; 
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        if (s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    },
    bound01: function(n, max) {
        if (this.isOnePointZero(n)) { n = '100%'; }

        let processPercent = this.isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));

        if (processPercent) {
            n = parseInt((n * max) + '', 10) / 100;
        }

        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }

        return (n % max) / parseFloat(max);
    },
    isOnePointZero: function(n) {
        return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
    },
    isPercentage: function(n) {
        return typeof n === 'string' && n.indexOf('%') !== -1;
    },
    getHexaWithPadding: function(number) {
        let simpleHexa = parseInt(number).toString(16);
        let pad = '00';

        return (pad + simpleHexa).slice(-2);
    }
};