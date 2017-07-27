package product

import "testing"
import "github.com/jinzhu/gorm"
import m "github.com/qor/product/models"
import _ "github.com/jinzhu/gorm/dialects/mysql"

var db *gorm.DB

func setup() {
	var err error
	db, err = gorm.Open("mysql", "root:@/qor_products?charset=utf8&parseTime=True&loc=Local")
	db.LogMode(true)
	if err != nil {
		panic(err)
	}
	db.AutoMigrate(
		&m.Product{},
		&m.Variant{},
		&m.Image{},
		&m.Property{},
	)

}

func TestModels(t *testing.T) {
	setup()
	err := db.Save(&m.Product{Code: "HX123", Name: "The Product"}).Error
	if err != nil {
		t.Error(err)
	}

	var p m.Product
	err = db.Preload("Variants").
		Preload("Images").
		Preload("KeyProperties").
		Find(&p, m.Product{Code: "HX123"}).Error
	if err != nil {
		t.Error(err)
	}
	if p.Name != "The Product" {
		t.Error(p)
	}
}
