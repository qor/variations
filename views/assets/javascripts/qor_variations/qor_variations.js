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

    const _ = window._;
    const NAMESPACE = 'qor.product.variants';
    const EVENT_ENABLE = 'enable.' + NAMESPACE;
    const EVENT_DISABLE = 'disable.' + NAMESPACE;
    const EVENT_CLICK = 'click.' + NAMESPACE;
    const CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    const CLASS_SELECT_TYPE = '.qor-product__property-selector';
    const CLASS_TBODY = '.qor-product__table table tbody';

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
            this.templateData = [];
            this.$tbody = this.$element.find(CLASS_TBODY);
            this.initMetas();
        },

        bind: function () {
            this.$element.on('select2:select', CLASS_SELECT, this.selectVariants.bind(this));
        },

        unbind: function () {
            // this.$element
        },

        initMetas: function () {
            let $productMetas = this.$element.find('td.qor-product__meta');

            _.each($productMetas, function (productMeta) {
                this.productMetas.push($(productMeta).data('inputName'));
            }.bind(this));

            this.setTemplate();
        },

        setTemplate: function () {
            let productMetas = this.productMetas,
                template = '<tr>';


            _.each(productMetas, function (productMeta) {
                template = `${template}<td>[[${productMeta}]]</td>`;
                // TODO: insert template data
                // this.templateData[productMeta] = '';
            }.bind(this));

            this.template = `${template}</tr>`;
        },

        selectVariants: function (e) {
            let type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                params = e.params.data,
                value = params.text || params.title || params.Name,
                topValue = `${type}s`,
                variantData = {};

            variantData[type] = value;
            this.variants[topValue] = this.variants[topValue] || [];
            this.variants[topValue].push(variantData);
            this.renderVariants();
        },


        renderVariants: function () {
            let variants = this.variants,
                variantsHasValueKey = [],
                templateData = [],
                variantsHasValueKeyLength,
                $tbody = this.$tbody,
                variantTemp,
                template = this.template;

            // empty variants: 
            $tbody.html('');

            variantsHasValueKey = _.filter(Object.keys(variants), function (variant) {
                return variants[variant].length > 0;
            });

            variantsHasValueKeyLength = variantsHasValueKey.length;

            if (variantsHasValueKeyLength === 0) {
                return;
            }

            if (variantsHasValueKeyLength > 1) {

                let variantArr1 = variants[variantsHasValueKey[0]],
                    variantArr2 = variants[variantsHasValueKey[1]];

                _.each(variantArr1, function (item) {
                    _.each(variantArr2, function (itemInner) {
                        variantTemp = Object.assign({}, itemInner, item);
                        templateData.push(variantTemp);
                    });
                });

            } else {
                templateData.push(variants[variantsHasValueKey[0]]);
            }

            _.each(templateData, function (data) {
                $tbody.append(window.Mustache.render(template, data));
            });

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
