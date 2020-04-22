export default {
    debounce: function (func:any, wait:number, immediate:boolean) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    isValidJson: function (json) {
        try {
            JSON.parse(json);
            return true;
        } catch (e) {
            return false;
        }
    }
};