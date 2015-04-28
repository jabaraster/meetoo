package model

import (
    "testing"
)

func TestInsertCategory(t *testing.T) {
    InsertCategory("会館", "home")
}

func TestGetAllCategories(t *testing.T) {
    InsertCategory("祭壇", "ok")
    categories := GetAllCategories();
    if len(categories) == 0 {
        t.Error(categories)
    }
}
