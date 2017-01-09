(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function($) {

    'use strict';

    var NAMESPACE = 'qor.help';
    var EVENT_ENABLE = 'enable.' + NAMESPACE;
    var EVENT_DISABLE = 'disable.' + NAMESPACE;
    var EVENT_CLICK = 'click.' + NAMESPACE;

    function QorProductVariants(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorProductVariants.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
    }

    QorProductVariants.prototype = {
        constructor: QorProductVariants,

        init: function() {
            this.bind();
        },

        bind: function() {
            // this.$element

        },

        unbind: function() {
            // this.$element
        },

        destroy: function() {
            this.unbind();
            this.$element.removeData(NAMESPACE);
        }
    };


    QorProductVariants.plugin = function(options) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var fn;

            if (!data) {
                if (/destroy/.test(options)) {
                    return;
                }
                $this.data(NAMESPACE, (data = new QorProductVariants(this, options)));
            }

            if (typeof options === 'string' && $.isFunction(fn = data[options])) {
                fn.apply(data);
            }
        });
    };


    $(function() {
        var selector = '[data-toggle="qor.product.variants"]';

        $(document).
        on(EVENT_DISABLE, function(e) {
            QorProductVariants.plugin.call($(selector, e.target), 'destroy');
        }).
        on(EVENT_ENABLE, function(e) {
            QorProductVariants.plugin.call($(selector, e.target));
        }).
        triggerHandler(EVENT_ENABLE);
    });

    return QorProductVariants;
});