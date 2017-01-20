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
    const EVENT_CLICK = `click.${NAMESPACE}`;
    const EVENT_KEYUP = `keyup.${NAMESPACE}`;
    const EVENT_CHANGED_MEDIALIBRARY = 'changed.medialibrary';
    const EVENT_REPLICATOR_ADDED = `added.${NAME_REPLICATOR}`;
    const EVENT_REPLICATORS_ADDED = `addedMultiple.${NAME_REPLICATOR}`;
    const CLASS_SELECT_CONTAINER = '.qor-product__property';
    const CLASS_SELECT = '.qor-product__property select[data-toggle="qor.chooser"]';
    const CLASS_SELECT_TYPE = '.qor-product__property-selector';
    const CLASS_TBODY = '.qor-product__table tbody';
    const CLASS_FIELDSET_CONTAINER = '.qor-product__container';
    const CLASS_FIELDSET = '.qor-fieldset';
    const CLASS_BUTTON_ADD = '.qor-fieldset__add';
    const ID_VARIANTS_PRE = 'qor_variants_id_';
    const CLASS_REMOVE = 'should_remove';
    const CLASS_INIT_FIELDSET = '.qor-fieldset--init';
    const CLASS_VARIANT_FEILD = '.qor-fieldset:not(.qor-fieldset--new)';
    const CLASS_VISIBLE_RESOURCE_INPUT = 'input[name*="QorResource.Variations"]:visible';
    const CLASS_MEDIALIBRARY_DATA = '.qor-field__mediabox-data';
    const CLASS_MEDIALIBRARY_BUTTON = '.qor-product__button-save';

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
            this.primaryMeta = [];
            this.$tbody = $element.find(CLASS_TBODY);
            this.$replicatorBtn = $element.find(CLASS_BUTTON_ADD);
            this.$fieldBlock = $element.find('.qor-product__container>.qor-field__block');
            this.initMetas();
            this.initPrimaryMeta();
        },

        bind: function () {
            $document
                .on(EVENT_REPLICATOR_ADDED, this.addVariantReplicator.bind(this))
                .on(EVENT_REPLICATORS_ADDED, this.addVariantReplicators.bind(this));

            this.$element
                .on('select2:select select2:unselect', CLASS_SELECT, this.selectVariants.bind(this))
                .on(EVENT_CLICK, '.qor-product__action--edit', this.editVariant.bind(this));
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

                this.primaryMeta.push(meta);

                for (let j = 0, len2 = collections.length; j < len2; j++) {
                    let $collection = $(collections[j]),
                        $input = $collection.find(`[name$=${meta}]`).not('[type="hidden"]'),
                        obj = {},
                        elementObj = {};

                    if ($input.is('select')) {
                        if ($input.val()) {
                            obj[meta] = $input.find('option').html();
                            obj.id = $input.val();
                            if (!_.isEqual(lastObj, obj)) {
                                metaArr.push(obj);
                            }
                            // add id for old variants, will keep old collection if already have collections;
                            elementObj[`${meta}_ID`] = obj.id;
                            elementObj[meta] = obj[meta];
                            $collection.data(`variants-${meta}`, elementObj);
                        }

                    } else {
                        // handle isn't select 
                    }
                    lastObj = obj;
                }

                metaArr.length && (PrimaryInitMetaData[`${meta}s`] = metaArr);
            }

            this.variants = this.PrimaryInitMetaData = PrimaryInitMetaData;
            this.variantsKey = this.collectObjectKeys();
            this.handleTemplateData();
            this.initPrimarySelector();
            this.setTableCollectionID(collections);
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

        setTableCollectionID: function (collections) {
            // console.log(this.templateData);
            let primaryMeta = this.primaryMeta;

            for (let i = 0, len = collections.length; i < len; i++) {
                let $collection = $(collections[i]),
                    obj = {},
                    objValues,
                    variantID;

                for (let j = 0, len2 = primaryMeta.length; j < len2; j++) {
                    let variantData = $collection.data(`variants-${primaryMeta[j]}`);
                    if (variantData) {
                        obj = Object.assign({}, obj, variantData);
                    }
                }

                objValues = _.values(obj).map(this.removeSpace);
                variantID = `${ID_VARIANTS_PRE}${objValues.join('_')}`;
                $collection.attr('id', variantID);
            }

        },

        removeSpace: function (value) {
            return value.toString().replace(/\s/g, '');
        },

        collectObjectKeys: function (obj) {
            let keys = [],
                objs = obj || this.variants;

            keys = Object.keys(objs).filter(function (key) {
                return objs[key].length > 0;
            });

            return keys;
        },

        setTemplate: function () {
            let productMetas = this.productMetas,
                templateStart = '<tr variants-id=[[variantID]]>',
                templateEnd = `<td>
                                <button type="button" id="qor-product-actions-for-[[variantID]]" class="mdl-button mdl-js-button mdl-button--icon qor-product__action">
                                    <i class="material-icons">more_vert</i>
                                </button>
                                <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu" for="qor-product-actions-for-[[variantID]]">
                                    <li class="mdl-menu__item" qor-icon-name="Edit">
                                        <a href="javascript://" class="qor-product__action--edit">Edit</a>
                                    </li>
                                </ul>
                            </td></tr>`;


            _.each(productMetas, function (productMeta) {
                templateStart = `${templateStart}<td data-variant-type=${productMeta}>[[${productMeta}]]</td>`;
            });

            this.template = `${templateStart}${templateEnd}`;
        },

        editVariant: function (e) {
            let $tr = $(e.target).closest('tr'),
                colspanLen = $tr.find('td').length,
                variantID = $tr.attr('variants-id'),
                inputName = $tr.find('td:first').data('inputName'),
                $item,
                randomID = (Math.random() + 1).toString(36).substring(7),
                $emptyCol = $(`<tr class="qor-variant__edit"><td class="normal" colspan=${colspanLen}></td></tr>`),
                buttonTemp = `<button type="button" class="mdl-button mdl-js-button mdl-button--raised ${CLASS_MEDIALIBRARY_BUTTON.replace('.','')}">OK</button>`;

            if ($tr.next('tr.qor-variant__edit').length) {
                return false;
            }

            if (inputName) {
                $item = $(`[name="${inputName}"]`).not('[type="hidden"]').closest(CLASS_FIELDSET).attr('id', randomID);
            } else if (variantID) {
                $item = $(`#${variantID}`);
            } else {
                return false;
            }

            $tr.after($emptyCol);
            !variantID && $tr.attr('variants-id', randomID);

            $item
                .appendTo($emptyCol.find('td'))
                .find(CLASS_MEDIALIBRARY_BUTTON).remove().end()
                .append(buttonTemp)
                .show().removeClass('hidden')
                .on(EVENT_KEYUP, CLASS_VISIBLE_RESOURCE_INPUT, this.syncCollectionToVariant.bind(this))
                .on(EVENT_CLICK, CLASS_MEDIALIBRARY_BUTTON, this.saveCollevtionEdit.bind(this))
                .on(EVENT_CHANGED_MEDIALIBRARY, CLASS_MEDIALIBRARY_DATA, this.syncCollectionToVariant.bind(this));

            this.hidePrimaryMeta($item);
        },

        hidePrimaryMeta: function ($item) {
            let primaryMeta = this.primaryMeta;
            // hide variant primary property
            for (let i = 0, len = primaryMeta.length; i < len; i++) {
                $item.find(`[name$=${primaryMeta[i]}]`).not('[type="hidden"]').closest('.qor-form-section').hide();
            }
        },

        syncCollectionToVariant: function (e) {
            let $target = $(e.target),
                value = $target.val(),
                collectionID = $target.closest(CLASS_FIELDSET).attr('id'),
                $editableVariant = $(`tr[variants-id="${collectionID}"]`),
                variantType = $target.prop('name').match(/\.\w+/g),
                $td,
                url;

            variantType = variantType[variantType.length - 1].replace('.', '');
            $td = $editableVariant.find(`[data-variant-type="${variantType}"]`);

            if ($target.is('textarea')) {
                url = JSON.parse(value)[0].Url;
                $td.html(`<img src="${url}"/>`);
            } else {
                $td.html(value);
            }

        },

        saveCollevtionEdit: function (e) {
            let $target = $(e.target),
                $editableCollection = $target.closest(CLASS_FIELDSET),
                $editableVariant = $editableCollection.closest('tr');

            $editableVariant.remove();
            $editableCollection
                .appendTo(this.$fieldBlock)
                .off(EVENT_KEYUP, CLASS_VISIBLE_RESOURCE_INPUT, this.syncCollectionToVariant.bind(this))
                .off(EVENT_CLICK, CLASS_MEDIALIBRARY_BUTTON, this.saveCollevtionEdit.bind(this))
                .off(EVENT_CHANGED_MEDIALIBRARY, CLASS_MEDIALIBRARY_DATA, this.syncCollectionToVariant.bind(this))
                .hide();
        },

        selectVariants: function (e) {
            let type = $(e.target).closest(CLASS_SELECT_TYPE).data('variant-type'),
                params = e.params.data,
                isSelected = params.selected,
                variantValue = params.text || params.title || params.Name,
                topType = `${type}s`,
                variantData = {};

            if (this.ingoreInitChange) {
                return false;
            }

            // if already have variants:
            this.variants[topType] = this.variants[topType] || [];

            if (isSelected) {
                variantData[type] = variantValue;
                variantData.id = params.id.toString();
                this.variants[topType].push(variantData);
            } else {
                variantData = this.variants[topType].filter(function (item) {
                    return item[type] != variantValue;
                });
                this.variants[topType] = variantData;
            }

            this.renderVariants();
        },

        renderVariants: function () {
            let variantsKey;

            variantsKey = this.collectObjectKeys();

            if (variantsKey.length === 0) {
                // empty table if no variants selected
                this.$tbody.html('');
                return;
            }

            this.variantsKey = variantsKey;
            this.convertVariantsData();

        },

        convertVariantsData: function () {
            // store last template data to compare.
            this.lastTemplateData = this.templateData;
            this.templateData = [];
            this.handleTemplateData();
            this.renderVariantsTable();
        },

        handleTemplateData: function () {
            let maxIndices = [],
                variantsKey = this.variantsKey,
                variants = this.variants;

            _.each(variantsKey, function (key) {
                maxIndices.push(variants[key].length);
            });

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
        },

        renderVariantsTable: function () {
            let $tbody = this.$tbody,
                template = this.template,
                templateData = this.templateData,
                $editableCollection = $tbody.find('.qor-variant__edit');

            if ($editableCollection.length) {
                $editableCollection.find(CLASS_FIELDSET).appendTo(this.$fieldBlock);
            }

            $tbody.html('');

            // TODO: keep old variant, not just fill tbody with new variant list
            for (let i = 0, len = templateData.length; i < len; i++) {
                let data = {};
                data = templateData[i];
                $tbody.append(window.Mustache.render(template, data));
            }

            $tbody.trigger('enable');
            this.doReplicator();
        },

        doReplicator: function () {
            let templateData = this.templateData,
                lastTemplateData = this.lastTemplateData,
                newObj = [];

            this.$element.find(CLASS_VARIANT_FEILD).addClass(CLASS_REMOVE);

            for (let i = 0, len = templateData.length; i < len; i++) {
                let data = templateData[i],
                    oldObj = [];

                if (lastTemplateData) {
                    oldObj = _.filter(lastTemplateData, function (lastData) {
                        return _.isEqual(lastData, data);
                    });
                }

                if (oldObj.length) {
                    let $oldID = $(`#${oldObj[0].variantID}`);
                    if ($oldID.length) {
                        $oldID.removeClass(CLASS_REMOVE);
                    }
                } else {
                    newObj.push(data);
                }
            }

            // TODO: add loading
            // this.addLoading();
            this.replicator = this.replicator || this.$element.find(CLASS_FIELDSET_CONTAINER).data(NAME_REPLICATOR);
            setTimeout(() => {
                this.replicator.addReplicators(newObj, this.$replicatorBtn);
            }, 500);

            this.$element.find(`${CLASS_VARIANT_FEILD}.${CLASS_REMOVE}`).find('.qor-fieldset__delete').trigger('click').hide();

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

        addLoading: function () {
            $('.qor-product__loading').remove();
            var $loading = $(QorProductVariants.TEMPLATE_LOADING);
            $loading.appendTo($(CLASS_SELECT_CONTAINER)).trigger('enable');
        },

        // sync variants data between table and replicator
        addVariantReplicator: function (e, $item, data) {
            $item.attr({ 'variant-data': JSON.stringify(data), 'id': data.variantID }).hide();
            this.syncReplicatorData($item, data);
        },

        addVariantReplicators: function () {
            $('.qor-product__loading').remove();
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

    QorProductVariants.TEMPLATE_LOADING = (
        `<div class="qor-product__loading">
            <div><div class="mdl-spinner mdl-js-spinner is-active qor-layout__bottomsheet-spinner"></div></div>
        </div>`
    );

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
