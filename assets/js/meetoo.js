(function($) {
"use strict";

var EstimateItem = React.createClass({displayName: "EstimateItem",
    getInitialState: function() {
        return {
            data: this.props.data
        };
    },
    handleAmountChange: function(e) {
        this.state.data.amount = e.target.value - 0;
        this.setState({ data: this.state.data }, function() {
            if (this.props.onAmountChange) this.props.onAmountChange();
        });
    },
    handleItemRemoveClick: function() {
        if (this.props.onItemRemoveClick) this.props.onItemRemoveClick({ data: this.props.data });
    },
    render: function() {
        return (
            React.createElement("tr", null, 
                React.createElement("td", null, 
                    React.createElement("button", {className: "btn btn-sm", onClick: this.handleItemRemoveClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-trash"})
                    )
                ), 
                React.createElement("td", null, this.state.data.name), 
                React.createElement("td", null, String(this.state.data.unitPrice).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')), 
                React.createElement("td", null, React.createElement("input", {type: "number", min: "0", value: this.state.data.amount, onChange: this.handleAmountChange}))
            )
        );
    }
});

var Estimate = React.createClass({displayName: "Estimate",
    computeTotalPrice: function() {
        var ret = 0;
        this.props.data.forEach(function(item) {
            var i = item.unitPrice * item.amount - 0;
            ret += i;
        });
        return ret;
    },
    handleAmountChange: function() {
        if (this.props.onAmountChange) this.props.onAmountChange();
    },
    handleItemRemoveClick: function(e) {
        if (this.props.onItemRemoveClick) this.props.onItemRemoveClick(e);
    },
    render: function() {
        var items = this.props.data.map(function(item) {
            return (
                React.createElement(EstimateItem, {data: item, 
                              key: "EstimateItem_"+item.id, 
                              onAmountChange: this.handleAmountChange, 
                              onItemRemoveClick: this.handleItemRemoveClick}
                )
            );
        }.bind(this));
        var total = this.computeTotalPrice();
        return (
            React.createElement("div", {className: "Estimate col-md-6"}, 
                React.createElement("div", {className: "table-responsive"}, 
                    React.createElement("table", {className: "items table table-striped table-bordered table-condensed"}, 
                        React.createElement("thead", null, 
                            React.createElement("tr", null, 
                                React.createElement("th", null), 
                                React.createElement("th", null, "名称"), 
                                React.createElement("th", null, "単価"), 
                                React.createElement("th", null, "数量")
                            )
                        ), 
                        React.createElement("tbody", null, 
                            items
                        )
                    )
                ), 
                React.createElement("div", null, 
                    "計：", React.createElement("span", {className: "total"}, (total+"").replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')), " 円"
                )
            )
        );
    }
});

var Page = React.createClass({displayName: "Page",
    statics: {
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
            var vars = [];
            var max = 0;
            var hash = '';
            var array = '';
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

            estimateItems: []
        };
    },
    componentDidMount: function() {
        Page.getItems({}, function(response) {
            this.setState({ items: response });
        }.bind(this));
    },
    handleItemClick: function(e) {
        var listed = null;
        this.state.estimateItems.forEach(function(item) {
            if (item.id === e.data.id) {
                listed = item;
            }
        });
        if (listed) {
            listed.amount++;
        } else {
            e.data.amount = 1;
            this.state.estimateItems.push(e.data);
        }
        this.setState({ estimateItems: this.state.estimateItems });
    },
    handleEstimateItemRemoveClick: function(e) {
        var idx = -1;
        this.state.estimateItems.forEach(function(item, i) {
            if (item.id === e.data.id) {
                idx = i;
                return false;
            }
        });
        if (idx < 0) {
            return;
        }
        this.state.estimateItems.splice(idx, 1);
        this.setState({ estimateItems: this.state.estimateItems });
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
    handleAmountChange: function() {
        this.setState({ estimateItems: this.state.estimateItems });
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
                          cols: "6", 
                          onItemClick: this.handleItemClick}
                ), 
                React.createElement(Estimate, {data: this.state.estimateItems, 
                          onAmountChange: this.handleAmountChange, 
                          onItemRemoveClick: this.handleEstimateItemRemoveClick}
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
