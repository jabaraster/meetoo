package handler

import (
    "net/http"

    "github.com/zenazn/goji/web"

    "../model"
    "../webutil"
)

func GetAllItems(w http.ResponseWriter, r *http.Request) {
    menus := model.GetAllItems()
    webutil.WriteJsonResponse(w, menus)
}

func RegisterItem(c web.C, w http.ResponseWriter, r *http.Request) {
    itemId := c.URLParams["itemId"]
    name := r.FormValue("name")
    desc := r.FormValue("description")
    imageDataUrl := r.FormValue("imageDataUrl")
    if len(itemId) == 0 {
        model.InsertItem(name, desc, imageDataUrl)
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT"});
    } else {
        model.UpdateItem(itemId, name, desc, imageDataUrl)
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE"});
    }
}
