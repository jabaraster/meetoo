(function($) {
"use strict";

var Page = React.createClass({
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
//        getItems: function(parameter, successHandler) {
//            $.ajax({
//                url: '/items/',
//                type: 'get',
//                data: { hall: parameter.selectedHall, categories: parameter.selectedCategories },
//                success: function(response) {
//                    successHandler(response);
//                },
//                fail: function() {
//                    console.log(arguments);
//                },
//                complete: null
//            });
//        },
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

            editorData: {},
            belongHallIds: [],
            editorVisible: false
        };
    },
    componentDidMount: function() {
        Page.getAllItems(function(response) {
            this.setState({ items: response });
        }.bind(this));
    },
    handleAddClick: function() {
        var belongHallIds = this.state.halls.map(function(hall) {
            return hall.id
        });
        this.setState({ editorVisible: true, editorData: {}, belongHallIds: belongHallIds });
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
            },
            complete: function() {}
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
    handleLoadHalls: function(e) {
        this.setState({ halls: e.data });
    },
    render: function() {
        return (
            <div className="Page container">
                <Menu onFilter={this.handleFilter}
                      onLoadCategories={this.handleLoadCategories}
                      onLoadHalls={this.handleLoadHalls}
                />
                <ItemList items={this.state.items}
                          onAddClick={this.handleAddClick}
                          onItemEditClick={this.handleItemEditClick}
                          onItemRemoveClick={this.handleItemRemoveClick}
                />
                <ItemEditor data={this.state.editorData}
                            visible={this.state.editorVisible}
                            categories={this.state.categories}
                            halls={this.state.halls}
                            belongHallIds={this.state.belongHallIds}
                            onCloseClick={this.handleEditorCloseClick}
                            onInsert={this.handleInsert}
                            onUpdate={this.handleUpdate}
                />
            </div>
        )
    },
});

React.render(
    <Page />,
    document.getElementById('page')
);

})(jQuery);
