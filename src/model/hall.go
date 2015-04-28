package model

import (
    "time"
)

type Hall struct {
    Id   int64  `db:"pk" json:"id"`
    Descriptor string `db:"unique" json:"descriptor"`
    Name string `db:"unique" json:"name"`
    Icon string `json:"icon"`
    Created time.Time `json:"created"`
    Updated time.Time `json:"updated"`
}

func (e *Hall) setCreatedAt(t time.Time) {
    e.Created = t
}
func (e *Hall) setUpdatedAt(t time.Time) {
    e.Updated = t
}
func (e *Hall) BeforeInsert() error {
    return beforeInsertCore(e)
}
func (e *Hall) BeforeUpdate() error {
    return beforeUpdateCore(e)
}

func InsertHall(descriptor string, name string, icon string) Duplicate {
    if !checkHallDuplicateForInsert(descriptor, name) {
        return NewDuplicate("Name", name)
    }
    var ret = Hall{ Descriptor: descriptor, Name: name, Icon: icon }
    if _, err := db.Insert(&ret); err != nil {
        panic(err)
    }
    return nil
}

func UpdateHall(categoryId int64, descriptor string, name string, icon string) (Duplicate, NotFound) {
    if !checkHallDuplicateForUpdate(categoryId, descriptor, name) {
        return NewDuplicate("Name", name), nil
    }
    hall, notFound := GetHallById(categoryId)
    if notFound != nil {
        return nil, notFound
    }
    hall.Descriptor = descriptor
    hall.Name = name
    hall.Icon = icon
    if _, err := db.Update(hall); err != nil {
        panic(err)
    }
    return nil, nil
}

func GetAllHalls() []Hall {
    var result []Hall
    if err := db.Select(&result); err != nil {
        panic(err)
    }
    return result
}

func GetHallById(hallId int64) (*Hall, NotFound) {
    var result []Hall
    if err := db.Select(&result, db.Where("id","=",hallId)); err != nil {
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

func RemoveHallById(hallId int64) {
    if _, err := db.Delete(&Hall{Id:hallId}); err != nil {
        panic(err)
    }
}

func checkHallDuplicateForInsert(descriptor string, name string) bool {
    var c int64
    w := db.Where("descriptor","=",descriptor)
    w = w.Or(db.Where("name","=",name))
    if err := db.Select(&c, db.Count(), db.From(&Hall{}), w); err != nil {
        panic(err)
    }
    return c == 0
}

func checkHallDuplicateForUpdate(updateTargetId int64, descriptor string, name string) bool {
    var c int64
    w := db.Where(db.Where("id","<>",updateTargetId))
    w = w.And(db.Where("descriptor","=",descriptor).Or(db.Where("name","=",name)))
    if err := db.Select(&c, db.Count(), db.From(&Hall{}), w); err != nil {
        panic(err)
    }
    return c == 0
}
