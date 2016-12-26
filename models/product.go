package models

import "github.com/qor/media_library/aws"

type Product struct {
	Code          string `gorm:"primary_key;size:128"`
	Name          string `gorm:"size:255"`
	EnglishName   string `gorm:"size:255"`
	Description   string `gorm:"type:text"`
	MadeCountry   string `gorm:"size:40"`
	Weight        string
	KeyProperties []Property // color, size , material
	Variants      []Variant
	Images        []Image
	Price         uint64
	SellingPrice  uint64
}

type Variant struct {
	ArticleCode   string `gorm:"primary_key;size:128"` // SKU ID, JAN Code, https://en.wikipedia.org/wiki/International_Article_Number
	ProductCode   string `gorm:"size:128;index:idx_product_code"`
	KeyProperties []Property
	Images        []Image
	Price         uint64
	SellingPrice  uint64
}

type Image struct {
	ProductCode string `gorm:"size:128;index:idx_product_code"`
	ArticleCode string `gorm:"size:128;index:idx_article_code"`
	Field       string // front, back, side, zoom etc
	Thumb       string // zoom, medium, list_thumb, color_thumb etc
	Image       aws.S3
}

type Property struct {
	ProductCode string `gorm:"size:128;index:idx_product_code"`
	ArticleCode string `gorm:"size:128;index:idx_article_code"`
	Name        string
	Value       string
}
