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
    render: function() {
        return (
            <tr key={"estimateItem_" + this.state.data.id}>
                <td>{this.state.data.id}</td>
                <td>{this.state.data.name}</td>
                <td>{String(this.state.data.unitPrice).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}</td>
                <td><input type="number" min="0" value={this.state.data.amount} onChange={this.handleAmountChange} /></td>
            </tr>
        );
    }
});

var Estimate = React.createClass({
    computeSummaryPrice: function() {
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
    render: function() {
        var items = this.props.data.map(function(item) {
            return (
                <EstimateItem data={item} onAmountChange={this.handleAmountChange} />
            );
        }.bind(this));
        return (
            <div className="Estimate col-md-6">
                <div className="container">
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-condensed">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>名称</th>
                                    <th>単価</th>
                                    <th>数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    計：<span>{this.computeSummaryPrice(this.props.data)}</span> 円
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
            <div className="Page container">
                <Menu editable={false}
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
                          editable={false}
                          cols="6"
                          onItemClick={this.handleItemClick}
                />
                <Estimate data={this.state.estimateItems}
                          onAmountChange={this.handleAmountChange}
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
