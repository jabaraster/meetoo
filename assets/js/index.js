(function($) {
"use strict";

var Page = React.createClass({displayName: "Page",
    statics: {
        getAllItems: function(successHandler) {
            $.ajax({
                url: '/items/',
                type: 'get',
                data: { category: Page.urlVars['category'], hall: Page.urlVars['hall'] },
                success: function(response) {
                    successHandler(response);
                }.bind(this),

                fail: function() {
                    console.log(arguments);
                }
            });
        },
        toArray: function(obj) {
            var ret = [];
            for (var p in obj) {
                ret.push(obj[p]);
            }
            return ret;
        },
        getItems: function(parameter, successHandler) {
            var categories = [];
            for (var p in parameter.selectedCategories) {
                categories.push(parameter.selectedCategories[p].id);
            }
            $.ajax({
                url: '/items/',
                type: 'get',
                data: {
                    hall: parameter.selectedHall ? parameter.selectedHall.id : null ,
                    categories: categories.join(',')
                },
                success: function(response) {
                    successHandler(response);
                },
                fail: function() {
                    console.log(arguments);
                },
                complete: null
            });
        },
        urlVars: function() {
            var vars = [], max = 0, hash = "", array = "";
            var url = window.location.search;

            //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
            hash  = url.slice(1).split('&');
            max = hash.length;
            for (var i = 0; i < max; i++) {
                array = hash[i].split('=');    //keyと値に分割。
                vars.push(array[0]);    //末尾にクエリ文字列のkeyを挿入。
                vars[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
            }

            return vars;
        }()
    },
    getInitialState: function() {
        return {
            items: [],
            categories: [],
            halls: [],

            selectedHall: null,
            selectedCategories: [],

            editorData: {},
            belongHallIds: [],
            editorVisible: false
        };
    },
    componentDidMount: function() {
        this.handleFilter({});
    },
    handleAddClick: function() {
        var belongHallIds = this.state.halls.map(function(hall) {
            return hall.id
        });

        // カテゴリが選択されている場合はそれを初期設定値にする.
        var categoryId;
        if (this.state.selectedCategories && this.state.selectedCategories.length > 0) {
            categoryId = this.state.selectedCategories[0].id;
        } else {
            categoryId = null;
        }
        this.setState({ editorVisible: true, editorData: { categoryId: categoryId }, belongHallIds: belongHallIds });
    },
    handleItemEditClick: function(e) {
        $.ajax({
            url: '/items/' + e.data.id + '/belong-hall-ids',
            type: 'get',
            success: function(data) {
                this.setState({ editorVisible: true, editorData: e.data, belongHallIds: data });
            }.bind(this),
            fail: function() {
                console.log(arguments);
            }
        });
    },
    handleItemRemoveClick: function(e) {
        if (!confirm('本当に削除しますか？')) {
            this.setState({ editorVisible: false });
            return;
        }
        var removeTarget;
        var newItems = [];
        this.state.items.forEach(function(item) {
            if (e.data.id !== item.id) {
                newItems.push(item);
            } else {
                removeTarget = item;
            }
        });
        $.ajax({
            url: '/items/' + removeTarget.id + '/remove',
            type: 'post',
            fail: function() {
                console.log(arguments);
            },
            complete: function() {
                this.setState({ items: newItems, editorVisible: false });
            }.bind(this)
        });
    },
    handleEditorCloseClick: function() {
        this.setState({ editorData: {}, editorVisible: false });
    },
    handleInsert: function() {
        Page.getItems(this.state, function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    handleUpdate: function() {
        Page.getItems(this.state, function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    handleFilter: function(e) {
        Page.getItems(e, function(response) {
            this.setState({
                items: response,
                editorData: {},
                editorVisible: false,
                selectedHall: e.selectedHall,
                selectedCategories: Page.toArray(e.selectedCategories)
            });
        }.bind(this));
    },
    handleLoadCategories: function(e) {
        this.setState({ categories: e.data });
    },
    handleLoadHalls: function(e) {
        this.setState({ halls: e.data });
    },
    render: function() {
        var selectedCategories = this.state.selectedCategories.map(function(c) {
            return c.name;
        });
        var selectedHall = this.state.selectedHall ? '会場：' + this.state.selectedHall.name : '' ;
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement(Menu, {editable: true, 
                      headerLinkHref: "/meetoo", 
                      headerLinkTitle: "見積へ", 
                      onFilter: this.handleFilter, 
                      onLoadCategories: this.handleLoadCategories, 
                      onLoadHalls: this.handleLoadHalls}
                ), 
                React.createElement("div", {className: "status"}, 
                    "フィルタ:", 
                    React.createElement("span", {className: "selected-hall"}, selectedHall), 
                    React.createElement("span", {className: "selected-categories"}, selectedCategories.join(','))
                ), 
                React.createElement(ItemList, {items: this.state.items, 
                          editable: true, 
                          onAddClick: this.handleAddClick, 
                          onItemEditClick: this.handleItemEditClick, 
                          onItemRemoveClick: this.handleItemRemoveClick}
                ), 
                React.createElement(ItemEditor, {data: this.state.editorData, 
                            visible: this.state.editorVisible, 
                            categories: this.state.categories, 
                            halls: this.state.halls, 
                            belongHallIds: this.state.belongHallIds, 
                            onCloseClick: this.handleEditorCloseClick, 
                            onInsert: this.handleInsert, 
                            onUpdate: this.handleUpdate}
                )
            )
        )
    },
});

React.render(
    React.createElement(Page, null),
    document.getElementById('page')
);

})(jQuery);
