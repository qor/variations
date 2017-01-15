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
    const $document = $(document);
    const NAMESPACE = 'qor.product.variants';
    const EVENT_ENABLE = 'enable.' + NAMESPACE;
    const EVENT_DISABLE = 'disable.' + NAMESPACE;
    const NAME_REPLICATOR = 'qor.replicator';
    const EVENT_REPLICATOR_ADDED = 'added.qor.replicator';
    const CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    const CLASS_SELECT_TYPE = '.qor-product__property-selector';
    const CLASS_TBODY = '.qor-product__table tbody';
    const CLASS_FIELDSET_CONTAINER = '.qor-product__container';
    const CLASS_BUTTON_ADD = '.qor-fieldset__add';
    const ID_VARIANTS_PRE = 'qor_variants_id_';

    function QorProductVariants(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorProductVariants.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
    }

    QorProductVariants.prototype = {
        constructor: QorProductVariants,

        init: function () {
            let $element = this.$element;
            this.bind();
            this.variants = {};
            this.productMetas = [];
            this.templateData = [];
            this.templateData = [];
            this.$tbody = $element.find(CLASS_TBODY);
            this.$replicatorBtn = $element.find(CLASS_BUTTON_ADD);
            this.initMetas();
        },

        bind: function () {
            $document
                .on(EVENT_REPLICATOR_ADDED, this.addVariantReplicator.bind(this));

            this.$element
                .on('select2:select select2:unselect', CLASS_SELECT, this.selectVariants.bind(this));
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

        removeSpace: function (value) {
            return value.replace(/\s/g, '');
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

        // sync variants data between table and replicator
        addVariantReplicator: function (e, $item, data) {
            $item.prop('id', data.variantID);
            $item.attr('variant-data', JSON.stringify(data));
        },

        // if realready have variants, will not generate replicator.
        compareVariants: function (data) {
            let variantID = data.variantID,
                $item = this.$element.find(`#${variantID}`);

            if ($item.length) {
                return true;
            }

            return false;
        },

        selectVariants: function (e) {
            let type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                params = e.params.data,
                isSelected = params.selected,
                variantValue = params.text || params.title || params.Name,
                topValue = `${type}s`,
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

        renderVariants: function () {
            let variants = this.variants,
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

        convertVariantsData: function () {
            let variants = this.variants,
                maxIndices = [],
                variantsKey = this.variantsKey;


            _.each(variantsKey, function (key) {
                maxIndices.push(variants[key].length);
            });

            this.templateData = [];

            if (variantsKey.length === 1) {
                let variant = variants[variantsKey[0]],
                    obj = {};

                _.each(variant, function (item) {
                    let key = _.keys(item)[0],
                        value = item[key];

                    obj[key] = value;
                    obj.variantID = `${ID_VARIANTS_PRE}${value.replace(/\s/g, '')}`;
                    this.templateData.push(obj);
                }.bind(this));

            } else {
                // TODO: compare each ID? not just empty templateData.
                this.handleMultipleVariantsData(maxIndices, this.generateData.bind(this));
            }
            this.renderVariantsTable();
        },

        renderVariantsTable: function () {
            let $tbody = this.$tbody,
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

        generateData: function (arrs) {
            let variantsKey = this.variantsKey,
                variants = this.variants,
                objValues,
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
            for (let i = 0, len = arrs.length; i < len; i++) {
                obj = Object.assign({}, obj, variants[variantsKey[i]][arrs[i]]);
            }

            objValues = _.values(obj).map(this.removeSpace);
            obj.variantID = `${ID_VARIANTS_PRE}${objValues.join('_')}`;
            this.templateData.push(obj);
        },

        handleMultipleVariantsData: function (maxIndices, func) {
            this.convertMultipleVariantsData(maxIndices, func, [], 0);
        },

        convertMultipleVariantsData: function (maxIndices, func, args, index) {
            if (maxIndices.length == 0) {
                func(args);
            } else {
                let rest = maxIndices.slice(1);
                for (args[index] = 0; args[index] < maxIndices[0]; ++args[index]) {
                    this.convertMultipleVariantsData(rest, func, args, index + 1);
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
            let $this = $(this);
            let data = $this.data(NAMESPACE);
            let fn;

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
        let selector = '[data-toggle="qor.product.variants"]';

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
