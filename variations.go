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
	PrimaryAttributeMetas []*admin.Meta
}

func (variationsConfig *VariationsConfig) GetTemplate(context *admin.Context, metaType string) ([]byte, error) {
	return nil, errors.New("not implemented")
}

func (variationsConfig *VariationsConfig) ConfigureQorMeta(metaor resource.Metaor) {
	if meta, ok := metaor.(*admin.Meta); ok {
		meta.Type = "product_variations"

		variationsRes := meta.Resource
		for _, meta := range variationsRes.ConvertSectionToMetas(meta.Resource.EditAttrs()) {
			tagSettings := utils.ParseTagOption(meta.FieldStruct.Tag.Get("variations"))
			if _, ok := tagSettings["PRIMARY"]; ok {
				variationsConfig.PrimaryAttributeMetas = append(variationsConfig.PrimaryAttributeMetas, meta)
			}
		}
	}
}
