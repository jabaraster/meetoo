(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var ItemEditor = React.createClass({displayName: "ItemEditor",
    getInitialState: function() {
        return {
            id: this.props.id,
            name: this.props.data.name,
            unitPrice: this.props.data.unitPrice,
            description: this.props.data.description,
            url: this.props.data.url,

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
                url: this.props.data.url,
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
            React.createElement("div", {className: "ItemEditor"}, 
              React.createElement("div", {className: "item-editor-dialog modal fade"}, 
                React.createElement(Message, {visible: this.state.messageVisible, text: this.state.messageText}), 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                      React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {className: "close", onClick: this.handleCloseClick, "aria-label": "Close"}, 
                            React.createElement("span", {"aria-hidden": "true"}, "×")
                        ), 
                        React.createElement("h4", {className: ".item-editor-dialog-title modal-title"}, "アイテム編集")
                      ), 
                      React.createElement("div", {className: "modal-body"}, 

                        React.createElement("form", {className: "item-edit-form", 
                              ref: "form", 
                              onDragOver: this.handleDragOver, 
                              onDrop: this.handleDrop
                        }, 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("input", {type: "text", 
                                       ref: "name", 
                                       className: "item-name form-control", 
                                       value: this.state.name, 
                                       onChange: this.handleNameChange, 
                                       placeholder: "アイテム名"}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("input", {type: "number", 
                                       ref: "unitPrice", 
                                       className: "form-control", 
                                       value: this.state.unitPrice, 
                                       onChange: this.handleUnitPriceChange, 
                                       placeholder: "単価"}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("textarea", {className: "item-description form-control", 
                                          ref: "description", 
                                          placeholder: "説明", 
                                          onChange: this.handleDescriptionChange, 
                                          value: this.state.description}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("img", {src: imageSet ? this.state.url : "/img/unset.png", 
                                     className: "item-image", 
                                     ref: "image"}
                                ), 
                                !imageSet ?
                                React.createElement("span", null, "画像をドラッグ＆ドロップ")
                                :null, 
                                React.createElement(Indicator, {buttonRef: this.state.indicatorFor, active: this.state.indicatorActive})
                            )
                        )

                      ), 
                      React.createElement("div", {className: "modal-footer"}, 
                        React.createElement("button", {className: "item-editor-close-button btn btn-default", onClick: this.handleCloseClick}, 
                            React.createElement("i", {className: "glyphicon glyphicon-remove"}), 
                            "キャンセル"
                        ), 
                        React.createElement("button", {className: "btn btn-primary", onClick: this.handleSubmit}, 
                            React.createElement("i", {className: "glyphicon glyphicon-ok"}), 
                            "変更を保存"
                        )
                      )
                    )
                )
              )
            )
        );
    }
});

var Item = React.createClass({displayName: "Item",
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
        return (
            React.createElement("div", {className: "Item", onClick: this.handleClick}, 
                React.createElement("div", {className: "tool-box"}, 
                    React.createElement("button", {className: "btn", onClick: this.handleRemoveClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-remove-sign"})
                    )
                ), 
                React.createElement("fieldset", {className: "fields"}, 
                    React.createElement("legend", null, 
                        React.createElement("span", {className: "item-name"}, this.props.data.name), 
                        React.createElement("span", {className: "item-unit-price"}, "単価：", this.props.data.unitPrice, "円")
                    ), 
                    React.createElement("img", {src: this.props.data.url ? this.props.data.url : "/img/unset.png", className: "item-image"}), 
                    React.createElement("p", {className: "item-description"}, this.props.data.description)
                )
            )
        );
    }
});

var ItemList = React.createClass({displayName: "ItemList",
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
                React.createElement("li", {key: "item-list_" + item.id}, 
                    React.createElement(Item, {key: "item_" + item.id, data: item, 
                          onEditClick: this.handleItemEditClick, 
                          onRemoveClick: this.handleItemRemoveClick}
                    )
                )
            );
        }.bind(this));
        return (
            React.createElement("div", {className: "ItemList col-md-9"}, 
                React.createElement("div", {className: "tool-box"}, 
                    React.createElement("button", {className: "btn btn-default tool-box-button", onClick: this.handleAddClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-plus"})
                    )
                ), 
                React.createElement("ul", {className: "item-list"}, 
                    items
                )
            )
        );
    }
});

var Page = React.createClass({displayName: "Page",
    statics: {
        getAllItems: function(successHandler) {
            $.ajax({
                url: "/items/",
                type: "get",
                success: function(response) {
                    successHandler(response);
                }.bind(this),

                fail: function() {
                    console.log(arguments);
                }
            });
        }
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
    render: function() {
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-md-3"}, 
                        "メニュー", 
                        React.createElement(Menu, null)
                    ), 
                    React.createElement(ItemList, {items: this.state.items, 
                              onAddClick: this.handleAddClick, 
                              onItemEditClick: this.handleItemEditClick, 
                              onItemRemoveClick: this.handleItemRemoveClick}
                    )
                ), 
                React.createElement(ItemEditor, {data: this.state.editorData, 
                            visible: this.state.editorVisible, 
                            onCloseClick: this.handleEditorCloseClick, 
                            onInsert: this.handleInsert, 
                            onUpdate: this.handleUpdate}
                )
            )
        )
    },
});

var MenuItem = React.createClass({displayName: "MenuItem",
    render: function() {
        return (
            React.createElement("li", {className: "MenuItem"}, 
                React.createElement("a", {href: "#"}, 
                    React.createElement("i", {className: "glyphicon glyphicon-" + this.props.icon}), 
                    this.props.label
                )
            )
        );
    }
});

var Menu = React.createClass({displayName: "Menu",
    getInitialState: function() {
        return {
            categories: [],
            halls: []
        };
    },
    componentDidMount: function() {
        $.ajax({
            url: '/categories/',
            type: 'get',
            success: function(data) {
                console.log(data);
                this.setState({ categories: data });
            }.bind(this),
            fail: function() {
                console.log(arguments);
            },
            complete: function() {}
        });
        $.ajax({
            url: '/halls/',
            type: 'get',
            success: function(data) {
                this.setState({ halls: data });
            }.bind(this),
            fail: function() {
                console.log(arguments);
            },
            complete: function() {}
        });
    },
    render: function() {
        var menuGenerator = function(data) {
            return ( React.createElement(MenuItem, {label: data.label, icon: data.icon}) );
        };
        var categoryMenus = this.state.categories.map(menuGenerator);
        var hallMenus = this.state.halls.map(menuGenerator);
        return (
            React.createElement("div", {className: "Menu"}, 
                React.createElement("div", {className: "category-menu"}, 
                    React.createElement("h4", null, "カテゴリ"), 
                    React.createElement("ul", null, 
                        categoryMenus
                    )
                ), 
                React.createElement("div", {className: "hall-menu"}, 
                    React.createElement("h4", null, "会館"), 
                    React.createElement("ul", null, 
                        hallMenus
                    )
                )
            )
        );
    }
});

React.render(
    React.createElement(Page, null),
    document.getElementById('page')
);

})(jQuery);
