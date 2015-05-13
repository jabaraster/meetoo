package model

import (
    "testing"
    _ "github.com/mattn/go-sqlite3"
    _ "github.com/lib/pq"
    "github.com/naoina/genmai"
)

type Hoge struct {
    Id int64 `db:"pk"`
    Name string
}

func TestHoge(t *testing.T) {
    db, err := genmai.New(&genmai.SQLite3Dialect{}, "./ut.db")
//    db, err := genmai.New(&genmai.PostgresDialect{}, "host=192.168.50.13 dbname=app user=app password=app sslmode=disable")
    if err != nil {
        t.Error(err)
    }
    if err := db.CreateTableIfNotExists(&Hoge{}); err != nil {
        t.Error(err)
    }
    defer func() {
        if err := recover(); err != nil {
            db.Rollback()
        } else {
            db.Commit()
        }
    }()
    if err := db.Begin(); err != nil {
        panic(err)
    }

    objs := []Hoge {
        { Name: "hoge" },
        { Name: "piyo" },
    }
    if _, err := db.Insert(objs); err != nil {
        t.Error(err)
    }
}

// func TestGetItems(t *testing.T) {
//     items := GetItems(nil, []int64{1,2,3})
//     if len(items) == 0 {
//         t.Error(items)
//     }
// }

// func TestGetItemImagesByItems(t *testing.T) {
//     name := "アイテム0"
//     unitPrice := int32(10000)
//     description := "説明。"
//     imageDataUrl := data
//     InsertItem(name, &unitPrice, nil, []int64{}, &description, &imageDataUrl)
// 
//     item := getItemByName(name)
//     items := GetItemImagesByItems([]Item{ *item })
//     if len(items) != 1 {
//         t.Error(items)
//     }
// }

