package handler

import (
    "strconv"
    "net/http"

    "github.com/zenazn/goji/web"

    "../model"
    "../webutil"
)

func GetAllCategories(w http.ResponseWriter, r *http.Request) {
    categories := model.GetAllCategories()
    webutil.WriteJsonResponse(w, categories)
}

func InsertCategory(w http.ResponseWriter, r *http.Request) {
    name := r.FormValue("name")
    descriptor := r.FormValue("descriptor")
    icon := r.FormValue("icon")
    duplicated := model.InsertCategory(descriptor, name, icon)
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "INSERT", "message": "名前、あるいは識別子が既に使われています。" })
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "INSERT" })
}

func UpdateCategory(c web.C, w http.ResponseWriter, r *http.Request) {
    categoryIdStr := c.URLParams["categoryId"]

    var categoryId int64
    var err error
    if categoryId, err = strconv.ParseInt(categoryIdStr, 10, 64); err != nil {
        http.NotFound(w, r)
        return
    }

    name := r.FormValue("name")
    descriptor := r.FormValue("descriptor")
    icon := r.FormValue("icon")

    duplicated, notFound := model.UpdateCategory(categoryId, descriptor, name, icon)
    if notFound != nil {
        http.NotFound(w, r)
        return
    }
    if duplicated != nil {
        webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "NG", "operation": "UPDATE", "message": "名前、あるいは識別子が既に使われています。" })
        return
    }
    webutil.WriteJsonResponse(w, map[string]interface{}{ "status": "OK", "operation": "UPDATE" })
}

func RemoveCategory(c web.C, w http.ResponseWriter, r *http.Request) {
    categoryIdStr := c.URLParams["categoryId"]

    var categoryId int64
    var err error
    if categoryId, err = strconv.ParseInt(categoryIdStr, 10, 64); err != nil {
        http.NotFound(w, r)
        return
    }
    model.RemoveCategoryById(categoryId)
}
