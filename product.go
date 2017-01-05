package product

import (
	"errors"

	"github.com/qor/admin"
	"github.com/qor/qor/resource"
)

func init() {
	admin.RegisterViewPath("github.com/qor/product/views")
}

type VariationsConfig struct {
}

func (variationsConfig *VariationsConfig) GetTemplate(context *admin.Context, metaType string) ([]byte, error) {
	return nil, errors.New("not implemented")
}

func (variationsConfig *VariationsConfig) ConfigureQorMeta(metaor resource.Metaor) {
	if meta, ok := metaor.(*admin.Meta); ok {
		meta.Type = "product_variations"
	}
}
