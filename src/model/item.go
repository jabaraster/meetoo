package model

import (
    "time"
)

type Item struct {
    Id   int64  `db:"pk" json:"id"`
    Name string `db:"unique" json:"name"`
    Description string `json:"Description"`
    Url string `json:"url"`
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

func GetAllItems() {
    var item []Item
    if err := db.Select(&item); err != nil {
        panic(err)
    }
    return item
}

// func TryLogin(familyName string, password string) bool {
//     var family []Item
//     if err := db.Select(&family, db.Where("name", "=", familyName).And(db.Where("password", "=", password))); err != nil {
//         panic(err)
//     }
//     return len(family) == 1
// }
