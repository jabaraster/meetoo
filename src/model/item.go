package model

import (
    "time"
    "fmt"
)

type Item struct {
    Id   int64  `db:"pk" json:"id"`
    Name string `db:"unique" json:"name"`
    UnitPrice *int32 `json:"unitPrice"`
    Description *string `json:"description"`
    Url *string `json:"url"`
    Created time.Time `json:"created"`
    Updated time.Time `json:"updated"`
}

func (e *Item) setCreatedAt(t time.Time) {
    e.Created = t
}

func (e *Item) setUpdatedAt(t time.Time) {
    e.Updated = t
}

func (e *Item) BeforeInsert() error {
    return beforeInsertCore(e)
}

func (e *Item) BeforeUpdate() error {
    return beforeUpdateCore(e)
}

func GetAllItems() []Item {
    var item []Item
    if err := db.Select(&item); err != nil {
        panic(err)
    }
    return item
}

func InsertItem(name string, unitPrice *int32, description *string, imageDataUrl *string) (*Item, *DuplicateError) {
    if !checkNameDuplicateForInsert(name) {
        return nil, NewDuplicateError("name", name)
    }
    item := Item{
        Name: name,
        UnitPrice: unitPrice,
        Description: description,
        Url: imageDataUrl,
    }
    if _, err := db.Insert(&item); err != nil {
        panic(err)
    }
    return &item, nil
}

func UpdateItem(itemId int64, name string, unitPrice *int32, description *string, imageDataUrl *string) (*Item, *DuplicateError) {
    if !checkNameDuplicateForUpdate(name, itemId) {
        return nil, NewDuplicateError("name", name)
    }
    item := GetItemById(itemId)
    item.Name = name
    item.UnitPrice = unitPrice
    item.Description = description
    item.Url = imageDataUrl // TODO バイナリにしてURLを発行するように修正
    if _, err := db.Update(&item); err != nil {
        panic(err)
    }
    return item, nil
}

func GetItemById(itemId int64) *Item {
    var result []Item
    if err := db.Select(&result, db.Where("id", "=", itemId)); err != nil {
        panic(err)
    }
    switch (len(result)) {
    case 0:
        return nil
    case 1:
        return &result[0]
    }
    panic(itemId)
}

func RemoveItemById(itemId int64) {
    if _, err := db.Delete(&Item{ Id: itemId }); err != nil {
        fmt.Println(err)
    }
}

func checkNameDuplicateForInsert(name string) bool {
    var c int64
    if err := db.Select(&c, db.Count(), db.From(&Item{}), db.Where("name","=",name)); err != nil {
        panic(err)
    }
    return c == 0
}

func checkNameDuplicateForUpdate(name string, itemId int64) bool {
    var c int64
    if err := db.Select(&c, db.Count(), db.From(&Item{}), db.Where("name","=",name).And(db.Where("id","<>",itemId))); err != nil {
        panic(err)
    }
    return c == 0
}
