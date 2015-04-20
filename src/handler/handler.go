package handler

import (
    "net/http"

    "../model"
    "../webutil"
)

func GetAllItems(w http.ResponseWriter, r *http.Request) {
    menus := model.GetAllItems()
    webutil.WriteJsonResponse(w, menus)
}
