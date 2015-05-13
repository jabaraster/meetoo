(function($) {
"use strict";

var EstimateItem = React.createClass({
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
            <tr>
                <td>
                    <button className="btn btn-sm" onClick={this.handleItemRemoveClick}>
                        <i className="glyphicon glyphicon-trash" />
                    </button>
                </td>
                <td>{this.state.data.name}</td>
                <td>{String(this.state.data.unitPrice).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}</td>
                <td><input type="number" min="0" value={this.state.data.amount} onChange={this.handleAmountChange} /></td>
            </tr>
        );
    }
});

var Estimate = React.createClass({
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
    handleClearAllClick: function() {
        if (this.props.onClearAll) this.props.onClearAll();
    },
    render: function() {
        var items = this.props.data.map(function(item) {
            return (
                <EstimateItem data={item}
                              key={"EstimateItem_"+item.id}
                              onAmountChange={this.handleAmountChange}
                              onItemRemoveClick={this.handleItemRemoveClick}
                />
            );
        }.bind(this));
        var total = this.computeTotalPrice();
        return (
            <div className="Estimate col-md-6">
                <div className="tool-box">
                    <button className="btn btn-default tool-box-button" onClick={this.handleClearAllClick}>
                        <i className="glyphicon glyphicon-trash" />
                    </button>
                </div>
                <table className="items table table-striped table-bordered table-condensed">
                    <thead>
                        <tr>
                            <th></th>
                            <th>名称</th>
                            <th>単価</th>
                            <th>数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
                <div>
                    計：<span className="total">{(total+"").replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}</span> 円
                </div>
            </div>
        );
    }
});

var Page = React.createClass({
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
        estimateItemsKeyForStorage: 'meetoo_estimateItemsKeyForStorage'
    },
    getInitialState: function() {
        var storage = sessionStorage;
        var itemsStr = storage.getItem(Page.estimateItemsKeyForStorage);
        var items;
        if (!itemsStr) {
            items = [];
        } else {
            items = JSON.parse(itemsStr);
        }
        return {
            items: [],
            categories: [],
            halls: [],

            selectedHall: null,
            selectedCategories: [],

            storage: storage,
            estimateItems: items
        };
    },
    componentDidMount: function() {
        this.handleFilter({});
    },
    saveToStorage: function() {
        this.state.storage.setItem(Page.estimateItemsKeyForStorage, JSON.stringify(this.state.estimateItems));
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
        this.saveToStorage();
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
        this.saveToStorage();
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
        this.saveToStorage();
        this.setState({ estimateItems: this.state.estimateItems });
    },
    handleClearAllEstimateItemClick: function() {
        if (!confirm('明細を全てクリアします。この操作は取り消せません。よろしいですか？')) return;
        this.state.estimateItems = [];
        this.saveToStorage();
        this.setState({ estimateItems: this.state.estimateItems });
    },
    render: function() {
        var selectedCategories = [];
        for (var p in this.state.selectedCategories) {
            selectedCategories.push(this.state.selectedCategories[p].name);
        }
        var selectedHall = this.state.selectedHall ? '会場：' + this.state.selectedHall.name : '' ;
        return (
            <div className="Page container">
                <Menu editable={false}
                      headerLinkHref="/"
                      headerLinkTitle="データ管理へ"
                      onFilter={this.handleFilter}
                      onLoadCategories={this.handleLoadCategories}
                      onLoadHalls={this.handleLoadHalls}
                />
                <div className="status">
                    フィルタ:
                    <span className="selected-hall">{selectedHall}</span>
                    <span className="selected-categories">{selectedCategories.join(',')}</span>
                </div>
                <Estimate data={this.state.estimateItems}
                          onAmountChange={this.handleAmountChange}
                          onItemRemoveClick={this.handleEstimateItemRemoveClick}
                          onClearAll={this.handleClearAllEstimateItemClick}
                />
                <ItemList items={this.state.items}
                          editable={false}
                          cols="6"
                          onItemClick={this.handleItemClick}
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