const (
    data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADHCAYAAABcDhxLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAASEVJREFUeNrtvXeUHMed5/mJNOWr2nsD33D0JOiNSIleBETK0ogyFEcaSasdzeztu713e6f39u7d3t7c3FiOKDOiOKQoiU703oKkaEDCkQCBBtDed1dXdZevzIz7I6sbTRDdyOqudmB932vYjMjMyPhGxM8LKaWkiCKKOC6UxX6AIopYyigSpIgiZkCRIEUUMQOKBCmiiBlQJEgRRcyAIkGKKGIGFAlSRBEzoEiQIoqYAUWCFFHEDCgSpIgiZkCRIEUUMQOKBCmiiBlQJEgRRcyAIkGKKGIGaPN9A2maGIkkRiyGmUwhTWOx37mIZQ6hqKgeD2rAj+b3oWjzN43nrWcra5AJh4m1dTDy3vsMbn+Lsf37yERH5+1livhsQPcFCa5fT+WF51J53rmEWtbirqxAcbkKfi9R8IApKclEoozu2kP3408xvP1NUoN9IAQSKEZnFTFXiInfpcRdVkHF+edTv+16Ks45G3dlBUIRc+r/E/cqJEGkZZHo7qXroT/Rfv8DZIf6sYTAWugRLOIzAwVQATVQSsNNX2LlN79BcM0qhKoWpP+CEURaFrG2Dlrv+gU9jzyKZRlFYhSxYFAALIuaq69h41//hND6dQUhSWG0WFKS7Bvg0C/+ja6HHsQskqOIBYYFSEVh4Pnn+Pgf/4V4ZxfSmvvaXxCCGIkEfc++SPdDjwBFOeOkhZTT/ywBSEAKQf8zz9D50J/IRqNz7nPOBJGWRexwOx2/+wMY6eLOsRwhJVgW0rKQpnn0xzCRhmH/WNakkuW4P5Z19FpjSh+m3e9CkWjiLl0PPMjono+wjLmZFeas5jXiCQZe206s9WPMwikP8hgRCWIxbryMISVSSpAWSBCKglBVFFVFcblQ3S6E7kJxuVB0FaHpaH6/rUadZqJbmQxmIoGVzWJlDaxMBiuTxkxnsDJZpGUTZvJ7CYFQ5sdObQGZkQH6nn2B0lM24q4on3VfcyZIemSEwZdfW9g5KqW9KgEIBSwz90elSJZpYK/iFiAQqm1o0wN+tFAAd3kl3toa3BUVuKsq8VRW4Sovw1VWiisUQnG7UdwuFE3jeDodIcAyTKx0BjOdIhsdIz0yQmpomNTAIOmhYVJDQyT7+8iMRiaNxlY2axNGUQpOFgkMvfkWK2/7Ou7yslnPizkRRJomyZ4+xg8dWrCjlbQsFFXFXVGBp7YWPeAnOz5Gsq+fTCSKNM2CqfiWO6SUucVDoLhc6KEgnupq/CuaCaxaRWj9OgKrV+GuqsJTUYHq9c7Pc1gWmUiE9OAg8c4uogcOMn7wELG2NpJ9fWQiUax0GijcImcBye4Oxo8cIbhuDeosjYhzIoiVyRLv7MIYG10QgkjLQnW7qTj7LBpv3Er5mWeiBQJkIhHCO96n5+lnCe/chRmP2yT5jO4m0rLAshCahl5Rgb+hgdD69ZSffSZlZ5yOf8UK9GBgwZ5HKAru8nLc5eWENmyg7qorsdJp4p1dhHfvYeTdHUQ//JB4VxfZ6BjSMBHq3IgiAWGajO8/iHXZpYtEECNLamBwXgf36BtLhKJQddGFbPyb/0jZaadN/pevoZ7SzZuoPP882n//R3qfeY5Ebw9Yct7OuUsREzuG4nLjqamiZNMmqi++iMrzzyO4dg2Kri/2I05CcbsJrltLcN1amrbdwPihwwy98SaD298kum8/qaEh+zQwhx3FQhDr6MLKZGb9nHOTQaR9zFoIWIZBYPVqVnz9q58gx1SE1rew+X/6a8pOP40j9/47ozt3Y2WyCO3kP3JJ00RoGt7GBirPPZf6q75A5QXn4SorW+xHOyEUXadk4wZKNm6gcdtWBl59jZ6nniG8cyeZ0VGQcxDo5dzONnN3VlywY4wg1LKO0s0bZ7xK9flo+tJW/E1NHP7NPfS/9ArZsbGT9sg1oUJ1VZRTueUcGrdtpfbyy9ACC3eEKiQ81VWs+NpXqLrgfHqeeoaeJ58isv9jrHTaPnaR7zec2zefd3f3QkBaFoqm4q6sQA+FHLUpP/tMvHU1+Jqa6Hz4EZK9vSAKry1Z1HExTRRdI9jSQvNNN9L4pS/irald7McqCHxNjaz7wZ2Un3MW7fc/QN9Lr5AJhxdcU7ksCCKEQFoSM5XCzOM86a2vp+WHP8DX2MiRe+9l7OMDSMs6KUgiTQPNH6Dmc5ey+tu3U3XB+Yv9SPOCinPOxt/cjH/lCjr+8BDxri6EbbxZkPsvC4IgBNLMEm/vINHZhbemxnFTPRhg5c1fw1tbQ+vdv2D43R1Iw1jWqmBpmbgrK2i68UbWfvdb+JqaFvuR5hWe6irWff8v8FRXc/g39zB24OCCGYiXzVIqVJWxg630PvcC6eGR/NoqCrWfv5xN//k/UfeFz6N6PMg5uiAsFqRp4q6qZM13vs3Gn/7kpCfHBFSPmxVf+wob//qvKNmYk0MXwH1leewg2ATJjo/T9eifUN0umr/yZfwrmvM6LlWcczau/xxCLwnR8+TTZGOxeQ3XLDSkZeKpqWL1t77F2u99B83nW+xHWlAIVaX+mqsxkyk+/vt/ZPxImy2Cz+NOsmx2EABF00j2D3Dol//Gvv/xtwy9+RZGIplXH8GWdWz4yY9Z8fWv4iortZ3Zlog36kyQloWrtIQ13/5skmMqGrd+kdW334anqqogLu0zYfksnzkomoaRSND1+JPE2jtY/a1vUnflF/JySPOvaGb9j3+I4nbT/rvfkxkdXVJGtGMhpUTRdRq3bmX1t25fMHJM9e61Mln7HwW2g6OqougaKMqC78JCVWn+2lcYP3yEjgcfxkyl5k3xsuwIAvYACSkZ3bmL/cMjpPr6af7al/E1NDjuw1Ndxdo7vg2WRfvv/0gmElmax61cvEXluVtY+73vooeChe3essiOj2OMx8iOj5Edi2HG42RjMYx4IueRm8aIxXIt7OOM6nKh+n0ITUPzetACQTSfF83vRwsG0QMBtGAAPVjY552AHgyy8tabie7bT/iDnfMmtC/BGeEQQqC43SS6u2n9xa9IDg2x5vbbCK5vQTgcKG9tLWvv/C7AkiWJlBbe+nrW/sUdBFatLEifRiJBamCAZE8fie5uYh2dJHt7SA4Okh4aIRuJkB2PTR4/J3aSTw6/mDS+CkVBdXvQQgFcZaW4KyvwVFXja2jAv6IZX0MDntoaPNVVBd39SjdvounGbcTa2kmPjMyLZnJpzYZZQHG5yESjdDzwezLhMGu/913Kzjjd8US3SXIHAO2//wOZSHTpkERKFE2j6YYbqL7wgjl3l+zrZ+zgQSJ79jK6dy9jBw6R7OvDjMdt+5ICQqh2fIiSs1pPs9ZIKW1NoASQmMkk6dEwsbZ2pGUihEBxudGDAbx19QRb1lK6eTOlmzcRbFmHr64OCpB9pP6aq+l78WUGt78BllXwXWSJzIS5QdF1rKxB71PPkB0bZ91f3EHl+eehejyO2ntra+ydRFq0/+EhspEIYgmQREqL0Lr1NH/1JhS3e9b9JPv7CX+wk4FXX2f4nXeJt3dgJBMIVUNRVVDVgqzsn5qalmXHhoRHGd27l96nn8Xf3ETFlnOovuxSKracja++fk739NRUU3/NVUT27iU9EnZ8enCKxZ8FBYJQVaRpMvDa6xiJOC1/+QNqLrskD5LUsvbO7yEtSfsDf1h0FbCUEuHSafji9QTWrJ7VymimU4Tf+4DuJ5+i/+VXSHR1A9KOEPQugKCf24nU3DhKy2Ls0CHGWg8x8Nrr1F7xORq33kDFOWfPKRal5rJL6Hr4UTLh0YLLIicNQcAmCZbFyLs7OGj9K0B+JKmrZe0d37G1ZI/8CTOZXLydRFoEmtZQf/WV9iqfJzLhMD3PPEvbfQ8wunuPfVzTXXP13ZsThKKgutwgIdnXR9v9DxDZ8yGrv3U7Dddfi17izM/uWHjr6yk743RG935oa7SKBJkeE+q+kR0fcPBf/hWkpOZzlzomia+pkZYf/AVGLE7vM89hZTOL4JZir4LVl1yIf0Vz3itiamiY9vt/x5F7/51Ebx+q7i7Ieb9gENhklZLwzl1kRiNYmTRNN25DLynJvztFoWLLOXQ/8STJ/lRBH3VZGQqdwk5CoDCy430O/svPGXz9DcxcSKcTBFavouUvv0/VxRfaRzdrgXO1SHCFQtR87tK8881mx8fpeuRRW7PXP4Dq9iwtckyFEKheL7HOTg7+/JcMvLZ9MvQ2X5Scshl3dXXBhfSTkiBwNFPHyPvvc+CunzO4/c28SFJ66mZa/vL7lJ15OghbYF4wWBb+lSsp2bQpr+OClcky9OZbHP7Nb22VtV74ZM7zAdXtzhn9HiLW1j6rPjzVVfgaG+zdvoCeESctQWAKSd59j9Z/vZvwjvfzioCsuvB81n3/ToJr1y5gbieJVKDs9FNx5ZGNQ1oW8Y4ODv/mXmLtHcuGHBNQXTrDb7/D8Hs78lrIJtu73QSam1H042demS1OaoLAUZIMv/Murb/4FaO79+R1ZKr7/OdZ+91v46urw1qIo5a0bTulp5ySl3BuJpP0v/wKw2+/vaTdZqaD0DQyY2OE3/+A9NDwrPpwV1bkNI9FguSFCcF94OVXab37l4wfOOi4reLSady2lZXf+DquYHD+3eSlRA+V2FZzp/5FUpIaHKL3mWftGPxlGhAmgPEjR0iHw7Nq7yory8lshZNDludIzgJCVZFS0vf8ixy+517iHZ2O2+rBAKtu/Qb1116D4nbNq9AupcRVWoq3od6x/GFls0T37Se672OEuowVkwKM8disBXXV6y34+39mCAI2ScxMhq4/PU7b7x4gPTTkuK2ntpZ1d36XqgsvQKhiHoV2ibusDD1U4lj+MFMpRnftIhsbzyU2WK4QOefMWTafBxlxOY/m7F5Y08iOj9PxhwfpeuwJsmPjjtuGNm6g5Qd/QWj9erDmKau5EHhqalBdzuUII54geqC1oMLp4kAiVKWgFaLmis8cQcD23Ur1D3Dkt//OwCuvYqacG5cqL7yA1d+8DXdV5fzkBBMCd2W5czlCSrLRKPG2dsQCJTKYN0jQgkEUh0bdhcAyH9E5vLjLxfihwxz6zW8J79zleLILRaHxi9fRtG0rqtdTcJKInPEsH/VudnyczOjoshXOp8Lf3DRrlxMjHscysgV9nuU/orOFEAhNY2THDo7cex+x9nbHTfXSUlZ/63aqLroQoSqFlUeEsIOM8iHI2Jg9MZZzYjxLorjclGzciLuiYlZdZEZHc2lGi2regkAoCkJC3wsv0vHgw6RHnGdLCaxawbq/+B7BdWtteaQgH0WCAN3vd97CssiOjSONhUkBO1+wzAy+xgZKNmxAm41nr5Skh0dy41BU8xYMQtMw40k6//Agfc+/iJFIOG5bcd65rLr1FlxlZQVS/QqQkI3HnTeZDFxa3gK6NEzKzzqTwJpVs9oJrUyGRG+vnfOsgDvpZ54gYBsDE339HLn3PsLvf+DYGKhoGk3bttou6bpeGJJISXZ83PmEF8I2KC7j45VlGLgrq6i+5GK8tbNLnZoOj5Ls7bVlwiJBCg/F5SKyZ68tj+RhRHSVl7Hm27dTunkTdrr7ua3kEvJK1y8UBT0YWNaZIq1slsrzz6XinLPz9l6ewNiBA6SGhguu6i4SJAeRq5vX//IrdnTa6KjjtqFNG1l12624KyrmLrBLmauU5awfmyBB2wepEJNDSqxsFjOdwkwlMdOpec0dZmYzeOtrabj2GvxNjbPuJ7L3I7KRuVe1PRZFgkyBUFXMZIqOBx9m6M0/Y6WdreRCUai/5mrqrvxCzpt0DiSxJOmhIaTp0OdLCFSvD8XlmtPqKS0LK51GAt66OspOP53Kc7dQeuopeKoqc/+fKSxRLAuBoP6qq6i66MJZx92biQSRvR/aEaDFmPT5haLrxLu7abvvdwRWr6Jk00ZH7fSSEKtvv42xjw8Q3rWbiajAvCElmUjEnowOSnwIIdD8Plzl5SQHBmb1zpZhoOo6ZeecTc3llxHasAF3WSmKpmFmMqSHRxjds5f+l15m7OMD9n0LcKQz0xmqLjiP5i/fiKfWeULyYzF24CBjB1uxJipSFRBFghwHiqYx9Oe36XrkT3hqahxnbSzZtJFVt91CrL2dTCQ6u9VMUXKZQEacxYMIgRYI4GuoJ7rvo7xvJw0Dd3kZzV++iaabvkRw9arjFt+puvACqi48n86HHqH32ecwEsk5JLUQmOkUgTWrWf3t2yk7/bQ5TezBN/5ManB+SgEWj1jHgVAUrGyWzkcfY+jNtxwH8AhVpf7qq6j9wucRmjKrI48QgkwkSqK3z7FWTPV48DbWI3N2FKeQhoFeWsLqb95qR0+eduq0lalcZaXUXHoJG37yY5pvuhHV7Z6lF4HAzCTx1tey9nvfofbzVzjOF3A8pAYHGXrrLYx4vODHKygSZFoomkayp5e2+x8gduiI47O3XlrCqttuxr9yhZ3ILF+SCEE2MW6n6HHYVnHp+JuaUDTd8e2kZaG4XdR9/gpWf+t2PDXVjp4tuG4tq267heqLL5yV/cVMp/DW1rLue3fQfNOX5pxKdXD7G4wdPFhw9e7k2Ba8x5MFQiB0jeG336H7iSfJjEYcNy079VSab7rJ9qmaxS4iDYNYe7vjHURxuQi1tKAHguBQ+yUtC19jI0033eiMHFMQ2rCelTd/g9CG9Y53V2lZmKkUgZUrWP+jH7LiG1+bc4HRTDhM77PP2wnj5skPrUiQGSAUBSuToevRxwh/sBMr68wRTnG5aL5xG+VnnoEU5E8SC8YOtDqefIqm4W9qxFNXi7ROfOyRloXQVEo2bqDinLPyHhdF16m+5CJWf+db+JubZ/aGljm7jrSouvACNv/P/5nmr34Zd7nzbPzTof+V1xndudveyebJUFoU0k8ARdeJd3bS8eBDBFvW4m9udtTO19DAylu/QfTjj8mEIwg1nw8oiHd2khocRA8EHAnqrrIySjdtJLp/H3CCWBIp0Xw+Sjasn3U1XC0QoGnbDQjg0K/+jbEDBxGaNim4S8vCMrIIIfCvWkXDtdfQcP21lGzehDqHNKoTSPb20v34E6SHhubVi7lIkBMhl8W8/5XXqLrwApq/8mU0v4O0nUJQ87nLqLn0ErqefNJ2aHS4ygkhSA0MMnaglcDKlY5UqqrPS8nmzSiPPXHCayV2WlN9jkccV2kpTTduw1tXR9djjzHy7vukh4axLBNXaSn+Fc1UnHsONZddSukpm3FXVhbmmwDdTz5NeOcuW7U7j14ERYI4gFBVjLExOh9+lPKzzqD0lFMcTXZXSQkrvv5Vht97j2Rvv3MtixAYqTjRDz+i7gtXOCOI203pKZtwlZSQiURO2MYuXzD3lVcPhWzbycb1JDq7SYdHkKaFHgzgqa7GW1uLqyKPADAHGN25i+7Hn1yQGJgiQRxCcbkI79pN1+NP4mtotG0UDlBx9lnUX3klR+7/nS1AOyWJaaflNBIJXA78k4Sm4V+5glDLOob+/OcZCSIAmc3mFW4849jothbN39Q0qViYr4mbGY1w5L7fTRos59tJsyikO4UQSMOg54mniHz4kWOPX9Xno/lrdsHR/OwigvHDR4i3dzjWZrlCJZRvOYcTGkOEgpFIETt8ZNYZRKbvWpk3ckjDoPOhRxh4+dV5Lbs2FScfQeYxLkLRNOKdXXQ99nheuZtKNmyg/uqrELpzh0KhKKTDQ4y8t8NxG9XnpfLcLbgrZ46XF4qCzGSJfPQR0f0fz9t4FRp9L7xI2wMPkBoeXrDw4uVJkImyYIaBmU5hpBIYyThWJjPpdGck4xipBGY6ba/2hYjVEAIhBP0vvcLorj1HC1ueAIrLRePWL9pHkDwIbKWzDL31NkbMWQCVomuEWtZRdtqpWCdydhSC2JF2uv70eF5JKxYL4fd3cujX9xA7fGTS83ohsKxkEGnmVIeKghYI4K2pxt/chLehHr2kBD0QRPW4MZMpsrFx0uEwia4eEp1dpIaG7KpKQqBo+qwHWGgaycEBOh/9E6WnbMLrsEJSaO1a6q++itZf/QoMp7KIIPrRPmLt7ZSedqoDId9W91ZfchEDr70+Yy0Z23M5Qe9zz1F6ymaav3LT/H24OWLswEEO3vVzwh/sRFosaFqgZUEQaRh2nfDyMko3b6Ziy9mUbt6Mr6kRPRhE9XpRdB2h2fX1pGlhmQZWJoOZTJKNRBk/dJjwzl0Mv/0O44cOY2UyCF2flf+OoqgMvr6dkfd3Ul9R4chNW3G5adx2A/0vvcTYwUOO7isUhdTIEENvvkXpKZvBobq3Yss5+JqaiHd0IGbI0ysUlUR3D4d/ey++piYqz9syz18yf4y3HuLAP93FwOvbsbILn1Z1SRNEmqbtElFfT/Wll1B35RWENmzAVVaKFgjk5U1asmkj1Z+7lFRfP0NvvU33U08T2bMXK5u1+8mDKEJV7QpOTz1N+dlnOquzJyC0dg11V36B8bY2x7uIlckyuP1NVnz9q46yfQhFwdfURNUF5xFrO8KMRkMhQAoiez6k9e5f4qmqILB69Zy+WSExfqSNA//8r/Q9/8KCCeXHQv3Zz372s9k2ttIZwh/sIvzOOwVMtMKkfOGtqaH5pm2s//EPadq2lZLNm3BXVKB6PHkPltA0NL8fT00NofXrqbrgPDw1NaT6+8mMjAAiz91EkB4YoPTUUwmsXOHIViFUFS0YZPDV18mOjTnbRSQY43HKzjgd/8oVjtoomo40TQa3v4GVTs84VkIIpGmS7O0lG4lSsmkDrllUeSo0Rvd+yMd/9w/0v/gSRjI5K3IIBMGWFmovv3TWRUqXHEGsbBbN66X281ew8a/+A0033UhofQt6MFgwi6nqduGurKRk4wbKTj8NM5Ek3tGeV2Z0oShkY+Moqk7FuefYLiEnbCRwlZQQb2snsu8jhMTRLmJmUrhCIaouvsjRrilUBcXjIbrvY8aPHEY5QUJn2+csS6y9g/RImNCGFlylpQUZ67whYeC119n///0Dg9vtymCz3TkKQZClc8SSEmmaBFauYNVtt9B4w/V4amvntdaFHgpRee4W/I2N+FeupP13vyc9Es4duU7cXlE1ht58k+i+/bgrKhw9q+LxUH/tNfQ886yzGOrcCj/4xpvE2zsItaxz5Jvlqa6i/pqrGHrrz0gHkXZCVTETCXqffBornWb9j3/oOJqyUMiOjdP92GMcufd+xloPOXru+caSUPNK00QCleefx2k/+99Y9c1b8TU1LUghGKGqucKdd7Lhpz/B39ToOM5BqBqpoSH6n3+RbHTM2f2EoOyM0yk/80wkDuNFhEK8p5v+l19xrCbWvLZNpHTzJsfpOIWqYiST9D77PHt+9t/of+nlhanPKCWRDz/iw//j/2Lf3/0D0QMHbI/jJZBKddGPWNI0UdweGq6/hk3/6a+pOOesghS1z3sgvF5C69biqa5m7MAB0uFcjMEJVmtpWWQiUaouOB9vbY2jj6roOmYiyeD2Nxy5nwgBGCZmMkXN5Zc5Ps4pbjdGPM7w2+/k/smZ5gzTJNHbw+iu3WSjYwRWrLDToc4Dkr19tP/+Dxz4x7sYeuNNsuPjtp9YAewcy14GkaaJ6vOx4qs3semn/5HAmtVziHOeOxSXi8DqlaheL9GP9mOMj5/4aKIoZKNR/E0NlJ5yiiNXbiEEejDA4PY3SQ85sQrbkyUzHiW4Zi0lG9Y7E9Z1Hc3nY3T3bpK9vc6Lywg7w2NmNEJ074eM7v0QAG9trR0EVgAkenroevxJDv7TXfQ8/iSJ7m4sy3S0KDnFspZBJsjR/OUb2fCTH+Gtq1usR/kEVK+X5ptuJDM6yqFf/YrMaHTmiZWTEfpffpWGL16PHnQWv+FtqKfqwgsYO3TQsSu8EUvQ9ejj1Fx2KZ6qE7uOC0XBv6KZhuuvJ/rRPqSUeXkUCyHIxuIMvfUW0f376PrTY9R87jKqL76QwOrV+R2BpSQ7HiO6fz+D299g6M23GD90GGNsHMuyCrZrFBqLQhBpWaheL03bbmD9j3+It2526SbnbVACflbddgvx9g66HnscK2vMrCrVNCL79hP58CN8TY2OdhE7Ku9iOh9+BGNs3BGpkJLR3TsZevMtmrbd4IhUWjBI9aUX0/3EU0T27Ea48gtWEopi5+oaDjO4/Q3C739A+/0PUHrKKZSfdQb+VSvx1tXhqapE8/mQ2Pudlc2SiURJDQ2R6Oxi7MBBRvfsZfzwYTLhMGYyxYSpfynIGtOO30LfUFoWiq5Tf81VbPir/4Cvvo5CZuMuFNwVFay98w5iHZ2MvLdjxtVXKApmPMbAq69RffFFjo9ZZaedQqilhZH33kM40JcIwBiL0f3EU9Refhm6A3uFEILAihU0Xn8N0X37mNH/ZPpO7He37F3AiB0m1t5O7wvPo/kC6KEgms9n7yi5rqVpx6Ab8TjG+DhGMomVtT0iJu++hIkxgYUlSG6SVZ1/Hut//EPbAr0Et9UJhNa3sPLmr9nhr30DoM1ghxEKIzveJ97Viau87MSrYi5MtvK8cxnZ+b6z6gm5XWTkvffof/lVmr601dkuEgpSe8Xl9L7wEuEdO1Dy3EWm3n9ikZCGiZFNYMQS09Z6lPAJLd1SPUbNhIWjsJRgWYQ2tLDu+3cSXLtmSZMDbLVn7RWXU3bKqblCOdPPYkXTiHd0MvLu+5jJpLP+NY2qC8/HFSrNy8s3G4nS+eDDpMPO8gfbceErWfHlG1G9vsKobnNHo0mhWgg+cRLIkWHimkIK3wuJBSOItCzc1VWsuvUWKi84b9lkI3eXl1N21hloAd/MLvNCYBlZht9+x7F7uhC2lsXf1OTcHV8IpJSE9+yi/4WXHMeKaD4fVRdfROV5W7CyzrPH5wXBFLKcHFgQgthCuYe6q66k6cZts05xP/0NcvEhpjnp4FiwwCkh8K9oQvF57cyFM12qqEQ/2keiz2FWRCFwlZZQfs5ZkMd6IYQgOxaj48GHSPb3O34PX1MjK772VdyVlXbG9iJOiPmXQXITNbRhPatuuxk9NLsCjcftOlefL7LnQ8I7d5Ho7QVL4l/ZTPVFFxLasN4WmOe4oumBAIp+4hmsqCrJgUEiez+kZH2LI5uBommUnX4aqtuLlUo7e9YJjda+D+l+4inWfu8ORzESqttN5fnn0nDdtbTde79NypNnsZ8XzDtB7DiOcpq2bqVkY2F8e6QlSQ8N0vv8C/Q88TRjBw5ixGO5VVGiaDpt9z1A07YvsurWm/E1Ns6JJFYm46xehxBYmRSRvR/S+MXrnBnVVJXSTZtwV1SS6O52LMQKhF067uFHqbn0YkIbNjhq56mpoWnbVobeepvY4cOF381PMszvEUtKhKpSfsbpNG69viByh5XJMPzWW+z8L/+VD//P/87Q2++QHh21w18tCZYdQ5Ho7qb1F7/mo//xd4wfOjSnI1eit88OS3UYBRjZvZdM1FkxFyEEntoa/M1N+T1j7lliRw7T8eAjedUyKdm8kRVfuQnhKlDZuJMY80oQaVm4KypouP463NX55X/9dGeSzOgobff9np3/y3+l78UXMRLJnEwojgqHuZ+JDO3djz9B6y9+Tbyra1a3NZNJInv2YowlEE7OI6pKoreXZE+v48wnmtdLyaYNOTnEOUmEUDBTGXqeesZO7uAQrpIS6q+5iqoLzi94XfGTDfNHkNzuUXb6qdR+4fK56b+lJDkwQOvPf8W+//fviB1pm6JTn75foShIw6T7sSfofuwJsmPOPG6n3nf4nXftWGiH4Z6KqpKNRIh+tA/Taa1BVSXU0oJQZ+G9LATJ/n7a7rvfeYJtIQisXsWqW27GW13jOOfwZxHzRpCJGPK6K78wt0TFOXIc+uWvOfRvvyEbjeaOag7P6ppKNhaj/YE/Mvj6G85rWkhJanCI9t8/SLyrOy+rr2lmiLV3OM56InK+WXogOItqCbl4kTffpOfJp5CW05IJLirP20LTl7bmrOTFo9bxME8ZviRCUQiuWU3VJRfPSUDORKN0/OEh2u57ADORmJUco+g68fZ2Wu/+pR2Gmpm51p60LJIDA+z/+3+i/5VXkKaRl7+QkML2Tk05NBgqCv7mJjtb4ywmqhCCbGSM9gf+yPihVsft3NXVNH35RirO3VI8ak2DeSGIlBLV76PyvPPwNThLi3M8WJkMvc++wOF77rXjBObgCi90nfCu3ez53/8bR357H8m+fls7ZRiT9hMrm8VMJBh++112/68/o/OhhzETSYSSJymFSryji8yYw3rnQuAKleAKhWZXiFMIJBA9+DFH7r3fcZ4rIQShlnWsuvVm3FVVRdvIcTA/al4pcVdU2BbzWTqkSSkJv/8BbffeS6q/b/b+Q1MgFIXxI0fY9z/+lu4nnqTi3C2UnboZV1k5lpEl3tbByI73Gdmxg9TAoO2ZOptkAYogE4lgxGKOXcwVtwtPdfWsZTWhKFipDL1PP0vFWWfS+KWtjp5d9Xiouvgimm/6Eod+fc+SieRbKig8QXLCeWD1KjuX0yyR7O2l8+FHGd25G0UvnK5eKApmJkN45y5G9+xBdbntY1uuPrjthpHThM36JgIrnSI9MuI4rlpoGp7a6jnt6UJRSA8Nc/ieeyk77VQCa9c4auetqab5KzcR3fcxg9u35+0SfzKj4EuFlBLF46Z006ZZp4+Rpsnwn9+h97kXkPPk2yMUBSSY6TRGImG7YxsGiMI41VmGSTY65tjOIITAXVExN22fEEgk0f37OHLvfZgph4mphSDU0sKq227BW99Q1GpNwbzspa5QiJKNG2Y90WJH2uh5+lmSQ4MLkrih0BBCYGUypMOjzrVmQqCHQnbJtjkkURKKgplM0/3U0/Q882xedQ6rLr6QVbfdgub1zrKC7cmH+SFIWdmsU8ZI0yS8cxdDf377hPmcljKkZWFl0nlZxwvhNwa5lKWDQxz+t3sYO9jq+BncZWU0fekG6q65anYVek9CFJYgOfWuu6ISb23NrLpI9vcz/PY7ZMLhZU0QG3mkMxUC1e93Zq0/cWcARPd9ROvdvyTr0O0FIQisXMmab91O2VlnFFW/FJggUkqEpuFrqJt19ot4RyfhXbtysQWLPTyzx9ESZ4vzEhPZEvteepGOPz7sXK4QgtLTT2XNHd/F19CA/IzLIwU/YglVxV1ZOSubhZXNMt56iNiR9oJqrhYaUkqEruMuK3NcB1Bil0U7UcxJPhCKSjYc5ch999sZFh3KI6rbTe3nLmP1N7+JFgx+puWRAhNEomgqemh2ScYy4VHGDh60M3kv56g0KVFcLrt4pVPLv5S2r1ihz/1CId7WQevdvyTe0em4mauslKabttF047ZcZpPPpitKgWUQQBGO6mUcD9nxcZI9fdhVUpYvQaSUaD4vnqqqPAiCnYm9wM8iFFv1O/zuexz817sdu+ED+BrqWXXbLdR87lKk/GwK7YXXYkk564E0kklSkXBBjxmLAWlZ+JqanGU3mWgjLVJDQzlnw8LSxLayp+l59lk6fv9Hx7EjCEHp5k2s+/6dlJ1xxmfSFWVp+RTMgVxLCkJSsmlDXuHF0jBI9vbPxQQy8yOpKtlwhCO/vZ++l152HKuCEFScu4V1d95BYOXKzxxJ5okgs/vKQlGWv2pXWui+AOVnnYnq8ThsA2YqlUv2MH8LhFAU4l0dHLzr54zu3ut4MVJ0nZorLmfNHd/GU1XlnFwnAQpLEGHHixsJZ27ex0IL+G2HvSW2seUDK2sSWreOirPPdpRhEXLHq8EhMiPh+VVO5ALMRvfu5cC/3EWiq9txUz0YoGnbVlbffit6SQnS+Gxotgo8EwXSMOzItlkcldwVFZRsWG+7lyzHo5Zloega9ddfi6e6yrmiQUpihw+TDo/MuyfthEZqYPt2Dvzr3Y6TzwG4KytYddstrLr1ZlSf7zOh/i3o1xBCIA2TVP+A83DTKdCDQbsWX3OzHdS0nCAllmlSfs7Z1F9zNZrf77ypaRL5cB9GMr4gdkWhqFjJNN1PPMGRe+7FiDtLdAfgqa5m9be+ycqvfwXV4znpSVLgI5Yd/pno6clLnTgVJZs3UXf1lbahcRnp3i3Lwt/UyLo778Df1JDH7gHZ8RjhD3aCCQtleReqSnY0Stt999P54MN2tnWH8DU2sPbO79K07QYUTXOWEmmZYl7c3dMjI4wfODir9p6qKppu3Eb1pRcjpWXr35cycrUVvdXVtPz4R1RfdklediApLcb2f8xYa+uC236EqpLsH6D1F7+m97nnMdMO3eMB/4oVrP3+92j44nUouoa0Ts6dZF4OvOnRUUZ37Zm1HFF6ymZa/vIHVJx7jr0rLVHPUmlZSCS++no2/vQnNN+0Le9KRlYmy8Crr5EOO6k0VWAIMZl0+8A/38Xg69vzigUJtbSw/ic/puH6aydLT59sKLhOVQhh55La+yHZWNyuuJRvH4pC1UUXoHo9tN79K7t2XSw2WT5hUa3sUtpx41Kiej2UbN7E2ju+S90XPo/qdajWndJXsreXgde228erxcjnLQSoCtH9H3Pgn+5CD4YoP/tMx3E4oZZ1tPz4h0gJfc89b7sJLZPE5E5Q+BqFQiBNCyubofTUzfibm2fVtxACX309FedtQQ+FyIRHMeJxO8lCTjYRufvNOyZIkbuv6nbja6in6aYb2fQ3P6XyvC0orvwDu6xsls5H/kT3E0/O/zvMgAnVcrK/n3hnB4HVq/DW1Tre0TyVlZRu3kQ2Hid2+AhWJrMk4tqXbhFPKbHSafSAn6oLL5jTiqIHApSffRaV527BVVYKuewj0jSxTPNTgT2TdJktcXJ9TRIi93dF19FLQgTXrqHh2qtZ/6O/ZMVXv2z7W83mXlISa2tn/9//A8nevkWfUCKXEDvR3UNyYICS9etxV1U6fjdXaSmh9euw0hni7R2YyeSi7/ZLtoin7fuTYujNt4l8+BHlZ5055/5C61sItaxj5c1fJ7zjA4bffY+xAwdJ9PSQHYtiJFO5/LyWvcPkJrcUE6SZ7kNJjno/5erlKQJV01HcbjS/H09NDaF1a6k8dwvl524hsKJ5zscII5Gk/Y8PEd23b9HJMXWcpWUy9MZb7P/7f2TT3/yU0Ib1jp/P39zM+v/wI1ylpbT97gFSA4PLtnDOBObNr0MCsbY2Oh98mND6lrzsAtNCCDzV1dRfdw31115NOjxKvLOT2JEjjLUeJtnTQ2Y0QnZ8HCMWw0gmsIxcZnZpk2Bir5n8sxAITUF1edB8fvRgEFd5GZ6qKvwrmgm1tBBYtRJfY0PBztbSshh++x26H30MaVhL6swuFBVpmfS9+BJCCDb+9X8ktGGD8+NWdRVr7/wurvIyDt9zL7G2NrDkklkE8sW8EUQoCmYqRf/Lr1J5/nk0fPF6x8FDzm4gcFeU464op/zMM4BcvZBolOxYjiDxBEY8TjYWQ5oGU3cRmyDSPjoFQ2gBP5r/KEEc+1HNAvH2Tlrv/iXJgf7CjkmhhlbRkJZB34svIqVkw09+TMnmTY5r2OuhEKtuvRlPTQ2HfvVrwjt327mNl9BC4BTz6hkoFIVEXx9H7rufUMs6Qhud1bCYy/1cZWW4ysrm9T5zQWpomNa7f8nwu+8gxOKF5M4Mae8khknf8y9gJhJs+KufUH6Wc+2W4nLRcN01eGtrOPTrexh49TWyY2OLLpfki3l2/MlVQvpgF62/+BWpwaG597mMkQmPcuS3/07nw48gzVmUY15gTCQJH9j+Bvv+9u8YfuddrDyMiQDlZ53Jqf/1v9ju8ityGs0laNOaDvO+vwtFwUyn6X3ueQ7/5rekw+HFfudFQXpkhLb7H+Dwb36LmUovmzO5UBSEUBh6820++r//loHXtmMkEnn14a2tZd0P7mTj3/z0aDqoZUKSBflKQlXJjo3Tfv8DHLnn3z9zO0myr5/Dv/ktB+/6OdlIZEnKHTNBKApCVQi//wEf/ff/h54nn3aeSigH1eOh6UtbWfOd2/HW1doq+mWABftSQlVJh8Mc+vVvOHj3L4h3di2bVWS2kKbJ2MGDHPjHf6b1578gOz42pwz1iwmhKCiaRnT/fvb97d/R9sDvSQ0O5tmJoOrCCyk9/TQ7/9cy+P4L+rWEqpKJRGi79z7SQ8Osuf2blJyyaV41RouFTCRC+IOdHP63exh8bTtSglju0ZJCoLhcJLq6OfBPd5EaHGL1rbfgX7XSuRq4php/UxOK24WVzS757DUL/sUUTcNMpeh69DHi7R2suu0Wqi+52M7EuMQHywnMdJp4ewe9zzxLxx8fJtbehqJpy0bmcALF5SITiXDkt/9OsrfPzsR4xunOfNEmS+ctDyzKkiYUu9zAyI73ibV30HDtNTTccJ2dEb586apoZ4KVyZDo7mH4vR10PfInW+OTySzrBHgzQdF0rHSG7ieeJNHVzervfIvayy/DXVExY7tMeJTkwOCy2D1gkQgC2Nu1rpMOh+3Mf39+m4brr6Xm0ksIrFqJu7pqWay6mWiUZE8vo3v20vf8Cwz/+R3SkVHbVWUZZqbPB3ZdFYWR9z8gOTDA+KHDNG/bSmDtGhT901NLGiYj775HZM9eu27KMhifRT8UK7niNeOthzjwz3fR+9QzVF10AVUXX0SoZR2emuq80ucsBIxEgvTQMImuLobf3cHg9jeIfPgh2fEYiqahfoYK0AghUN1ukr19tP78F4x9tI+VN3+dinPPwV1ZOXmdmUgQ3rmb9j88SKy93bFVfrGxNJ5SCNtdXErGWlsZa22l++lnKTvtVMrPOpPSzZvwNTXirqhAD4VQPQs7Ac1kiuz4GOmRMMn+fsYPtDK6dw/hXXtIdHZhZe2jlNMsJicjFF1HGrZ7ytihQzRcdy0VW85BLwlhZbKMt7bS8+TTjO7avazKvC0NgkwgpyUBSA8P0/f8Cwy8/AqeqiqC69YS2tBCYPUafI0NuMvL0UtCaIEAmteD4nKh6Pqs1KhSWsisgZXJYGUyGMkURixGdswmRaKnh1hbG2Oth4gdOkx6aBgznUKomr1juE8+LdxsIFQVoarEO2xfs44/PoQWDGBlMmRGRjBTafsbLRNywFIjyBQomgaaZtcrHxoi0dfHwPY30Lxe9FAIT0013oZ6PNXVeCoqcJWV2YTx+1F9XhRVQ+gaisv1KWHQTGeQRhakxEgmMZMpjPFxMtEomdEI6fAI6cEhEr39pIeHyMbimMmEnZRa0xGqiuqZXXmHzwIm0jZlwmHSIyP2v6nq5OK3nLBkCTIJIRCahprbGSzDID08THJw0K4jkpu0qseD4naj6LZwLFTFjufw+SaLdE74uBvxOGYqbceUG1ksw8DKZLHSacx0GilNEAqKoubiQ5TiLpEvct9t6eupZsbSJ8gxmJywAORWJCntSZ7NTsaLT1ppj2etnbqj5LxLJ7xMT0ajZRGzx7IjyHExxfi03FesIpYWlo+0VEQRi4BltYNIU06pn2HHUwhVnAweKkUsUSwfggjQgxqaV50MLJeWJBs3MTNWkSRFzAuWBUGkBEUT1JxZSu255VhZidAEqXCGrteGiByKoerF02IRhceyIMhE/fXQCj8NF1ViZiwUXSHWm2RoT9Q+dk1NWVJEEQXC8iAI2FWYshZGysRMWyimxEyZ81qRqYgilue5RBzzexFFzBOWJ0GKKGKBUCRIEUXMgKUjg8hcwuhj8AlHw7nko3aQIMB2N5mnd7N/Kcj9PiV3CRxH5+Xd9pjvMuMzT1wrZrBNTfOdPwWxNOxbi0oQaUk7gRogVIGiHZN1T9rXWBmJUC2YTbEpAYoy0e/RNNXHPAl2AVKJZVjkvjGKosx6j7WNmrm+FYE68W4Tt5cSywBp5F5KCBTVAWGErfKeaDOZjd7h2BxtC0gx+R2mvZ0CQrGr45JbaKbO70njbc5oq+TU7dLi+IuSKlAQIGb+FkiwstbkswnF7n+hsTgEkWCZEs2rEqj34K/z4Cl1oXo/nYrTMixSwxkSQ2lUt5JXphhpSrzVbqrPKMVT5sIyLaabgQJbS5aNG6RGs8T7UiQGUlimtCeu03tKm/R6QMNf48Ff68FVoqN7VVCm9iMx0xbZcYP4YJp4X4r0aMZe0ZXj308CnhKduvPL0X3a5D8mhlL0vR3GysppCSYt8JTp1F9YgeZTJ52bEwMp+t8bxUh/0tgqLfv7VG4OEVrttxcnCWMdCYZ2RzHTJghwBTUCDV58NR7cJTqaV8VImAzujjDemTg6qaW9CFaeWkLJav9Ubn/6W0yUE0+apCNZ4v0p4gMpsnHTJsoC8mTBCSKlPQFKV/qp3VJGWUsQb5UL3a8df2JISTZhkhhMo3mUyR3H0b0s8JS7aLy0ipJVfszMCZZZKW2SxAzi/SlGPhpj4P0IicGUoy1fWhKhCio2hqg+q4ySVT68lW40n4pynGRxUkqstEUynCHWnWRod4TBPVGMmHH81VKCu0RnxRU1eKtck7vGyP4x+t+LIDPG9MclKXGFNFZcWYOn3IVlSoQCw3uiDO6OIJPyE/eUFqguhcrTSmi6vBrLkCgK9L0dZnhvFEUXVGwOUXNWGaHVfrwVbjSPguJSSIczJAZTRNviqLk+pZQoiqByc4imK6oRyol2PXuhySZMksNpxtoTDOwYZbQ1Zj/7ApFkYQmSO7qUrQ2w9kv1lG8IorgVexudbrCkwF2q4CnTkSazsnsI1T5aSOvE5xfFpeAKavjrvZStCxJa4efIk32MdycnLpn+3VRB/QUVrLyqhmCzD9Vlv5vMrb6fvp1AdSm4SnVCK32UrQ8SqPfS9lw/2ZiJUI77iLb/mSbssm25v9tHFidjIY7uiFOPT9Ndr+SOvhIUXaDoAj2oUbk5xIqragg2ehF6buGyQFFzR6HjGG6FsO9pH6U5/vtNfVENVK+Kt8pN2doAZWsDtD3bz8AHkQVzL1pggkh8NR5WXF1D5WklSFNiZSyEsD+CzF0zidx2Kk2JZUpmYykX4uj5VZxAnhCKQEr7WIeU6H6V+osqMDMmrQ/3ko5kpj0HW6ZF5eZSVl9fR7DZhzQt+yPmJtjxdkcppS33ZCwQ4Kt2s+KqGjLjWTpeGJxWZJpYUKSUNi/yOHdKyy4nJ6VEWOLEArO0V3pp2TKTu0Sn+YpqareUEaj3YhkWVtayieGyCa+6lGmPiULkxkIBZpR97PZWTi4UCpSuC7BaqycVzjLaOj69SFlALBxBJAhdoXRtgKrTSnIrq71VGimT8c4EicG0TYSJBU4TuEM6vloPvko3KPntIEKBdNSg/90w0bY4ljFzW82t4K/zEGjwomgCy5AIXVB7TjmDH0QY2p097keREjSPSsOFFfjrPMgJQV8RZBMmse4E2ZiJRB5dWCWoboVggxd3mcuegFkLza/SeGkVg7ujJPpThRdMZ9tdbqEKNHjx1XlxBTRMw5bPrKwkPpgiGc5gZS0yYwapkQxCndpcIC0YbY0hNDGjDIIERVPwVLgINXvR/SrSsmXE0EofNWeXEutJkIkZ855ba8EIIi2J7tUoXRtA96mTW6SZsRjYMUrbc/1koseUIBYCzasSbPBSf3EF1aeX2mdXhxwRqiA5nKbjhYFpV7RPXK8IvFVumq+oovrsMjS3isxKXCU6Jav9hD8ex0iZn/oo0pR46z2UrvFPnq2FIkhHs7Q/O8DIR1GycfNTq7XqUihZ5Wf1DXX467y5musSf52HklV+4n2pJecsoHpVtNzsVhRBrDdF/45RRg+MkwpnMNMW0rTIxs1Pyl2KrZgZ3DnKyEcnSHwtAUWgBzSqzyih+YpqvJW2zCUElKwN4ArpZMaNeX/fhSOIBFVX8FZMSaKQm0T9O0YZPRhDdSnHbRjrTmIkTbwVbkpW+5FZ5/peaUgyY8b0GpOp12JrdYQCoRV+Ao3eyYu8FW5bhZn8dFZyaUk8ZTp6QGPi8K2ogsihGF2vD5IezU57Xo71JQk2ewk0eCdlFWVinJaiGTdn0xGKYKwjwZGn+xncGSEbN6asXAKhHl8bZyRNsvHjZ3Y/9lskh9KkR9OUrPTjKXNNniDcodxYL8D4LKwMIviErl8IMFMWmWgWVRNHdfTHNLIMyXhPkvGuBKVr8qx1OCHUHu//JoxW8ujzSCFIDqUxpn5Eia2J0sR0t/i0Fk6B5HAaI2Wi6Mq0BLEMi+RQZvI+kNP0LYLO3ykUVSHel6Tt2X763hlBZmVubJzt0scl/rHfAkCFbNwkM5bFsuwdy77/lLkyz3LIwqt5p/v7DC8pFDDTJpnY3LbUCcOkbQgUKC6B5lKPanVy9hndr8Ex5fSENkO1VjHNhLbIaQlmOBNO+95L00tZUQXpSIauV4bof3cUadixOXlD2oqNCVWvogtUt70ITdh0pQSh2cbHxVouloariYO3lxZ52UA+3dZC86n4az0E6r14Kty4AhqaT0HRjgo2UoLmVfFWuvNTKR9XjbsIYzmPEIrASFv0vxeme/uwvTvOghx2wBv4qm2FiK/ajbvUNjKqbuWo0wOAEJSs9ttG1kVYM5YGQeYR0pQouqBsYwnVZ5dRutqPp1xH82m2alKZ2beoiBykbU/KjGcJf2wL5Ko7TyEgt0P76z3UnF1G+cYgvmoPrqBmq4aXYH6Bk5og0pToPpWGiytpuLSSQIPX/qjyBJqwY87DRRyFNKTt0pJ3Q/u3ylNCNH+hhoqNQfSAhhDi6FhP6yazeN/ipCWItOydo+6iClZdX4e3ym0bHHPx7EI96px4PMybZ+9yh5jykwcsQ1K+MciarfVUbAyCIuwjc86yblkSmZXHN1zm4a1caJy8BDElJS1BGi+uwlftxsyphoUqSAykiRyKEe9LkY0ZR2Pac+1cIZ3GSyrx1bgde8kWMT0sQ+Iu1Wm4qILyDUEQNjkU1TakRg7HGO9KkhpNY2WmOFxKQIG6c8spXRv4DHnzzjMmHe02Bwk2eifdVIQqiLTGaH9+gNED4xhJM/d/R1cty5D4atxUn16Cr9ZD8Zw1d0hLUrLK9jVTdGXSNSU1mqHz5SH63w2TjmY/4d5ut7N3l1Cjj5I1gUXZ0E9Sgkhc5S4CjT5Uj2J7f6qCdCSbU0/aruFCJbdaTfFizcVxLIMCrMsD0lYNBxp9eMpd9rEq52Yy+EGE7teGSA6ljzo4Tj1KWRJrkYvhnrwECep4ylz2wOd8huJ9tgu2lbFQXMfXwMicW/tS06YsV0gpUXTbG9tWkNhW+GzcIHI4Tmo0i9CU4xoP5SLKHhNYGs4MTlcIp2MlZS66TXxCp56JGRgZ85jApeM0X+o7yLGPP507/adebBGe1bKdMjWfOuktLRSBmbZIj2eRubiUaR95QsO1SN9jQQky7cp8oqRvOT8uzaV+qtlM9zoWqpbLAj/d7M+5uus+9fh+YfMEebyXn2bllKb9M3UQVK/qyBmT4ynm8nSXz/vdpgrck/9o7+iqpsz4EaWRW+jcirP3mwcs2CyYiOswUtakKk9KcAU0fDUezKxlx4PnYpwnf0w7yk8PqPiqp9YAlJgZOxYh99dP3MzM2vEYMhdlKy2Jv95ru6NLWxifeh/7WknZugCrrqnFV+OZ+6qVs6d84n2m/FiGhRAKgQbfJ+4lwI4R+XR+BYyEgZk2JhcViR01GVrpmxyPT4xhbvykkPhrPXa4rZVzu5d2WKuRnL/go4lwhmzchFx4g5ULSQ6t9KF5lcmxnzouZsbCXeZi5VU1lG8I2vLiSW1Jz7m2x/tTk6pTaeVUqpdWYRkWsa6knTlxSmis6lbwlLuoO7ecktV+W+uU6zA1miU9mkU55usqqiATyZIcyiBbbKHQMiXeShcrr6pFUQSjrTHMtH02Ud0K/jovFZtCVJ1eQrDJh6orc87aKFSBqipI8ekQUSFy7txnllFzZunkoiGEsMdpMD0ZNz4VmZhJvD9NaFWACYa4QhprttbjCuqMdybIxg079kXY2jw9oBFq9tJ0aRWqS50MDbZSFvG+FGZOqzQvn13Y8SLJkTTZhGl74eaUJnXnl2MkTQZ2jJKKZm0CaQreMp2StQGqTy+lrCWAHtROfkOhEIJs0iRyKEY6msEV0nNbKJS1+PFVN5EZMzANC2lMTBZ7kul+FXepC92n5s6sAitjMdaRIDmc/pSznFAEmTGDaFuc6jNK0APa5IQp3xDAV+0mOZQmE7edH3W/iqfUhadMR/OpIB1E2p0AVlZSeUoIV8lK+wQjjvoSCSHtUNugjq/KjR46OgGEAuOdcaJH4sc9Vphpi6E9UarPLkNR7OcUiqC8JYC/2k16zMDMmEjz6PipLgVXSMdVok8hIqRGM4zsH7dlGNXZe+X/4e2FcOxInMRAmtKQbu9wpsRb5WbVtbXUnF1GKpLFMiw0r4o7ZCtY9KDtDrSY6WXnThDH0Uv2EStyOEb/u6OsuLJm0r9fqAJvpRtv5UxllOXkcUmogujhGEO7IxhJczLVzNR7WaZkaHeE8vVBaraU2QJi7l6+aje+iaQHOavwpLZE5oRG6TyVznGf1rLDi701xy/pNhEKPHEt2Dr/TNSg46VBMpHMpwlin4sY3htlcGeE+vPLsbI5QVYReCrceCqmH8MJgVfRBEbKov/dMJFDsXk3wCmaQrQjwcAHYfx1bnR/bsGS2MQNaZOKEaEc/RYyt4VOfLtZfok5PfvcCCKEXTDT6eW5lb3zpUE0r0rdeeV2YoPciiJnbGsHEiElkdYYh5/sI3I4ZruhH++jqIJ4f4ojT/aBAtVnlqK6lEnZw74o13fuF0UVSAMibXF0v4a3XJ8iLM8mIH4GdXEu55dQjuaSivelaHuqj4EPIkwrvQpIR7Mc/lMvSKg5u/ToGFpy+sCw3PsJRZCKZOh+fZjOlwaxsta8E0Qodo6rnu0jqC6Vpsur7DRME3nR5JSxmvizIuyIxZ4kZtrCV+OeneJEzG1rnBNBFF3HW1eLEApCWs6mkIRYT5LWh7qJHo5TfVYpgXoPrpCeI8BxmliSbMIgMZggvH+cgR1hom2JXPqXGWI0EETb4xz8YzfRI3GqTiux81SFNMSUcFAra5GNZIgPpBnaE2XkozFWXVeLv7o8l0FEmdUZ3U66Ns1HFblox3GD5HCa0QPjDHwQIXokjpk1T6j/H+9OcOD3XYT3j1F9Rin+ejv/lub+dG6xCWE8Fc4QbU8w+MEoI/vHyY4bM5NDTCT0s99B0ew/z0agF4ptOW9/tp+xriS1W8ooXR3AU6qjuKasJLmiSMlwhkjrOD1vjFCxOcSq62pRXKpNdM2Zn5yCJLCyaU7lp+dIEA1vYz1KqBQRDTsjSG6VSAyl6Xp1kMFdEbyVLtylJyBI3M6PlApnMJLmZNCTk3vF+pKkns/Q/14YX6Xb3taDGopLyYWAGqTHDFLDafssnLFof26Aod3RyeNXciSNkTBOaEOZHBtNMLQ7St874WmfTRqSTMwgNZwhFcmQTZi2S4yTe+TGsPv1IQZ3RfBUuOzEbZ7jEcTWfqXCGZLhjJ1AwrRmvI9QBUbSovu1IUYPxiZ3OyNhMNaRmFUciFAEmZjJ4I4wkYPjeKs9eErtb6H5VHuhiptkxg1SI2lSo1ky0SyZuEFiMI2qC2QuCjXem5rx+wtAai5CGzegetzOH/IYzIkgQlXx1tURXNdCZMfbzjODiqPamsRgynY1UGwr9nFNAhxVl0IudYzjc529kxgpE6PPJDGQttvn0gBZpgRrwr3kaJrL6OEY0SPxo3E7ciIS0enYCOK9SXrfG0FmZM6t+9iXwk7UMOW9HCvec4uumZUkh9MkRzI5g5s43qWfHr8TkFAIe2cdPRRn9HB8MqfZ1Jj02WAiqUUqnCEdyR7dpVQxmV5o4mdiHBMDKZKDafve4uj7zAQF8DU1E1q7GkXXZ/WsUAAh3V1ZTs3nLyP83p/z9s+YHOSJ3EvT7EEToQJzMRZNvZclbVJMnnePvYZpnifP20vL3iWkKY8azPh0l3N6r6n+S9OM4ZzGzzra45Qgv7lhIkQ55yf6iRgTcZxnlWBZ+X0LAVRfdime6uo5PfCcDYWaz0f1pRdTsvm02bNtUpM0/U/BXDmn9qtM6VvMcN1s7z8xeRUx/+91nGcuyH2O19d8PK9yzPc49tI83kUF3HVNNFx3FXpJcE6POGeCCEUhsHoFK795M4ovuEScu4r4rEIAUiisuO0bhDauR6hz02IVZD5rXi81n/8cTV//ymyCzYoooiAQgCIl9TfcQOPW69GDgTn3WRhLuhB4qipZ851vYmUNev74EGYmiTn3npcNbKt1Tu2eq/WxWA52n0WoAEKh7vrraPnR9/E11hfkPFgwVxOhKPiaGln/o+8TaG6i/bf3kezpRAqBJeViudIsGIykrSHTvHYWR9WlkBnLzpiguYi5QxECRUrcFTU0fuOrNH/tJvxNjdPbn/KEkHN1OjoWUpKNxYnu20/vE88w8PKrxHs6URBMmBJPuikjc/5c5a7crmH7TKTHsnZRnCIKhkmNo+3khae2gapLL6bxhusoPe0UXKUlBdUkFJ4gOUjTJBMZI9HTy+iuPQz/+R3GWg+R6u3BiI/bNo+TCXLylykQn/itiLlBSIkeCOKqqSW4ZjUV555D+Zln4F/RhKusFEUrvO/tvBFkAtKSWOkURjyBmc4gjSzSylV+Odlw7FCebIvAokMiFBWhaahuF6rXh+rxfMJtqNCYd4IUUcRyRtFsUUQRM6BIkCKKmAFFghRRxAwoEqSIImZAkSBFFDEDigQpoogZUCRIEUXMgCJBiihiBhQJUkQRM6BIkCKKmAFFghRRxAwoEqSIImbA/w8S7hOAeL40gQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNC0wOC0yMFQwMTo1NDowNyswOTowMObA5TQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTQtMDgtMjBUMDE6NTQ6MDcrMDk6MDCXnV2IAAAAAElFTkSuQmCC"
)
