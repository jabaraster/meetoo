package handler

import (
    "strconv"
    "time"
    "strings"
    "net/http"

    "github.com/zenazn/goji/web"

    "../assets"
    "../model"
    "../webutil"
    "../util"
)

func findImage(item model.Item, images []model.ItemImage) *model.ItemImage {
    for _, image := range images {
        if item.Id == image.ItemId {
            return &image
        }
    }
    return nil
}

func GetAllItems(w http.ResponseWriter, r *http.Request) {
    items := model.GetAllItems()
    images := model.GetItemImagesByItems(items)
    var res []map[string]interface{}
    for _, item := range items {
        image := findImage(item, images)
        var imageTimestamp *int64
        if image == nil {
            imageTimestamp = nil
        } else {
            base := time.Date(1900, time.January, 1, 0, 0, 0, 0, time.UTC)
            i := image.Created.Sub(base).Nanoseconds()
            imageTimestamp = &i
        }
        res = append(res, map[string]interface{}{
            "id": item.Id,
            "name": item.Name,
            "unitPrice": item.UnitPrice,
            "description": item.Description,
            "imageTimestamp": imageTimestamp,
        });
    }

    if len(res) == 0 {
        webutil.WriteJsonResponse(w, []interface{}{})
    } else {
        webutil.WriteJsonResponse(w, res)
    }
}

func GetItemById(c web.C, w http.ResponseWriter, r *http.Request) {
    itemIdStr := c.URLParams["itemId"]
    if len(itemIdStr) == 0 {
        http.NotFound(w, r)
        return
    }

    var itemId int64
    var cnvErr error
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 64)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }

    item, notFound := model.GetItemById(itemId)
    if notFound != nil {
        http.NotFound(w, r)
        return
    }

    webutil.WriteJsonResponse(w, item)
}

func GetItemImageByItemId(c web.C, w http.ResponseWriter, r *http.Request) {
    itemIdWithTimestamp := c.URLParams["itemIdWithTimestamp"]

    tokens := strings.Split(itemIdWithTimestamp, "___")
    if len(tokens) < 1 {
        http.NotFound(w, r)
        return
    }
    itemIdStr := tokens[0]

    var itemId int64
    var cnvErr error
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 32)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }

    image, notFound := model.GetItemImageByItemId(itemId)
    if notFound != nil {
        unsetImageData, err := assets.GetData("img/unset.png")
        if err == nil {
            w.Header().Add("content-type", "image/png")
            w.Write(unsetImageData)
        }
        return
    }
    w.Header().Add("content-type", image.ContentType)
    w.Write(image.Data)
}

func RemoveItem(c web.C, w http.ResponseWriter, r *http.Request) {
    itemId, err := strconv.ParseInt(c.URLParams["itemId"], 10, 32)
    if err != nil {
        http.NotFound(w, r)
        return
    }
    model.RemoveItemById(itemId)
    http.Error(w, "no content", http.StatusNoContent) // エラーというわけではないが、他に適切な関数がなさそう
}

func InsertItem(w http.ResponseWriter, r *http.Request) {
    unitPriceStr := r.FormValue("unitPrice")
    var cnvErr error
    var unitPrice *int32
    unitPrice, cnvErr = util.Atoi32(unitPriceStr)
    if cnvErr != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "単価が不正です。" });
        return
    }

    name := r.FormValue("name")
    desc := r.FormValue("description")
    imageDataUrl := r.FormValue("imageDataUrl")

    duplicated := model.InsertItem(name, unitPrice, &desc, &imageDataUrl)
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "アイテム名が重複しています。" });
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT" });
}

func UpdateItem(c web.C, w http.ResponseWriter, r *http.Request) {

    var cnvErr error

    itemIdStr := c.URLParams["itemId"]
    var itemId int64
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 32)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }


    unitPriceStr := r.FormValue("unitPrice")
    var unitPrice *int32
    unitPrice, cnvErr = util.Atoi32(unitPriceStr)
    if cnvErr != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "単価が不正です。" });
        return
    }

    name := r.FormValue("name")
    desc := r.FormValue("description")
    imageDataUrl := r.FormValue("imageDataUrl")

    duplicated, notFound := model.UpdateItem(itemId, name, unitPrice, &desc, &imageDataUrl)
    if notFound != nil {
        http.NotFound(w, r)
        return
    }
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "UPDATE", "message": "アイテム名が重複しています。" })
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE" })
}

func CountAllItemImages(w http.ResponseWriter, r *http.Request) {
    c := model.CountAllItemImages()
    webutil.WriteJsonResponse(w, []map[string]int64 {
        { "count": c },
    })
}
