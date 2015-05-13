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
        getItems: function(parameter, successHandler) {
            var categories = [];
            for (var d in parameter.selectedCategories) {
                categories.push(parameter.selectedCategories[d].id);
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
        console.log(e);
        Page.getItems(e, function(response) {
            this.setState({
                items: response,
                editorData: {},
                editorVisible: false,
                selectedHall: e.selectedHall,
                selectedCategories: e.selectedCategories
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
        var selectedCategories = [];
        for (var p in this.state.selectedCategories) {
            selectedCategories.push(this.state.selectedCategories[p].name);
        }
        var selectedHall = this.state.selectedHall ? '会場：' + this.state.selectedHall.name : '' ;
        return (
            <div className="Page container">
                <Menu editable={true}
                      headerLinkHref="/meetoo"
                      headerLinkTitle="見積へ"
                      onFilter={this.handleFilter}
                      onLoadCategories={this.handleLoadCategories}
                      onLoadHalls={this.handleLoadHalls}
                />
                <div className="status">
                    フィルタ:
                    <span className="selected-hall">{selectedHall}</span>
                    <span className="selected-categories">{selectedCategories.join(',')}</span>
                </div>
                <ItemList items={this.state.items}
                          editable={true}
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
