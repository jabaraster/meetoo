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
        };
    },
    componentDidMount: function() {
        Page.getItems({}, function(response) {
            this.setState({ items: response });
        }.bind(this));
    },
    handleFilter: function(e) {
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
            React.createElement("div", {className: "Page container"}, 
                React.createElement(Menu, {editable: false, 
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
                          editable: false, 
                          cols: "6"}
                ), 
                React.createElement("div", {className: "col-md-6", style: { background: 'rgba(255,0,0,.3)', height: '500px'}}
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
