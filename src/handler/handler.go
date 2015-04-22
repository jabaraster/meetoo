package handler

import (
    "strconv"
    "net/http"

    "github.com/zenazn/goji/web"

    "../model"
    "../webutil"
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

func RegisterItem(c web.C, w http.ResponseWriter, r *http.Request) {
    itemIdStr := c.URLParams["itemId"]

    name := r.FormValue("name")
    desc := r.FormValue("description")
    imageDataUrl := r.FormValue("imageDataUrl")

    if len(itemIdStr) == 0 {
        model.InsertItem(name, desc, imageDataUrl)
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT"});
        return
    }

    var itemId int64
    var cnvErr error
    itemId, cnvErr = strconv.ParseInt(itemIdStr, 10, 32)
    if cnvErr != nil {
        http.NotFound(w, r)
        return
    }

    model.UpdateItem(itemId, name, desc, imageDataUrl)
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE"});
}
