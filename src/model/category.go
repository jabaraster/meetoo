package model

import (
    "time"
)

type Category struct {
    Id   int64  `db:"pk" json:"id"`
    Descriptor string `db:"unique" json:"descriptor"`
    Name string `db:"unique" json:"name"`
    Icon string `json:"icon"`
    Created time.Time `json:"created"`
    Updated time.Time `json:"updated"`
}

func (e *Category) setCreatedAt(t time.Time) {
    e.Created = t
}
func (e *Category) setUpdatedAt(t time.Time) {
    e.Updated = t
}
func (e *Category) BeforeInsert() error {
    return beforeInsertCore(e)
}
func (e *Category) BeforeUpdate() error {
    return beforeUpdateCore(e)
}

func InsertCategory(descriptor string, name string, icon string) Duplicate {
    if !checkCategoryDuplicateForInsert(descriptor, name) {
        return NewDuplicate("Name", name)
    }
    var ret = Category{ Descriptor: descriptor, Name: name, Icon: icon }
    if _, err := db.Insert(&ret); err != nil {
        panic(err)
    }
    return nil
}

func UpdateCategory(categoryId int64, descriptor string, name string, icon string) (Duplicate, NotFound) {
    if !checkCategoryDuplicateForUpdate(categoryId, descriptor, name) {
        return NewDuplicate("Name", name), nil
    }
    category, notFound := GetCategoryById(categoryId)
    if notFound != nil {
        return nil, notFound
    }
    category.Descriptor = descriptor
    category.Name = name
    category.Icon = icon
    if _, err := db.Update(category); err != nil {
        panic(err)
    }
    return nil, nil
}

func GetAllCategories() []Category {
    var result []Category
    if err := db.Select(&result); err != nil {
        panic(err)
    }
    return result
}

func GetCategoryById(categoryId int64) (*Category, NotFound) {
    var result []Category
    if err := db.Select(&result, db.Where("id","=",categoryId)); err != nil {
        panic(err)
    }
    switch len(result) {
    case 0:
        return nil, NewNotFound()
    case 1:
        return &result[0], nil
    }
    panic(result)
}

func RemoveCategoryById(hallId int64) {
    if _, err := db.Delete(&Category{Id:hallId}); err != nil {
        panic(err)
    }
}

func checkCategoryDuplicateForInsert(descriptor string, name string) bool {
    var c int64
    w := db.Where("descriptor","=",descriptor)
    w = w.Or(db.Where("name","=",name))
    if err := db.Select(&c, db.Count(), db.From(&Category{}), w); err != nil {
        panic(err)
    }
    return c == 0
}

func checkCategoryDuplicateForUpdate(updateTargetId int64, descriptor string, name string) bool {
    var c int64
    w := db.Where(db.Where("id","<>",updateTargetId))
    w = w.And(db.Where("descriptor","=",descriptor).Or(db.Where("name","=",name)))
    if err := db.Select(&c, db.Count(), db.From(&Category{}), w); err != nil {
        panic(err)
    }
    return c == 0
}
