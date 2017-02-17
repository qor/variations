"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t("object"===("undefined"==typeof exports?"undefined":_typeof(exports))?require("jquery"):jQuery)}(function(t){function e(i,a){this.$element=t(i),this.options=t.extend({},e.DEFAULTS,t.isPlainObject(a)&&a),this.init()}var i=window._,a=t(document),n="qor.product.variants",r="qor.replicator",o="enable."+n,s="disable."+n,d="click."+n,l="keyup."+n,c="changed.medialibrary",h="added."+r,u="addedMultiple."+r,f=".qor-product__property",p='.qor-product__property select[data-toggle="qor.chooser"]',m=".qor-product__property-selector",v=".qor-product__table tbody",b=".qor-product__table table",_=".qor-product__table tbody tr",g=".qor-product__container",y=".qor-fieldset",q=".qor-fieldset__add",V="qor_variants_id_",k="should_remove",D="is_removed",$=".is_deleted",I="tr.is-selected:not("+$+")",T="is_current",M=".qor-fieldset--init",w=".qor-fieldset:not(.qor-fieldset--new,.qor-product-init)",C='input[name*="QorResource.Variations"]:visible',j=".qor-field__mediabox-data",E=".qor-product__button-save",x=".qor-product__bulk-save",S=".qor-product__filter-options";return e.prototype={constructor:e,init:function(){var e=this.$element;this.bind(),this.variants={},this.PrimaryInitMetaData={},this.productMetas=[],this.templateData=[],this.primaryMeta=[],this.existVariantsID=[],this.primaryMetaValue=[],this.$tbody=e.find(v),this.$replicatorBtn=e.find(q),this.$fieldBlock=e.find(".qor-product__container>.qor-field__block"),this.BottomSheets=t("body").data("qor.bottomsheets"),this.initMetas(),this.initPrimaryMeta()},bind:function(){a.on(h,this.addVariantReplicator.bind(this)).on(u,this.addVariantReplicators.bind(this)),this.$element.on("select2:select select2:unselect",p,this.selectVariants.bind(this)).on(d,".qor-product__action--edit",this.editVariant.bind(this)).on(d,".qor-product__action--delete",this.deleteVariant.bind(this)).on(d,".qor-product__filter a",this.filterVariant.bind(this)).on(d,".qor-product__filter-actions__edit",this.bulkEditVariants.bind(this)).on(d,".qor-product__filter-actions__delete",this.bulkDeleteVariants.bind(this)).on(d,".qor-product__action--add",this.addBackDeletedVariants.bind(this)).on(d,"label.mdl-checkbox input:checkbox",this.showBulkEditVariantToolbar.bind(this))},unbind:function(){},initMetas:function(){for(var e=this.$element.find(".qor-product__meta"),i=0,a=e.length;a>i;i++)this.productMetas.push(t(e[i]).data("inputName"));this.setTemplate()},collectExistVariantsID:function(){for(var e=this.$tbody.find("tr:not(."+D+")"),i=0,a=e.length;a>i;i++)this.existVariantsID.push(t(e[i]).attr("variants-id"))},initPrimaryMeta:function(){for(var e=this.$element.find(m),i=this.$element.find(M),a={},n=[],r=void 0,o=0,s=e.length;s>o;o++){var d=[],l=t(e[o]).data("variant-type");if(this.primaryMeta.push(l),i.length){for(var c=0,h=i.length;h>c;c++){var u=t(i[c]),f=u.find("[name$="+l+"]").not('[type="hidden"]'),p={},v={};if(f.is("select")&&f.val()){var b=f.find("option").html();p[l]=b,p.id=f.val(),r=this.checkSameObj(n,p),r||(d.push(p),this.primaryMetaValue.push({type:b})),v[l+"_ID"]=p.id,v[l]=p[l],u.data("variants-"+l,v)}n.push(p)}d.length&&(a[l+"s"]=d)}}this.variants=this.PrimaryInitMetaData=a,this.variantsKey=this.collectObjectKeys(),this.handleTemplateData(),this.initPrimarySelector(),this.primaryMetaValue.length&&this.initFilter(),this.setCollectionID(i)},initPrimarySelector:function(){var e=this.PrimaryInitMetaData,i=Object.keys(e);this.ingoreInitChange=!0;for(var a=0,n=i.length;n>a;a++){for(var r=i[a].slice(0,-1),o=t('[data-variant-type="'+r+'"]').find(".qor-field__input-selector"),s=e[i[a]],d=0,l=s.length;l>d;d++)o.append("<option selected value='"+s[d].id+"'>"+s[d][r]+"</option>");o.trigger("change")}this.ingoreInitChange=!1},initFilter:function(){var t=this.primaryMetaValue,i=this.$element.find(S);i.html("");for(var a=0,n=t.length;n>a;a++)i.append(window.Mustache.render(e.TEMPLATE_FILTER,t[a]))},filterVariant:function(e){var i=t(e.target),a=i.data("filter-type"),n=this.$element.find(b),r=n.find(I),o=function(){r.length&&(r.find("label.mdl-checkbox").trigger("click"),n.find("th label.mdl-checkbox").removeClass("is-checked").find(".mdl-checkbox__input").prop("checked",!1))};switch(a){case"all":n.find("th label.mdl-checkbox").trigger("click");break;case"none":o();break;default:o(),this.$tbody.find('tr[variants-id*="_'+this.removeSpace(a)+'_"] label.mdl-checkbox').trigger("click")}n.find("label.mdl-checkbox").removeClass("is-focused"),this.showVariantToolbar()},showBulkEditVariantToolbar:function(){setTimeout(this.showVariantToolbar.bind(this),1)},showVariantToolbar:function(){var t=this.$tbody.find(I),e=this.$element.find(".qor-product__filter-actions"),i=t.length,a=this.$element.find(b).find("th label.mdl-checkbox");i?e.show().find("em").html(i):(e.hide(),a.hasClass("is-checked")&&a.removeClass("is-checked").find(".mdl-checkbox__input").prop("checked",!1))},bulkEditVariants:function(){var e=this.initBulkVariantsForm(),i=this.$tbody.find("tr:first"),a=this.$element.find(".qor-variants__edit"),n=i.find("td").length,r=t('<tr class="qor-variants__edit"><td class="normal" colspan='+n+"></td></tr>"),o='<button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored '+x.replace(".","")+'">\n                                Update\n                            </button>\n                            <button type="button" class="mdl-button mdl-js-button qor-product__bulk-cancel">\n                                Cancel\n                            </button>';return a.length?!1:(i.before(r),void e.appendTo(r.find("td")).show().append(o).trigger("enable").on(d,".qor-product-icon",this.checkBulkEdit.bind(this)).on(d,x,this.saveBulkEdit.bind(this)).on(d,".qor-product__bulk-cancel",this.removeBulkEdit.bind(this)))},checkBulkEdit:function(e){var i=t(e.target).closest(".qor-product-icon");i.toggleClass("selected")},removeBulkEdit:function(){this.$element.find(".qor-variants__edit").remove()},saveBulkEdit:function(){var e=this.$element.find(".qor-product-icon.selected").parent(),i=this.$tbody.find(I),a=[],n=[];return e.length?i.length?(i.each(function(){n.push(t(this).attr("variants-id"))}),e.each(function(){var e=t(this).find(C+","+j),i={};e.length&&(e.is(j)?(i.isImage=!0,i.$element=t(this)):(i.isImage=!1,i.$element=null),i.name=e.prop("name").match(/\.\w+$/g)[0].replace(".",""),i.value=e.val(),a.push(i))}),void this.syncBulkEditValue(a,n)):(window.alert("No variants select!"),!1):(this.$element.find(".qor-variants__edit").remove(),!1)},syncBulkEditValue:function(t,e){for(var i=this.$element,a=0,n=e.length;n>a;a++)for(var r="#"+e[a],o=0,s=t.length;s>o;o++){var d=t[o],l=d.name,c=d.value,h=void 0,u=this.$tbody.find(I+' td[data-variant-type="'+l+'"]');d.isImage&&JSON.parse(c)[0]&&JSON.parse(c)[0].Url?(h=JSON.parse(c)[0].Url,u.html('<img src="'+h+'"/>'),this.bulkAddImages(d.$element,r)):u.html(c),i.find(r+" [name$="+l+"]").not('[type="hidden"]').val(c)}i.find(".qor-variants__edit").remove()},bulkAddImages:function(e,i){if(e){var a=this.$element.find(i),n=a.find(".qor-field__mediabox-list"),r=e.find(j).data("mediaData"),o=window.Mustache.render(e.find('[name="media-box-template"]').html(),r);n.find(".qor-field__mediabox-item").remove(),t(o).appendTo(n).trigger("enable")}},bulkDeleteVariants:function(e){var i=this.$tbody.find(I),a=t(e.target).data("confirm");if(i.length&&a&&window.confirm(a)){for(var n=0,r=i.length;r>n;n++){var o=t(i[n]).attr("variants-id");this.hideRemovedVariants(o)}this.$element.find(".qor-product__filter-actions").hide(),this.showVariantToolbar()}return!1},initBulkVariantsForm:function(){var t=this.primaryMeta,e=this.$element.find(".qor-fieldset--new").clone();t.push("Product");for(var i=0,a=t.length;a>i;i++)e.find("[name$="+t[i]+"]").not('[type="hidden"]').closest(".qor-form-section").remove();return e.find(".qor-form-section .qor-field").prepend('<span class="qor-product-icon"><i class="material-icons normal">panorama_fish_eye</i><i class="material-icons selected">check_circle</i></span>'),e.find(".qor-fieldset__delete").remove(),e.prepend("<h2>Bulk Edit</h2>"),e},addBackDeletedVariants:function(e){var i=t(e.target).closest("tr"),a=i.attr("variants-id");return a?void this.addBackVariants(a):!1},addBackVariants:function(t){var e=this.$tbody.find('tr[variants-id="'+t+'"]'),a=this.$element.find("fieldset#"+t),n=e.hasClass("is_deleted"),r=void 0;e.length&&a.length&&(e.removeClass(k+" "+D+" is_deleted is-selected"),r=this.$tbody.find("tr:not("+$+"):last"),n&&(e.find("label").removeClass("is-disabled").show().find(".mdl-checkbox__input").prop("disabled",!1),e.find(".qor-product__action--add,.qor-product__action").toggle(),r.length?r.after(e):e.appendTo(this.$tbody),this.hiddenVariantsID=i.without(this.hiddenVariantsID,t),a.removeClass(k+" "+D).find(".qor-fieldset__alert").remove()))},setCollectionID:function(e){for(var a=this.primaryMeta,n=[],r=0,o=e.length;o>r;r++){for(var s=t(e[r]),d={},l=void 0,c=void 0,h=0,u=a.length;u>h;h++){var f=s.data("variants-"+a[h]);f&&(d=Object.assign({},d,f))}l=i.values(d).map(this.removeSpace).sort(),c=""+V+l.join("_")+"_",d.variantID=c,s.attr("id",c),n.push(d)}this.setTableID(n)},setTableID:function(e){for(var a=this.primaryMeta,n=this.$element.find(_),r=void 0,o=0,s=n.length;s>o;o++){for(var d={},l=t(n[o]),c=0,h=a.length;h>c;c++){var u=a[c],f={},p=l.find('[data-variant-type="'+u+'"]').text();p&&(f[u]=p,d=Object.assign({},d,f))}r=i.where(e,d),r.length&&l.attr("variants-id",r[0].variantID)}},removeSpace:function(t){return t.toString().replace(/\s/g,"")},checkSameObj:function(t,e){var a=void 0;return a=t.some(function(t){return i.isEqual(t,e)})},collectObjectKeys:function(t){var e=[],i=t||this.variants;return e=Object.keys(i).filter(function(t){return i[t].length>0})},setTemplate:function(){var t=this.productMetas,e="<tr variants-id=[[variantID]]>",a='<td>\n                                <button type="button" class="mdl-button mdl-js-button qor-product__action--add" style="display: none;">\n                                    Add\n                                </button>\n                                <button type="button" id="qor-product-actions-for-[[variantID]]" class="mdl-button mdl-js-button mdl-button--icon qor-product__action">\n                                    <i class="material-icons">more_vert</i>\n                                </button>\n                                <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu" for="qor-product-actions-for-[[variantID]]">\n                                    <li class="mdl-menu__item" qor-icon-name="Edit">\n                                        <a href="javascript://" class="qor-product__action--edit">Edit</a>\n                                    </li>\n                                    <li class="mdl-menu__item" qor-icon-name="Delete">\n                                        <a href="javascript://" class="qor-product__action--delete">Delete</a>\n                                    </li>\n                                </ul>\n                            </td></tr>';i.each(t,function(t){e=e+"<td data-variant-type="+t+' class="mdl-data-table__cell--non-numeric">[['+t+"]]</td>"}),this.template=""+e+a},deleteVariant:function(e){var i=t(e.target).closest("tr").attr("variants-id"),a=t(e.target).data("confirm");return a&&window.confirm(a)?(this.hideRemovedVariants(i),void this.showVariantToolbar()):!1},editVariant:function(e){var i=t(e.target).closest("tr"),a=i.find("td").length,n=i.attr("variants-id"),r=void 0,o=t('<tr class="qor-variant__edit"><td class="normal" colspan='+a+"></td></tr>"),s='<button type="button" class="mdl-button mdl-js-button mdl-button--raised '+E.replace(".","")+'">OK</button>';return i.next("tr.qor-variant__edit").length?!1:n?(r=t("#"+n),i.addClass(T).after(o),r.appendTo(o.find("td")).find(E).remove().end().append(s).show().removeClass("hidden").on(l,C,this.syncCollectionToVariant.bind(this)).on(d,E,this.saveCollevtionEdit.bind(this)).on(c,j,this.syncCollectionToVariant.bind(this)),void this.hidePrimaryMeta(r)):!1},hidePrimaryMeta:function(t){for(var e=this.primaryMeta,i=0,a=e.length;a>i;i++)t.find("[name$="+e[i]+"]").not('[type="hidden"]').closest(".qor-form-section").hide()},syncCollectionToVariant:function(e){var i=t(e.target),a=i.val(),n=i.closest(y).attr("id"),r=t('tr[variants-id="'+n+'"]'),o=i.prop("name").match(/\.\w+$/g)[0].replace(".",""),s=void 0,d=void 0;s=r.find('[data-variant-type="'+o+'"]'),i.is("textarea")?(d=JSON.parse(a)[0].Url,s.html('<img src="'+d+'"/>')):s.html(a)},saveCollevtionEdit:function(e){var i=t(e.target),a=i.closest(y),n=a.closest("tr");n.prev().removeClass(T).end().remove(),a.appendTo(this.$fieldBlock).off(l,C,this.syncCollectionToVariant.bind(this)).off(d,E,this.saveCollevtionEdit.bind(this)).off(c,j,this.syncCollectionToVariant.bind(this)).hide()},selectVariants:function(e){var i=t(e.target).closest(m),a=i.data("variant-type"),n=e.params.data,r=n.selected,o=n.text||n.title||n.Name,s=n.id,d=a+"s",l=!i.find(".select2-selection__choice").length;return this.ingoreInitChange?!1:(this.variants[d]=this.variants[d]||[],r?this.doSelelct(o,d,a,s):this.doUnselelct(o,d,a,s,l),void this.initFilter())},doUnselelct:function(t,e,a,n,r){this.variants[e]=this.variants[e].filter(function(e){return e[a]!=t}),this.removeVariants(t,n,a),r?this.renderVariants():this.handleTemplateData(),this.primaryMetaValue=i.reject(this.primaryMetaValue,function(e){return i.isEqual(e,{type:t})})},doSelelct:function(t,e,i,a){var n={};n[i]=t,n.id=a.toString(),this.variants[e].push(n),this.renderVariants(),this.primaryMetaValue.push({type:t})},removeVariants:function(t,e,a){var n=this.templateData,r={};r[a]=t,r[a+"s_ID"]=e;for(var o=0,s=n.length;s>o;o++){var d=n[o];i.isMatch(d,r)&&this.hideRemovedVariants(d.variantID)}this.showVariantToolbar()},hideRemovedVariants:function(t){var e=this.$tbody.find('tr[variants-id="'+t+'"]'),i=this.$tbody.find(".qor-variant__edit"),a=this.$element.find("fieldset#"+t);e.length&&a.length&&!e.hasClass("is_deleted")&&(this.hiddenVariantsID=this.hiddenVariantsID||[],this.hiddenVariantsID.push(t),i.length&&(this.$element.find(".qor-fieldset--new").before(i.find(".qor-fieldset")),i.remove()),e.addClass(D+" is_deleted").removeClass("is-selected").find(".qor-product__action--add,.qor-product__action").toggle(),e.find("label").removeClass("is-checked").addClass("is-disabled").hide().find(".mdl-checkbox__input").prop({checked:!1,disabled:!0}),e.appendTo(this.$tbody),a.addClass(D).find(".qor-fieldset__alert").remove().end().find(".qor-fieldset__delete").trigger("click").hide())},renderVariants:function(){var t=void 0;return t=this.collectObjectKeys(),0===t.length?void this.$tbody.find("tr:not(.qor-product-init)").hide():(this.variantsKey=t,void this.convertVariantsData())},convertVariantsData:function(){this.handleTemplateData(),this.renderVariantsTable()},handleTemplateData:function(){var t=[],e=this.variantsKey,a=this.variants;if(this.templateData=[],i.each(e,function(e){t.push(a[e].length)}),1===e.length)for(var n=a[e[0]],r=0,o=n.length;o>r;r++){var s=n[r],d=i.keys(s)[0],l=s[d],c=void 0,h={};h[d]=l,h.id=s.id,c=i.values(h).map(this.removeSpace).sort(),h.variantID=""+V+c.join("_")+"_",this.templateData.push(h)}else this.handleMultipleVariantsData(t,this.generateData.bind(this))},renderVariantsTable:function(){var t=this.$element.find(b),e=void 0;t.removeClass("is-upgraded").removeAttr("data-upgraded").find("tr td:first-child,tr th:first-child").remove(),e=this.checkTemplateData().newObjs,t.trigger("enable").find(".is_deleted label.mdl-checkbox").hide(),e.length&&this.doReplicator(e)},doReplicator:function(t){var e=this,i=this.$element;this.replicator=this.replicator||i.find(g).data(r),setTimeout(function(){e.replicator.addReplicators(t,e.$replicatorBtn)},100),this.$element.find("."+k+w+" .qor-fieldset__delete").trigger("click").hide()},checkTemplateData:function(){var t=this.templateData,e=this.hiddenVariantsID||[],a=[],n=[];this.collectExistVariantsID(),this.$element.find(w+","+_+":not(.qor-product-init)").addClass(k);for(var r=0,o=t.length;o>r;r++){var s=t[r],d=void 0,l=void 0,c=s.variantID;e.length&&(d=i.contains(e,c)),this.existVariantsID.length&&(l=i.contains(this.existVariantsID,c)),d||l?(n.push(s),this.addBackVariants(c)):(this.$tbody.prepend(window.Mustache.render(this.template,s)),a.push(s))}return{oldObjs:n,newObjs:a}},generateData:function(t){for(var e=this.variantsKey,a=this.variants,n=void 0,r={},o=0,s=t.length;s>o;o++){var d=a[e[o]][t[o]];r[e[o]+"_ID"]=d.id,r=Object.assign({},r,d)}delete r.id,n=i.values(r).map(this.removeSpace).sort(),r.variantID=""+V+n.join("_")+"_",this.templateData.push(r)},handleMultipleVariantsData:function(t,e){this.convertMultipleVariantsData(t,e,[],0)},convertMultipleVariantsData:function(t,e,i,a){if(0==t.length)e(i);else{var n=t.slice(1);for(i[a]=0;i[a]<t[0];++i[a])this.convertMultipleVariantsData(n,e,i,a+1)}},addLoading:function(){t(".qor-product__loading").remove();var i=t(e.TEMPLATE_LOADING);i.appendTo(t(f)).trigger("enable")},addVariantReplicator:function(t,e,i){e.closest(".qor-product__container").length&&(e.attr({"variant-data":JSON.stringify(i),id:i.variantID}).hide(),this.syncReplicatorData(e,i))},addVariantReplicators:function(){t(".qor-product__loading").remove()},syncReplicatorData:function(t,e){for(var i=Object.keys(e),a=0,n=i.length;n>a;a++){var r=t.find("[name$="+i[a]+"]").not('[type="hidden"]'),o=void 0;r.length&&r.is("select")&&r.data("remote-data")&&(o=i[a]+"s_ID",r.append("<option selected value='"+(e.id||e[o])+"'>"+e[i[a]]+"</option>").trigger("change"))}},destroy:function(){this.unbind(),this.$element.removeData(n)}},e.TEMPLATE_FILTER='<li><a href="javascript://" data-filter-type="[[type]]">[[type]]</a></li>',e.TEMPLATE_LOADING='<div class="qor-product__loading">\n            <div><div class="mdl-spinner mdl-js-spinner is-active qor-layout__bottomsheet-spinner"></div></div>\n        </div>',e.plugin=function(i){return this.each(function(){var a=t(this),r=a.data(n),o=void 0;if(!r){if(/destroy/.test(i))return;a.data(n,r=new e(this,i))}"string"==typeof i&&t.isFunction(o=r[i])&&o.apply(r)})},t(function(){var i='[data-toggle="qor.product.variants"]';t(document).on(s,function(a){e.plugin.call(t(i,a.target),"destroy")}).on(o,function(a){e.plugin.call(t(i,a.target))}).triggerHandler(o)}),e});