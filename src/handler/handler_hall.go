package handler

import (
    "strconv"
    "net/http"

    "github.com/zenazn/goji/web"

    "../model"
    "../webutil"
)

func GetAllHalls(w http.ResponseWriter, r *http.Request) {
    halls := model.GetAllHalls()
    webutil.WriteJsonResponse(w, halls)
}

func InsertHall(w http.ResponseWriter, r *http.Request) {
    name := r.FormValue("name")
    descriptor := r.FormValue("descriptor")
    icon := r.FormValue("icon")
    duplicated := model.InsertHall(descriptor, name, icon)
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "名前、あるいは識別子が既に使われています。" })
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT" })
}

func UpdateHall(c web.C, w http.ResponseWriter, r *http.Request) {
    hallIdStr := c.URLParams["hallId"]

    var hallId int64
    var err error
    if hallId, err = strconv.ParseInt(hallIdStr, 10, 64); err != nil {
        http.NotFound(w, r)
        return
    }

    name := r.FormValue("name")
    descriptor := r.FormValue("descriptor")
    icon := r.FormValue("icon")

    duplicated, notFound := model.UpdateHall(hallId, descriptor, name, icon)
    if notFound != nil {
        http.NotFound(w, r)
        return
    }
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "名前、あるいは識別子が既に使われています。" })
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE" })
}

func RemoveHall(c web.C, w http.ResponseWriter, r *http.Request) {
    hallIdStr := c.URLParams["hallId"]

    var hallId int64
    var err error
    if hallId, err = strconv.ParseInt(hallIdStr, 10, 64); err != nil {
        http.NotFound(w, r)
        return
    }
    model.RemoveHallById(hallId)
}
