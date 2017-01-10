(function (factory) {
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
})(function ($) {

    'use strict';

    const NAMESPACE = 'qor.product.variants';
    const EVENT_ENABLE = 'enable.' + NAMESPACE;
    const EVENT_DISABLE = 'disable.' + NAMESPACE;
    const EVENT_CLICK = 'click.' + NAMESPACE;
    const CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    const CLASS_SELECT_TYPE = '.qor-product__property-selector';

    function QorProductVariants(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorProductVariants.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
    }

    QorProductVariants.prototype = {
        constructor: QorProductVariants,

        init: function () {
            this.bind();
            this.variants = {};
            this.productMetas = [];
            this.templateData = {};
            this.initVariants();
            this.initMetas();
        },

        bind: function () {
            this.$element.on('select2:select', CLASS_SELECT, this.selectVariants.bind(this));
        },

        unbind: function () {
            // this.$element
        },

        initVariants: function () {
            let $type = this.$element.find(CLASS_SELECT_TYPE);

            for (let i = 0, len = $type.length; i < len; i++) {
                this.variants[$type[i].dataset.variantType] = [];
            }
        },

        initMetas: function () {
            let $productMetas = this.$element.find('td.qor-product__meta');

            for (let j = 0, len2 = $productMetas.length; j < len2; j++) {
                this.productMetas.push($productMetas[j].dataset.inputName);
            }
            this.setTemplate();
        },

        setTemplate: function () {
            let productMetas = this.productMetas,
                template = '<tr>';


            for (let i = 0, len = productMetas.length; i < len; i++) {
                template = `${template}<td>[[${productMetas[i]}]]</td>`;
                // TODO: insert template data
                this.templateData[productMetas[i]] = '';
            }
            this.template = `${template}</tr>`;
        },

        selectVariants: function (e) {
            let type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                property = e.params.data.text || e.params.data.title;

            this.variants[type].push(property);
            this.renderVariants();
        },

        renderVariants: function () {
            let variants = this.variants;

            for (let key of Object.keys(variants)) {

                for (let i = 0, len = variants[key].length; i < len; i++) {
                    $('.qor-product__table table tbody').append(window.Mustache.render(this.template, this.templateData));
                }

            }


        },

        destroy: function () {
            this.unbind();
            this.$element.removeData(NAMESPACE);
        }
    };


    QorProductVariants.plugin = function (options) {
        return this.each(function () {
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


    $(function () {
        var selector = '[data-toggle="qor.product.variants"]';

        $(document)
            .
        on(EVENT_DISABLE, function (e) {
                QorProductVariants.plugin.call($(selector, e.target), 'destroy');
            })
            .
        on(EVENT_ENABLE, function (e) {
                QorProductVariants.plugin.call($(selector, e.target));
            })
            .
        triggerHandler(EVENT_ENABLE);
    });

    return QorProductVariants;
});
