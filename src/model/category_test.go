package model

import (
    "testing"
)

func TestInsertCategory(t *testing.T) {
    InsertCategory("hall", "会場", "home")
}

func TestGetAllCategories(t *testing.T) {
    InsertCategory("alter", "祭壇", "ok")
    categories := GetAllCategories();
    if len(categories) == 0 {
        t.Error(categories)
    }
}
