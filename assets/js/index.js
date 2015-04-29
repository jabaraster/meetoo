(function($) {
"use strict";

var Page = React.createClass({displayName: "Page",
    statics: {
        getAllItems: function(successHandler) {
            $.ajax({
                url: "/items/",
                type: "get",
                data: { category: Page.urlVars["category"], hall: Page.urlVars["hall"] },
                success: function(response) {
                    successHandler(response);
                }.bind(this),

                fail: function() {
                    console.log(arguments);
                }
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

            editorData: {},
            editorVisible: false
        };
    },
    componentDidMount: function() {
        Page.getAllItems(function(response) {
            this.setState({ items: response });
        }.bind(this));
    },
    handleAddClick: function() {
        this.setState({ editorVisible: true, editorData: {} });
    },
    handleItemEditClick: function(e) {
        this.setState({ editorVisible: true, editorData: e.data });
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
        Page.getAllItems(function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    handleUpdate: function() {
        Page.getAllItems(function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    handleFilter: function(e) {
        console.log(e);
    },
    handleLoadCategories: function(e) {
        this.setState({ categories: e.data });
    },
    render: function() {
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement(Menu, {onFilter: this.handleFilter, 
                      onLoadCategories: this.handleLoadCategories}
                ), 
                React.createElement(ItemList, {items: this.state.items, 
                          onAddClick: this.handleAddClick, 
                          onItemEditClick: this.handleItemEditClick, 
                          onItemRemoveClick: this.handleItemRemoveClick}
                ), 
                React.createElement(ItemEditor, {data: this.state.editorData, 
                            visible: this.state.editorVisible, 
                            categories: this.state.categories, 
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
