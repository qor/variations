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
    const NAME_REPLICATOR = 'qor.replicator';
    const EVENT_ENABLE = `enable.${NAMESPACE}`;
    const EVENT_DISABLE = `disable.${NAMESPACE}`;
    const EVENT_REPLICATOR_ADDED = `added.${NAME_REPLICATOR}`;
    const CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    const CLASS_SELECT_TYPE = '.qor-product__property-selector';
    const CLASS_TBODY = '.qor-product__table tbody';
    const CLASS_FIELDSET_CONTAINER = '.qor-product__container';
    const CLASS_BUTTON_ADD = '.qor-fieldset__add';
    const ID_VARIANTS_PRE = 'qor_variants_id_';
    const CLASS_REMOVE = 'should_remove';
    const CLASS_INIT_FIELDSET = '.qor-fieldset--init';
    const CLASS_VARIANT_FEILD = '.qor-fieldset:not(.qor-fieldset--new)';

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
            this.PrimaryInitMetaData = {};
            this.productMetas = [];
            this.templateData = [];
            this.$tbody = $element.find(CLASS_TBODY);
            this.$replicatorBtn = $element.find(CLASS_BUTTON_ADD);
            this.initMetas();
            this.initPrimaryMeta();
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
            let productMetas = this.$element.find('.qor-product__meta');

            for (let i = 0, len = productMetas.length; i < len; i++) {
                this.productMetas.push($(productMetas[i]).data('inputName'));
            }
            this.setTemplate();
        },

        initPrimaryMeta: function () {
            let primaryMeta = this.$element.find(CLASS_SELECT_TYPE),
                collections = this.$element.find(CLASS_INIT_FIELDSET),
                PrimaryInitMetaData = {},
                lastObj = {};

            for (let i = 0, len = primaryMeta.length; i < len; i++) {
                let metaArr = [],
                    meta = $(primaryMeta[i]).data('variant-type');

                for (let j = 0, len2 = collections.length; j < len2; j++) {
                    let $collection = $(collections[j]),
                        $input = $collection.find(`[name$=${meta}]`).not('[type="hidden"]'),
                        obj = {};

                    if ($input.is('select')) {
                        if ($input.val()) {
                            obj[meta] = $input.find('option').text();
                            obj.id = $input.val();
                            if (!_.isEqual(lastObj, obj)) {
                                metaArr.push(obj);
                            }
                        }
                    } else {
                        // handle isn't select 
                    }
                    lastObj = obj;
                }

                metaArr.length && (PrimaryInitMetaData[`${meta}s`] = metaArr);
            }

            this.PrimaryInitMetaData = PrimaryInitMetaData;
            this.initPrimarySelector();
        },

        initPrimarySelector: function () {
            let data = this.PrimaryInitMetaData,
                keys = Object.keys(data);

            this.ingoreInitChange = true;

            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i].slice(0, -1),
                    $select = $(`[data-variant-type="${key}"]`).find('.qor-field__input-selector'),
                    obj = data[keys[i]];

                for (let j = 0, len = obj.length; j < len; j++) {
                    $select.append(`<option selected value='${obj[j].id}'>${obj[j][key]}</option>`);
                }

                $select.trigger('change');
            }

            this.ingoreInitChange = false;

        },

        removeSpace: function (value) {
            return value.toString().replace(/\s/g, '');
        },

        setTemplate: function () {
            let productMetas = this.productMetas,
                template = '<tr>';


            _.each(productMetas, function (productMeta) {
                template = `${template}<td>[[${productMeta}]]</td>`;
            }.bind(this));

            this.template = `${template}</tr>`;
        },

        selectVariants: function (e) {
            let type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                params = e.params.data,
                isSelected = params.selected,
                variantValue = params.text || params.title || params.Name,
                topValue = `${type}s`,
                variantData = {};

            if (this.ingoreInitChange) {
                return false;
            }

            // if already have variants:
            this.variants = this.PrimaryInitMetaData;
            this.variants[topValue] = this.variants[topValue] || [];

            if (isSelected) {
                variantData[type] = variantValue;
                variantData.id = params.id;
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

            // store last template data to compare.
            this.lastTemplateData = this.templateData;
            this.templateData = [];

            if (variantsKey.length === 1) {
                let variant = variants[variantsKey[0]];

                for (let i = 0, len = variant.length; i < len; i++) {
                    let item = variant[i],
                        key = _.keys(item)[0],
                        value = item[key],
                        obj = {};

                    obj[key] = value;
                    obj.id = item.id;
                    obj.variantID = `${ID_VARIANTS_PRE}${value.replace(/\s/g, '')}`;
                    this.templateData.push(obj);
                }

            } else {
                this.handleMultipleVariantsData(maxIndices, this.generateData.bind(this));
            }
            this.renderVariantsTable();
        },

        renderVariantsTable: function () {
            let $tbody = this.$tbody,
                template = this.template,
                templateData = this.templateData;

            $tbody.html('');

            for (let i = 0, len = templateData.length; i < len; i++) {
                $tbody.append(window.Mustache.render(template, templateData[i]));
            }

            this.doReplicator();
        },

        doReplicator: function () {
            let templateData = this.templateData,
                lastTemplateData = this.lastTemplateData,
                oldObj,
                newObj = [];

            this.$element.find(CLASS_VARIANT_FEILD).addClass(CLASS_REMOVE);

            for (let i = 0, len = templateData.length; i < len; i++) {
                let data = templateData[i];
                oldObj = _.filter(lastTemplateData, function (lastData) {
                    return _.isEqual(lastData, data);
                });

                if (oldObj.length) {
                    let $oldID = $(`#${oldObj[0].variantID}`);
                    if ($oldID.length) {
                        $oldID.removeClass(CLASS_REMOVE);
                    }
                } else {
                    newObj.push(data);
                }
            }

            this.replicator = this.replicator || this.$element.find(CLASS_FIELDSET_CONTAINER).data(NAME_REPLICATOR);
            setTimeout(() => {
                this.replicator.addReplicators(newObj, this.$replicatorBtn);
            }, 500);

            this.$element.find(`${CLASS_VARIANT_FEILD}.${CLASS_REMOVE}`).find('.qor-fieldset__delete').trigger('click');

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
                // console.log(variants[variantsKey[i]][arrs[i]]);
                // console.log('-------');
                let item = variants[variantsKey[i]][arrs[i]];

                obj[`${variantsKey[i]}_ID`] = item.id;
                obj = Object.assign({}, obj, item);
            }

            delete obj.id;

            //obj will be:
            //Color: {"Color": "White",Colors_ID: 3,Size: "M",Sizes_ID: 2,variantID: "qor_variants_id_3_White_2_M"}

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

        // sync variants data between table and replicator
        addVariantReplicator: function (e, $item, data) {
            $item.attr({ 'variant-data': JSON.stringify(data), 'id': data.variantID }).hide();
            this.syncReplicatorData($item, data);
        },

        syncReplicatorData: function ($item, data) {
            let keys = Object.keys(data);

            for (let i = 0, len = keys.length; i < len; i++) {
                let $input = $item.find(`[name$=${keys[i]}]`).not('[type="hidden"]');
                let idKey;

                if (!$input.length) {
                    continue;
                }

                if ($input.is('select')) {
                    if ($input.data('remote-data')) {
                        idKey = `${keys[i]}s_ID`;
                        $input.append(`<option selected value='${data.id || data[idKey]}'>${data[keys[i]]}</option>`).trigger('change');
                    } else {

                        // not select
                    }
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
