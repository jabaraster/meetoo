package handler

import (
    "strconv"
    "net/http"

    "github.com/zenazn/goji/web"

    "../model"
    "../webutil"
    "../util"
)

func GetAllItems(w http.ResponseWriter, r *http.Request) {
    menus := model.GetAllItems()
    webutil.WriteJsonResponse(w, menus)
}

func GetItemById(c web.C, w http.ResponseWriter, r *http.Request) {
    itemIdStr := c.URLParams["itemId"]
    if len(itemIdStr) == 0 {
        http.NotFound(w, r)
        return
    }

    var itemId int64
    var cnvErr error
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 32)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }

    item := model.GetItemById(itemId)
    if item == nil {
        http.NotFound(w, r)
        return
    }

    webutil.WriteJsonResponse(w, item)
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

func RegisterItem(c web.C, w http.ResponseWriter, r *http.Request) {
    itemIdStr := c.URLParams["itemId"]
    unitPriceStr := r.FormValue("unitPrice")

    var cnvErr error

    var unitPrice *int32
    unitPrice, cnvErr = util.Atoi32(unitPriceStr)
    if cnvErr != nil {
        return
    }

    name := r.FormValue("name")
    desc := r.FormValue("description")
    imageDataUrl := r.FormValue("imageDataUrl")

    if len(itemIdStr) == 0 {
        model.InsertItem(name, unitPrice, &desc, &imageDataUrl)
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT"});
        return
    }

    var itemId int64
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 32)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }

    model.UpdateItem(itemId, name, unitPrice, &desc, &imageDataUrl)
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE"});
}
