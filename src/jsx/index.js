(function($) {
"use strict";

var ItemEditor = React.createClass({
    getInitialState: function() {
        return {
            id: this.props.data.id,
            name: this.props.data.name,
            unitPrice: this.props.data.unitPrice,
            description: this.props.data.description,
            url: this.props.data.id ? '/items/' + this.props.data.id + '___' + this.props.data.imageTimestamp + '/image' : '/img/unset.png',

            messageVisible: false,
            messageText: '',
            indicatorFor: null,
            indicatorActive: false
        };
    },
    handleCloseClick: function() {
        if (this.props.onCloseClick) this.props.onCloseClick({});
    },
    handleNameChange: function(e) {
        this.setState({ name: e.target.value });
    },
    handleUnitPriceChange: function(e) {
        this.setState({ unitPrice: e.target.value });
    },
    handleDescriptionChange: function(e) {
        this.setState({ description: e.target.value });
    },
    handleFileSelect: function(files) {
        if (files.length === 0) return;
        var fr = new FileReader();
        $(fr).on("load", function(e) {
                this.setState({
                    url: e.target.result,
                    indicatorActive: false,
                });
        }.bind(this));
        this.setState({ indicatorFor: React.findDOMNode(this.refs.image), indicatorActive: true });
        fr.readAsDataURL(files[0]);
    },
    handleDragOver: function(e) {
        this.cancel(e);
    },
    handleDrop: function(e) {
        try {
            if (!e.dataTransfer) return;
            var files = e.dataTransfer.files;
            if (!files) return;
            this.handleFileSelect(files);

        } finally {
            this.cancel(e);
        }
    },
    handleSubmit: function(e) {
        var name = React.findDOMNode(this.refs.name).value;
        var unitPrice = React.findDOMNode(this.refs.unitPrice).value;
        var imageDataUrl = $(React.findDOMNode(this.refs.image)).attr("src");
        if (imageDataUrl.indexOf('data:') !== 0) {
            imageDataUrl = 'noop';
        }
        var desc = React.findDOMNode(this.refs.description).value;
        var url = this.state.id ? "/items/" + this.state.id : "/items/";
        this.setState({ indicatorFor: React.findDOMNode(this.refs.form), indicatorActive: true });
        $.ajax({
            url: url,
            type: "post",
            data: { name: name, unitPrice: unitPrice, imageDataUrl: imageDataUrl, description: desc },
            success: function(response) {
                if (response.status !== 'OK') {
                    this.setState({
                        messageVisible: true,
                        messageText: response.message,
                        indicatorActive: false
                    });
                    return;
                }
                this.setState({ visible: false, indicatorActive: false });
                if (response.operation === "INSERT") {
                    if (this.props.onInsert) this.props.onInsert({});
                } else {
                    if (this.props.onUpdate) this.props.onUpdate({});
                }
            }.bind(this),
            fail: function() {
                this.setState({ indicatorActive: false });
                console.log(arguments);
            },
            complete: function() {
            }.bind(this)
        });
        e.preventDefault();
    },
    cancel: function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    componentDidUpdate: function(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            this.setState({
                id: this.props.data.id,
                name: this.props.data.name,
                unitPrice: this.props.data.unitPrice,
                description: this.props.data.description,
                url: this.props.data.id ? '/items/' + this.props.data.id + '___' + this.props.data.imageTimestamp + '/image' : '/img/unset.png',
            });
        }

        if (this.props.visible) {
            $('.item-editor-dialog').modal('show');
        } else {
            $('.item-editor-dialog').modal('hide');
        }
    },
    render: function() {
        var imageSet = !!this.state.url;
        return (
            <div className="ItemEditor">
              <div className="item-editor-dialog modal fade">
                <Message visible={this.state.messageVisible} text={this.state.messageText} />
                <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button className="close" onClick={this.handleCloseClick} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className=".item-editor-dialog-title modal-title">アイテム編集</h4>
                      </div>
                      <div className="modal-body">

                        <form className="item-edit-form"
                              ref="form"
                              onDragOver={this.handleDragOver}
                              onDrop={this.handleDrop}
                        >
                            <div className="form-group">
                                <input type="text"
                                       ref="name"
                                       className="item-name form-control"
                                       value={this.state.name}
                                       onChange={this.handleNameChange}
                                       placeholder="アイテム名"
                                />
                            </div>
                            <div className="form-group">
                                <input type="number"
                                       ref="unitPrice"
                                       className="form-control"
                                       value={this.state.unitPrice}
                                       onChange={this.handleUnitPriceChange}
                                       placeholder="単価"
                                />
                            </div>
                            <div className="form-group">
                                <textarea className="item-description form-control"
                                          ref="description"
                                          placeholder="説明"
                                          onChange={this.handleDescriptionChange}
                                          value={this.state.description}
                                />
                            </div>
                            <div className="form-group">
                                <img src={this.state.url}
                                     className="item-image"
                                     ref="image"
                                />
                                {!imageSet ?
                                <span>画像をドラッグ＆ドロップ</span>
                                :null }
                                <Indicator buttonRef={this.state.indicatorFor} active={this.state.indicatorActive} />
                            </div>
                        </form>

                      </div>
                      <div className="modal-footer">
                        <button className="item-editor-close-button btn btn-default" onClick={this.handleCloseClick}>
                            <i className="glyphicon glyphicon-remove" />
                            キャンセル
                        </button>
                        <button className="btn btn-primary" onClick={this.handleSubmit}>
                            <i className="glyphicon glyphicon-ok" />
                            変更を保存
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
        );
    }
});

var Item = React.createClass({
    handleClick: function(e) {
        if (this.props.onEditClick) this.props.onEditClick({ data: this.props.data });
    },
    handleRemoveClick: function(e) {
        try {
            if (this.props.onRemoveClick) this.props.onRemoveClick({ data: this.props.data });
        } finally {
            e.preventDefault();
            e.stopPropagation();
        }
    },
    render: function() {
        var imageUrl;
        if (this.props.data.id) {
            imageUrl = '/items/' + this.props.data.id + '___' + this.props.data.imageTimestamp + '/image';
        } else {
            imageUrl = '/img/unset.png';
        }
        return (
            <div className="Item">
                <div className="tool-box">
                    <button className="btn" onClick={this.handleClick}>
                        <i className="glyphicon glyphicon-pencil" />
                    </button>
                    <button className="btn" onClick={this.handleRemoveClick}>
                        <i className="glyphicon glyphicon-remove-sign" />
                    </button>
                </div>
                <fieldset className="fields">
                    <legend>
                        <span className="item-name">{this.props.data.name}</span>
                        <span className="item-unit-price">単価：{this.props.data.unitPrice}円</span>
                    </legend>
                    <img src={imageUrl} className="item-image" />
                    <p className="item-description">{this.props.data.description}</p>
                </fieldset>
            </div>
        );
    }
});

var ItemList = React.createClass({
    handleAddClick: function() {
        if (this.props.onAddClick) this.props.onAddClick();
    },
    handleItemEditClick: function(e) {
        if (this.props.onItemEditClick) this.props.onItemEditClick(e);
    },
    handleItemRemoveClick: function(e) {
        if (this.props.onItemRemoveClick) this.props.onItemRemoveClick(e);
    },
    render: function() {
        var items = this.props.items.map(function(item) {
            return (
                <li key={"item-list_" + item.id}>
                    <Item key={"item_" + item.id}
                          data={item}
                          onEditClick={this.handleItemEditClick}
                          onRemoveClick={this.handleItemRemoveClick}
                    />
                </li>
            );
        }.bind(this));
        return (
            <div className="ItemList col-md-9">
                <div className="tool-box">
                    <button className="btn btn-default tool-box-button" onClick={this.handleAddClick}>
                        <i className="glyphicon glyphicon-plus" />
                    </button>
                </div>
                <h2 className={this.props.items.length === 0 ? 'add-message' : 'hidden'}>アイテムを追加して下さい。</h2>
                <ul className="item-list">
                    {items}
                </ul>
            </div>
        );
    }
});

var Page = React.createClass({
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
    render: function() {
        return (
            <div className="Page container">
                <Menu onFilter={this.handleFilter} />
                <ItemList items={this.state.items}
                          onAddClick={this.handleAddClick}
                          onItemEditClick={this.handleItemEditClick}
                          onItemRemoveClick={this.handleItemRemoveClick}
                />
                <ItemEditor data={this.state.editorData}
                            visible={this.state.editorVisible}
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
