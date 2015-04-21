package main

import (
    "regexp"
    "net/http"

    "github.com/zenazn/goji"

    "./assets"
    "./env"
    "./handler"
)

func main() {
    env.Dump()

    // htmlページ
    goji.Get("", http.RedirectHandler("/", http.StatusSeeOther))
    goji.Get("/", assets.BasicLayoutHtmlHandler("html/index.html"))

    // API
    goji.Get("/items/", handler.GetAllItems)

    // 静的リソース
    goji.Get("/css/*", assets.ContentTypeHandler("text/css"))
    goji.Get("/js/*", assets.ContentTypeHandler("text/javascript"))
    goji.Get(regexp.MustCompile("/img/.*\\.jpg"), assets.ContentTypeHandler("image/jpeg"))
    goji.Get(regexp.MustCompile("/img/.*\\.png"), assets.ContentTypeHandler("image/png"))

    goji.Serve()
}
