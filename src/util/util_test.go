package util

import (
    "testing"
)

func TestAtoi64s_01(t *testing.T) {
    is := Atoi64s([]string{})
    if len(is) != 0 {
        t.Error(is)
    }
}

func TestAtoi64s_02(t *testing.T) {
    is := Atoi64s([]string{ "1", "2", "3" })
    if len(is) != 3 {
        t.Error(is)
    }
    if is[0] != 1 {
        t.Error(is)
    }
    if is[1] != 2 {
        t.Error(is)
    }
    if is[2] != 3 {
        t.Error(is)
    }
}

func TestAtoi64s_03(t *testing.T) {
    is := Atoi64s([]string{ "1", "a", "3" })
    if len(is) != 2 {
        t.Error(is)
    }
    if is[0] != 1 {
        t.Error(is)
    }
    if is[1] != 3 {
        t.Error(is)
    }
}
