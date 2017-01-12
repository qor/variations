package product

import (
	"errors"

	"github.com/qor/admin"
	"github.com/qor/qor/resource"
	"github.com/qor/qor/utils"
)

func init() {
	admin.RegisterViewPath("github.com/qor/product/views")
}

type VariationsConfig struct {
	Resource     *admin.Resource
	PrimaryAttrs []string // primary attrs should in EditAttrs of the variation resource
	EditAttrs    []string // edit attrs should in EditAttrs of the variation resource
}

func (variationsConfig VariationsConfig) PrimaryAttributeMetas() (metas []*admin.Meta) {
	for _, name := range variationsConfig.PrimaryAttrs {
		metas = append(metas, variationsConfig.Resource.GetMeta(name))
	}
	return
}

func (variationsConfig VariationsConfig) EditMetas() (metas []*admin.Meta) {
	for _, name := range variationsConfig.EditAttrs {
		metas = append(metas, variationsConfig.Resource.GetMeta(name))
	}
	return
}

func (variationsConfig *VariationsConfig) GetTemplate(context *admin.Context, metaType string) ([]byte, error) {
	return nil, errors.New("not implemented")
}

func (variationsConfig *VariationsConfig) ConfigureQorMeta(metaor resource.Metaor) {
	if meta, ok := metaor.(*admin.Meta); ok {
		meta.Type = "variations"

		variationsRes := meta.Resource
		variationsConfig.Resource = variationsRes
		definedPrimaryAttrs := len(variationsConfig.PrimaryAttrs) > 0
		definedEditAttrs := len(variationsConfig.EditAttrs) > 0

		for _, meta := range variationsRes.ConvertSectionToMetas(meta.Resource.EditAttrs()) {
			tagSettings := utils.ParseTagOption(meta.FieldStruct.Tag.Get("variations"))
			isPrimaryAttrs := false

			if !definedPrimaryAttrs {
				if _, ok := tagSettings["PRIMARY"]; ok {
					variationsConfig.PrimaryAttrs = append(variationsConfig.PrimaryAttrs, meta.Name)
					isPrimaryAttrs = true
				}
			} else {
				for _, attr := range variationsConfig.PrimaryAttrs {
					if meta.Name == attr {
						isPrimaryAttrs = true
						break
					}
				}
			}

			if !isPrimaryAttrs && !definedEditAttrs {
				variationsConfig.EditAttrs = append(variationsConfig.EditAttrs, meta.Name)
			}
		}
	}
}
