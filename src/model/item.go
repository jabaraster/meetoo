package model

import (
    "time"
)

type Item struct {
    Id   int64  `db:"pk" json:"id"`
    Name string `db:"unique" json:"name"`
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

func InsertItem(name string, description string, imageDataUrl string) {
    if _, err := db.Insert(&Item{ Name: name, Description: &description, Url: &imageDataUrl }); err != nil {
        panic(err)
    }
}

func UpdateItem(itemId string, name string, description string, imageDataUrl string) {
}
