'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node / CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function ($) {

    'use strict';

    var _ = window._;
    var $document = $(document);
    var NAMESPACE = 'qor.product.variants';
    var EVENT_ENABLE = 'enable.' + NAMESPACE;
    var EVENT_DISABLE = 'disable.' + NAMESPACE;
    var NAME_REPLICATOR = 'qor.replicator';
    var EVENT_REPLICATOR_ADDED = 'added.qor.replicator';
    var CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    var CLASS_SELECT_TYPE = '.qor-product__property-selector';
    var CLASS_TBODY = '.qor-product__table tbody';
    var CLASS_FIELDSET_CONTAINER = '.qor-product__container';
    var CLASS_BUTTON_ADD = '.qor-fieldset__add';
    var ID_VARIANTS_PRE = 'qor_variants_id_';

    function QorProductVariants(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorProductVariants.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
    }

    QorProductVariants.prototype = {
        constructor: QorProductVariants,

        init: function init() {
            var $element = this.$element;
            this.bind();
            this.variants = {};
            this.productMetas = [];
            this.templateData = [];
            this.templateData = [];
            this.$tbody = $element.find(CLASS_TBODY);
            this.$replicatorBtn = $element.find(CLASS_BUTTON_ADD);
            this.initMetas();
        },

        bind: function bind() {
            $document.on(EVENT_REPLICATOR_ADDED, this.addVariantReplicator.bind(this));

            this.$element.on('select2:select select2:unselect', CLASS_SELECT, this.selectVariants.bind(this));
        },

        unbind: function unbind() {
            // this.$element
        },

        initMetas: function initMetas() {
            var $productMetas = this.$element.find('td.qor-product__meta');

            _.each($productMetas, function (productMeta) {
                this.productMetas.push($(productMeta).data('inputName'));
            }.bind(this));

            this.setTemplate();
        },

        removeSpace: function removeSpace(value) {
            return value.replace(/\s/g, '');
        },

        setTemplate: function setTemplate() {
            var productMetas = this.productMetas,
                template = '<tr>';

            _.each(productMetas, function (productMeta) {
                template = template + '<td>[[' + productMeta + ']]</td>';
                // TODO: insert template data
                // this.templateData[productMeta] = '';
            }.bind(this));

            this.template = template + '</tr>';
        },

        // sync variants data between table and replicator
        addVariantReplicator: function addVariantReplicator(e, $item, data) {
            $item.prop('id', data.variantID);
            $item.attr('variant-data', JSON.stringify(data));
        },

        // if realready have variants, will not generate replicator.
        compareVariants: function compareVariants(data) {
            var variantID = data.variantID,
                $item = this.$element.find('#' + variantID);

            if ($item.length) {
                return true;
            }

            return false;
        },

        selectVariants: function selectVariants(e) {
            var type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                params = e.params.data,
                isSelected = params.selected,
                variantValue = params.text || params.title || params.Name,
                topValue = type + 's',
                variantData = {};

            this.variants[topValue] = this.variants[topValue] || [];

            if (isSelected) {
                variantData[type] = variantValue;
                this.variants[topValue].push(variantData);
            } else {
                variantData = this.variants[topValue].filter(function (item) {
                    return item[type] != variantValue;
                });
                this.variants[topValue] = variantData;
            }

            this.renderVariants();
        },

        renderVariants: function renderVariants() {
            var variants = this.variants,
                variantsKey = [];

            variantsKey = Object.keys(variants).filter(function (variant) {
                return variants[variant].length > 0;
            });

            if (variantsKey.length === 0) {
                // empty table if no variants selected
                this.$tbody.html('');
                return;
            }

            this.variantsKey = variantsKey;
            this.convertVariantsData();
        },

        convertVariantsData: function convertVariantsData() {
            var _this = this;

            var variants = this.variants,
                maxIndices = [],
                variantsKey = this.variantsKey;

            _.each(variantsKey, function (key) {
                maxIndices.push(variants[key].length);
            });

            this.templateData = [];

            if (variantsKey.length === 1) {
                (function () {
                    var variant = variants[variantsKey[0]],
                        obj = {};

                    _.each(variant, function (item) {
                        var key = _.keys(item)[0],
                            value = item[key];

                        obj[key] = value;
                        obj.variantID = '' + ID_VARIANTS_PRE + value.replace(/\s/g, '');
                        this.templateData.push(obj);
                    }.bind(_this));
                })();
            } else {
                // TODO: compare each ID? not just empty templateData.
                this.handleMultipleVariantsData(maxIndices, this.generateData.bind(this));
            }
            this.renderVariantsTable();
        },

        renderVariantsTable: function renderVariantsTable() {
            var $tbody = this.$tbody,
                template = this.template,
                templateData = this.templateData;

            this.replicator = this.replicator || this.$element.find(CLASS_FIELDSET_CONTAINER).data(NAME_REPLICATOR);

            $tbody.html('');
            _.each(templateData, function (data) {
                $tbody.append(window.Mustache.render(template, data));
                if (this.compareVariants(data)) {
                    // TODO: restore removed variants
                } else {
                    this.replicator.add(null, this.$replicatorBtn, data);
                }
            }.bind(this));
        },

        generateData: function generateData(arrs) {
            var variantsKey = this.variantsKey,
                variants = this.variants,
                objValues = void 0,
                obj = {};
            // assume has Variants Data: 
            // varints = {Color: [{Color: Blue},{Color: White}], Size: [{Size: S}, {Size: M}]}
            // arrs will be (2X2): [0,0],[0,1],[1,0],[1,1]
            // variantsKey = [Color, Size];
            // obj will be [{Color: Blue, Size: S},{Color: Blue, Size: M},{Color: White, Size: S},{Color: White, Size: M}]
            // 
            // if have 3(or more) variants type: [Color, Size, Material]
            // varints = {Color: [{Color: Blue},{Color: White}], Size: [{Size: S}, {Size: M}], Material: [{Material: Jersey}, {Material: Cashmere}]}
            // arrs will be (2X2X2) : [0,0,0],[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]
            // 
            // variants[variantsKey[i]][arrs[i]]);
            // variantsKey[i] will get varints.Color
            // arrs[i] will get varints.Color[0] => {Color: Blue}
            for (var i = 0, len = arrs.length; i < len; i++) {
                obj = Object.assign({}, obj, variants[variantsKey[i]][arrs[i]]);
            }

            objValues = _.values(obj).map(this.removeSpace);
            obj.variantID = '' + ID_VARIANTS_PRE + objValues.join('_');
            this.templateData.push(obj);
        },

        handleMultipleVariantsData: function handleMultipleVariantsData(maxIndices, func) {
            this.convertMultipleVariantsData(maxIndices, func, [], 0);
        },

        convertMultipleVariantsData: function convertMultipleVariantsData(maxIndices, func, args, index) {
            if (maxIndices.length == 0) {
                func(args);
            } else {
                var rest = maxIndices.slice(1);
                for (args[index] = 0; args[index] < maxIndices[0]; ++args[index]) {
                    this.convertMultipleVariantsData(rest, func, args, index + 1);
                }
            }
        },

        destroy: function destroy() {
            this.unbind();
            this.$element.removeData(NAMESPACE);
        }
    };

    QorProductVariants.plugin = function (options) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var fn = void 0;

            if (!data) {
                if (/destroy/.test(options)) {
                    return;
                }
                $this.data(NAMESPACE, data = new QorProductVariants(this, options));
            }

            if (typeof options === 'string' && $.isFunction(fn = data[options])) {
                fn.apply(data);
            }
        });
    };

    $(function () {
        var selector = '[data-toggle="qor.product.variants"]';

        $(document).on(EVENT_DISABLE, function (e) {
            QorProductVariants.plugin.call($(selector, e.target), 'destroy');
        }).on(EVENT_ENABLE, function (e) {
            QorProductVariants.plugin.call($(selector, e.target));
        }).triggerHandler(EVENT_ENABLE);
    });

    return QorProductVariants;
});