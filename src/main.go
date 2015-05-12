package main

import (
    "regexp"
    "net/http"

    "github.com/zenazn/goji"
    "github.com/zenazn/goji/web/middleware"

    "./assets"
    "./env"
    "./handler"
)

func main() {
    env.Dump()

    // htmlページ
    goji.Get("", http.RedirectHandler("/", http.StatusSeeOther))
    goji.Get("/", assets.BasicLayoutHtmlHandler("html/index.html"))
    goji.Get("/meetoo", assets.BasicLayoutHtmlHandler("html/meetoo.html"))

    // API
    goji.Get ("/items/", handler.GetItems)
    goji.Post("/items/", handler.InsertItem)
    goji.Get ("/items/:itemId", handler.GetItemById)
    goji.Post("/items/:itemId", handler.UpdateItem)
    goji.Post("/items/:itemId/remove", handler.RemoveItem)
    goji.Get ("/items/:itemIdWithTimestamp/image", handler.GetItemImageByItemId)
    goji.Get ("/items/:itemId/belong-hall-ids", handler.GetItemBelongHallByItemId)
    goji.Get ("/image_count", handler.CountAllItemImages)

    goji.Get ("/categories/", handler.GetAllCategories)
    goji.Post("/categories/", handler.InsertCategory)
    goji.Post("/categories/:categoryId", handler.UpdateCategory)
    goji.Post("/categories/:categoryId/remove", handler.RemoveCategory)
    goji.Get ("/halls/", handler.GetAllHalls)
    goji.Post("/halls/", handler.InsertHall)
    goji.Post("/halls/:hallId", handler.UpdateHall)
    goji.Post("/halls/:hallId/remove", handler.RemoveHall)

    // 静的リソース
    goji.Get("/css/*", assets.ContentTypeHandler("text/css"))
    goji.Get("/js/*", assets.ContentTypeHandler("text/javascript"))
    goji.Get(regexp.MustCompile("/img/.*\\.jpg"), assets.ContentTypeHandler("image/jpeg"))
    goji.Get(regexp.MustCompile("/img/.*\\.png"), assets.ContentTypeHandler("image/png"))

    // ミドルウェア
    goji.Use(middleware.Recoverer)
    goji.Use(middleware.NoCache)

    goji.Serve()
}
