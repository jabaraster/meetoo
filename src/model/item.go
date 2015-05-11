package model

import (
    "time"
    "fmt"

    "github.com/vincent-petithory/dataurl"
)

type Item struct {
    Id   int64  `db:"pk" json:"id"`
    Name string `db:"unique" json:"name"`
    UnitPrice *int32 `json:"unitPrice"`
    Description *string `json:"description"`
    CategoryId *int64 `json:"categoryId"`
    Created time.Time `json:"created"`
    Updated time.Time `json:"updated"`
}
type ItemImage struct {
    ItemId int64
    ContentType string
    Data []byte
    Created time.Time `json:"created"`
}
type ItemBelongHall struct {
    ItemId int64
    HallId int64
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

func (e *ItemImage) setCreatedAt(t time.Time) {
    e.Created = t
}
func (e *ItemImage) setUpdatedAt(t time.Time) {
    // nop
}
func (e *ItemImage) BeforeInsert() error {
    return beforeInsertCore(e)
}
func (e *ItemImage) BeforeUpdate() error {
    // nop
    return nil
}

func GetItems(hallId *int64, categoryIds []int64) []Item {
    if (hallId == nil) && (len(categoryIds) == 0) {
        return GetAllItems()
    }

    if hallId == nil {
        var items []Item
        if err := db.Select(&items, getInWhereInt("category_id",categoryIds)); err != nil {
            panic(err)
        }
        return items
    }

    belongItemIds := getHallBelongItemIds(*hallId)
    var items []Item
    if err := db.Select(&items, getInWhereInt("category_id",categoryIds).And(getInWhereInt("id",belongItemIds))); err != nil {
        panic(err)
    }
    return items
}

func GetAllItems() []Item {
    var item []Item
    if err := db.Select(&item); err != nil {
        panic(err)
    }
    return item
}

func GetItemImageByItemId(itemId int64) (*ItemImage, NotFound) {
    var result []ItemImage
    if err := db.Select(&result, db.Where("item_id","=",itemId)); err != nil {
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

func GetItemImagesByItems(items []Item) []ItemImage {
    if len(items) == 0 {
        return []ItemImage{}
    }
    w := db.Where("item_id","=",items[0].Id)
    for idx, item := range items {
        if idx == 0 {
            continue;
        }
        w = w.Or(db.Where("item_id","=",item.Id))
    }
    var result []ItemImage
    if err := db.Select(&result, w); err != nil {
        panic(err)
    }

    return result
}

func GetBelongHallByItemId(itemId int64) ([]ItemBelongHall, NotFound) {
    var result []ItemBelongHall
    if err := db.Select(&result, db.Where("item_id","=",itemId)); err != nil {
        panic(err)
    }
    if len(result) == 0 {
        return nil, NewNotFound()
    }
    return result, nil
}

func InsertItem(name string, unitPrice *int32, categoryId *int64, belongHallIds []int64, description *string, imageDataUrl *string) Duplicate {
    if !checkNameDuplicateForInsert(&Item{}, name) {
        return NewDuplicate("name", name)
    }

//    defer tx()
//    beginTx();

    item := Item {
        Name: name,
        UnitPrice: unitPrice,
        CategoryId: categoryId,
        Description: description,
    }
    if _, err := db.Insert(&item); err != nil {
        panic(err)
    }

    // SELECT last_insert_rowid()が期待する値を返さないため
    // item.Idに不正な値が格納されてしまっている.
    // このためこの後のINSERTが不正なデータ登録となってしまう.
    // 原因が分からず根本解決策が見出だせないため、
    // 場当たり対応としてDBからデータを引いてくるようにする.
    // tx()がうまく動かないのと関係ありそうなのだが・・・
    i := getItemByName(name)
    item.Id = i.Id

    insertItemImage(item.Id, imageDataUrl)
    insertBelongHallIds(item.Id, belongHallIds)

    return nil
}

func UpdateItem(itemId int64, name string, unitPrice *int32, categoryId *int64, belongHallIds []int64, description *string, imageDataUrl *string) (Duplicate, NotFound) {
    if !checkNameDuplicateForUpdate(&Item{}, itemId, name) {
        return NewDuplicate("name", name), nil
    }

//    defer tx()
//    beginTx();

    item, notFound := GetItemById(itemId)
    if notFound != nil {
        return nil, notFound
    }
    item.Name = name
    item.UnitPrice = unitPrice
    item.CategoryId = categoryId
    item.Description = description
    if _, err := db.Update(item); err != nil {
        panic(err)
    }

    if (*imageDataUrl) != "noop" {
        removeItemImageByItemId(itemId)
        insertItemImage(itemId, imageDataUrl)
    }
    removeBelongHallIdsByItemId(itemId)
    insertBelongHallIds(itemId, belongHallIds)

    return nil, nil
}

func CountAllItemImages() int64 {
    var c int64
    if err := db.Select(&c, db.Count(), db.From(&ItemImage{})); err != nil {
        panic(err)
    }
    return c
}

func GetItemById(itemId int64) (*Item, NotFound) {
    var result []Item
    if err := db.Select(&result, db.Where("id","=",itemId)); err != nil {
        panic(err)
    }
    switch (len(result)) {
    case 0:
        return nil, NewNotFound()
    case 1:
        return &result[0], nil
    }
    panic(result)
}

func RemoveItemById(itemId int64) {
    removeItemImageByItemId(itemId)
    removeBelongHallIdsByItemId(itemId)
    if _, err := db.Delete(&Item{ Id: itemId }); err != nil {
        fmt.Println(err)
    }
}

func getItemByName(name string) *Item {
    var result []Item
    if err := db.Select(&result, db.Where("name","=",name)); err != nil {
        panic(err)
    }
    switch (len(result)) {
    case 0:
        return nil
    case 1:
        return &result[0]
    }
    panic(result)
}

func createItemTables() {
    createTable(&Item{})
    createTable(&ItemImage{})
    createTable(&ItemBelongHall{})
}

func removeItemImageByItemId(itemId int64) {
    if _, err := db.DB().Exec("delete from item_image where item_id = ?", itemId); err != nil {
        panic(err)
    }
}

func removeBelongHallIdsByItemId(itemId int64) {
    if _, err := db.DB().Exec("delete from item_belong_hall where item_id = ?", itemId); err != nil {
        panic(err)
    }
}

func insertItemImage(itemId int64, imageDataUrl *string) {
    if imageDataUrl == nil {
        return
    }
    var dataUrl = *imageDataUrl
    if len(dataUrl) == 0 {
        return
    }

    url, urlErr := dataurl.DecodeString(dataUrl)
    if urlErr != nil {
        return
    }

    itemImage := ItemImage {
        ItemId: itemId,
        ContentType: url.ContentType(),
        Data: url.Data,
    }
    if _, err := db.Insert(&itemImage); err != nil {
        panic(err)
    }
}

func insertBelongHallIds(itemId int64, belongHallIds []int64) {
    if _, err := db.DB().Exec("delete from item_belong_hall where item_id = ?", itemId); err != nil {
        panic(err)
    }

    ins := make([]ItemBelongHall, len(belongHallIds))
    for idx, belongHallId := range belongHallIds {
        ins[idx] = ItemBelongHall{ ItemId: itemId, HallId: belongHallId }
    }
    if _, err := db.Insert(ins); err != nil {
        panic(err)
    }
}

func getHallBelongItemIds(hallId int64) []int64 {
    var result []ItemBelongHall
    if err := db.Select(&result, db.Where("hall_id","=",hallId)); err != nil {
        panic(err)
    }
    ret := make([]int64, len(result))
    for idx, itemBelongHall := range result {
        ret[idx] = itemBelongHall.ItemId
    }
    return ret
}
