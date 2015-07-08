# ポータブル見積ツール meetoo


# 64bit環境のWindows7へのインストール手順

## 基本方針
32bit版バイナリを吐くように構成する.

64bit版はSQLite周りがうまく動かないので.


## Goインストール
### 本家の説明サイト
[http://golang-jp.org/doc/install](http://golang-jp.org/doc/install)

### インストーラダウンロードページ
[http://golang.org/dl/](http://golang.org/dl/)

※___必ず32bit版をダウンロードすること___

ZIPをダウロードして```c:¥go```に展開すること.


### 環境変数設定
環境変数```PATH```に```c:¥go¥bin```を追加すること.

更に、任意のフォルダを作成して（例えば```c:¥gopath```）パスを環境変数```GOPATH```に設定すること.  
(これで作成したフォルダにGoのライブラリが格納されるようになる)

## Gitインストール
GoのライブラリをGitHubからダウンロードするのに必要

### インストーラダウンロードページ
[http://git-scm.com/download](http://git-scm.com/download)


※インストールに際してはコマンドプロンプトで使えるようにすること！  
![コマンドプロンプト対応でインストール](./docimage/git_install_prompt.png "コマンドプロンプト対応でインストール")


## 少し寄り道・meetooの起動
ここまで来れば、コンパイルせずとも```go run```コマンドでmeetooを起動することが出来る.  
コマンドプロンプトで下記のコマンドを実行すること.

### 必要なライブラリの取得

```
go get github.com/lib/pq
```

```
go get github.com/mattn/go-sqlite3
```

```
go get github.com/naoina/genmai
```

```
go get github.com/vincent-petithory/dataurl
```

```
go get github.com/zenazn/goji/web
```


### meetooのソースの取得

```
go get github.com/jabaraster/meetoo
```

### 起動
```
cd %gopath%\src\github.com\jabaraster\meetoo
set MEETOO_MODE=production
go run src\main.go
```

以下のURLにアクセス.

[http://localhost:8000/](http://localhost:8000/)


## gccインストール
MinGWとiいうソフトウェアでgccをインストールする.

### インストーラダウンロードページ
[http://sourceforge.net/projects/mingw/files/Installer/](http://sourceforge.net/projects/mingw/files/Installer/)

```mingw-get-setup.exe```をクリックしてインストーラをダウンロードすること.

インストーラの実行にはインターネット接続が必要.

また上記ファイルはインストーラではあるが、基本的なファイルをインストールした後、追加でgccをインストールする必要がある.  
GUIで、```mingw32-gcc-g++```にチェックを付けた後、メニューの「Installation」→「Apply」を選択すると、インストールが始まる.
![gccの追加インストール](./docimage/mingw_setup.png "gccの追加インストール")

### 環境変数設定

環境変数```PATH```に```c:¥MinGW¥bin```を追加すること.

## zlib1.dllインストール
このdllはCのソースをGoから使うときに必要なようだが、Goに含まれていないため、別途インストールが必要.

[https://ljedit.googlecode.com/files/zlib1.zip](https://ljedit.googlecode.com/files/zlib1.zip)

解凍して現れる```zlib1.dll```を```c:¥MinGW¥bin```に置く.

[参考ページ(Yahoo!知恵袋)](http://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q10140858135)

## Goのライブラリをインストール
```
set GOARCH=386
go get ...
```

## ビルドコマンド
```
set GOARCH=386
go build -o meetoo.exe src¥main.go
```

## 起動
```
set MEETOO_MODE=production
meetoo.exe -bind=:8081
```

## 利用

ブラウザで次のURLを開く  

```
http://localhost:8081
```
