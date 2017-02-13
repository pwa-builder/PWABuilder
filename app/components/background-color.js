import Ember from 'ember';
import colorConverter from './colorConverter/colorConverter';

export default Ember.Component.extend({
    color: '',
    colorText: '',
    lastColor: '',
    colorOption: undefined,
    checkInputColor: function () {
        var i = document.createElement("input");
        i.setAttribute("type", "color");
        return i.type !== "text";
    }.property("colorOption"),
    canChooseColor: function () {
        return this.colorOption === "pick";
    }.property("colorOption"),
    watchTypeColorChosen: function () {
        if (this.colorOption === "none") {
            this.set("color", "none");
        } else if (this.colorOption === "transparent") {
            this.set("color", "transparent");
        }
    }.observes("colorOption"),
    updateColorChosen: function () {
        if (this.color && this.lastColor !== this.color && this.context._state !== 'preRender') {
            this.sendAction('action', 'background_color', this.color);
            this.set('lastColor', this.color);
            this.set('colorText', this.color);
        }
    }.observes("color"),
    calculateColorOption: function () {
        var converter = colorConverter.create();

        if (!this.color || this.color === "none") {
            this.set('colorOption', 'none');
        } else if (this.color === 'transparent') {
            this.set('colorOption', 'transparent');
        } else if (converter.isHexadecimal(this.color)) {
            this.set('colorOption', 'pick');
            this.set('colorText', this.color);
        } else if (converter.isAlias(this.color) || converter.isRGB(this.color) || converter.isHSL(this.color)) {
            this.set('colorOption', 'pick');
            // Color picker component returns the color in the four byte hexa.
            this.set('color', "#" + converter.toHexadecimal(this.color).slice(4, 10));
            this.set('colorText', this.color);
        } else {
            this.set('colorOption', 'none');
        }
    }.observes("color").on('init'),
    actions: {
        updateModel: function () {
            this.set('color', this.colorText);
        }
    }
});