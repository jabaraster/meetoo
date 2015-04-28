(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var MenuItemEditor = React.createClass({displayName: "MenuItemEditor",
    getInitialState: function() {
        return {
            kind: this.props.kind,
            id: this.props.data.id,
            descriptor: this.props.data.descriptor,
            name: this.props.data.name,
            icon: this.props.data.icon
        };
    },
    handleNameChange: function(e) {
        this.setState({ name: e.target.value });
    },
    handleDescriptorChange: function(e) {
        this.setState({ descriptor: e.target.value });
    },
    handleIconChange: function(e) {
        this.setState({ icon: e.target.value });
    },
    handleCloseClick: function() {
        if (this.props.onCloseClick) this.props.onCloseClick({});
    },
    handleSubmit: function() {
        var name = React.findDOMNode(this.refs.name).value;
        var descriptor = React.findDOMNode(this.refs.descriptor).value;
        var icon = React.findDOMNode(this.refs.icon).value;
        var url = this.state.id ? '/'+ this.state.kind + '/' + this.state.id : '/' + this.state.kind + '/';
        $.ajax({
            url: url,
            type: 'post',
            data: { id: this.state.id, name: name, descriptor: descriptor, icon: icon },
            success: function(response) {
                if (response.status !== 'OK') {
                    console.log(response);
                } else {
                    if (this.props.onUpdate) this.props.onUpdate({ kind: this.props.kind });
                }
            }.bind(this),
            fali: function() {
                console.log(arguments);
            },
            complete: function() {}
        });

    },
    componentDidUpdate: function(prevProps, prevState) {
        if (prevProps.data !== this.props.data ) {
            this.setState({
                kind: this.props.kind,
                id: this.props.data.id,
                descriptor: this.props.data.descriptor,
                name: this.props.data.name,
                icon: this.props.data.icon
            });
        }
        if (this.props.visible) {
            $('.menu-item-editor-dialog').modal('show');
        } else {
            $('.menu-item-editor-dialog').modal('hide');
        }
    },
    render: function() {
        var testIconClassesSrc = {
            'glyphicon': true
        };
        for (var p in testIconClassesSrc) {
            if (p.indexOf('glyphicon-') === 0) {
                delete testIconClassesSrc[p];
                break;
            }
        }
        testIconClassesSrc['glyphicon-' + this.state.icon] = true;
        var testIconClasses = React.addons.classSet(testIconClassesSrc);
        return (
            React.createElement("div", {className: "MenuItemEditor"}, 
              React.createElement("div", {className: "menu-item-editor-dialog modal fade"}, 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                      React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {className: "close", onClick: this.handleCloseClick, "aria-label": "Close"}, 
                            React.createElement("span", {"aria-hidden": "true"}, "×")
                        ), 
                        React.createElement("h4", {className: ".menu-item-editor-dialog-title modal-title"}, this.props.title)
                      ), 
                      React.createElement("div", {className: "modal-body"}, 

                        React.createElement("form", {className: "menu-item-edit-form", ref: "form"}, 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("input", {type: "text", 
                                       ref: "name", 
                                       className: "menu-item-name form-control", 
                                       value: this.state.name, 
                                       onChange: this.handleNameChange, 
                                       placeholder: "名前"}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("input", {type: "text", 
                                       ref: "descriptor", 
                                       className: "menu-item-descriptor form-control", 
                                       value: this.state.descriptor, 
                                       onChange: this.handleDescriptorChange, 
                                       placeholder: "識別子(半角英数のみ)"}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("i", {className: testIconClasses}), " ←アイコンが表示されます", 
                                React.createElement("input", {type: "text", 
                                       ref: "icon", 
                                       className: "menu-item-icon form-control", 
                                       value: this.state.icon, 
                                       onChange: this.handleIconChange, 
                                       placeholder: "アイコン名"}
                                )
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

var ItemEditor = React.createClass({displayName: "ItemEditor",
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
                                React.createElement("img", {src: this.state.url, 
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
        var imageUrl;
        if (this.props.data.id) {
            imageUrl = '/items/' + this.props.data.id + '___' + this.props.data.imageTimestamp + '/image';
        } else {
            imageUrl = '/img/unset.png';
        }
        return (
            React.createElement("div", {className: "Item"}, 
                React.createElement("div", {className: "tool-box"}, 
                    React.createElement("button", {className: "btn", onClick: this.handleClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-pencil"})
                    ), 
                    React.createElement("button", {className: "btn", onClick: this.handleRemoveClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-remove-sign"})
                    )
                ), 
                React.createElement("fieldset", {className: "fields"}, 
                    React.createElement("legend", null, 
                        React.createElement("span", {className: "item-name"}, this.props.data.name), 
                        React.createElement("span", {className: "item-unit-price"}, "単価：", this.props.data.unitPrice, "円")
                    ), 
                    React.createElement("img", {src: imageUrl, className: "item-image"}), 
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
                    React.createElement(Item, {key: "item_" + item.id, 
                          data: item, 
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
                React.createElement("h2", {className: this.props.items.length === 0 ? 'add-message' : 'hidden'}, "アイテムを追加して下さい。"), 
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
                React.createElement(Menu, null), 
                React.createElement(ItemList, {items: this.state.items, 
                          onAddClick: this.handleAddClick, 
                          onItemEditClick: this.handleItemEditClick, 
                          onItemRemoveClick: this.handleItemRemoveClick}
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
    handleClick: function() {
        if (this.props.onClick) this.props.onClick({ kind: this.props.kind, data: this.props.data });
    },
    handleEditClick: function(e) {
        e.stopPropagation();
        if (this.props.onEditClick) this.props.onEditClick({ kind: this.props.kind, data: this.props.data });
    },
    handleRemoveClick: function(e) {
        e.stopPropagation();
        if (this.props.onRemoveClick) this.props.onRemoveClick({ kind: this.props.kind, data: this.props.data });
    },
    render: function() {
        var classes = (this.props.data.id+'').indexOf('add-') ?
                        'id:'+this.props.data.id :
                        this.props.data.id;
        return (
            React.createElement("li", {className: "MenuItem"}, 
                React.createElement("a", {href: "#", className: classes, onClick: this.handleClick}, 
                    React.createElement("i", {className: "glyphicon glyphicon-remove-sign remover", onClick: this.handleRemoveClick}), 
                    React.createElement("i", {className: "glyphicon glyphicon-pencil editor", onClick: this.handleEditClick}), 
                    React.createElement("i", {className: "glyphicon glyphicon-" + this.props.data.icon}), 
                    React.createElement("span", {className: "icon-label"}, this.props.data.name)
                )
            )
        );
    }
});

var Menu = React.createClass({displayName: "Menu",
    getInitialState: function() {
        return {
            categories: [],
            halls: [],

            editorTitle: '',
            editorData: {},
            editorVisible: false,
        };
    },
    loadCategories: function() {
        $.ajax({
            url: '/categories/',
            type: 'get',
            success: function(data) {
                data.push({ id: "add-category", name:"(Add...)", icon: "plus" });
                this.setState({ categories: data });
            }.bind(this),
            fail: function() {
                console.log(arguments);
            },
            complete: function() {}
        });
    },
    loadHalls: function() {
        $.ajax({
            url: '/halls/',
            type: 'get',
            success: function(data) {
                data.push({ id: "add-hall", name:"(Add...)", icon: "plus" });
                this.setState({ halls: data });
            }.bind(this),
            fail: function() {
                console.log(arguments);
            },
            complete: function() {}
        });
    },
    componentDidMount: function() {
        this.loadCategories();
        this.loadHalls();
    },
    handleMenuItemClick: function(e) {
        if (e.data.id === 'add-category') {
            this.setState({
                editorKind: e.kind,
                editorTitle: 'カテゴリ追加',
                editorVisible: true,
                editorData: {}
            });
        } else if (e.data.id === 'add-hall') {
            this.setState({
                editorKind: e.kind,
                editorTitle: '会館追加',
                editorVisible: true,
                editorData: {}
            });
        } else {
            this.setState({ editorVisible: true, editorData: e.data });
        }
    },
    handleCloseClick: function() {
        this.setState({ editorVisible: false, editorData: {} });
    },
    handleMenuItemUpdate: function(e) {
        this.setState({ editorVisible: false, editorData: {} });
        if (e.kind === 'categories') {
            this.loadCategories();
        } else if (e.kind === 'halls') {
            this.loadHalls();
        }
    },
    handleMenuItemEditClick: function(e) {
        if ((e.data.id+'').indexOf("add-") === 0) {
            return;
        }
        if (e.kind === 'categories') {
            this.setState({
                editorKind: e.kind,
                editorTitle: 'カテゴリ編集',
                editorVisible: true,
                editorData: e.data
            });
        } else if (e.kind === 'halls') {
            this.setState({
                editorKind: e.kind,
                editorTitle: '会館編集',
                editorVisible: true,
                editorData: e.data
            });
        } else {
            this.setState({ editorVisible: true, editorData: e.data });
        }
    },
    handleMenuItemRemoveClick: function(e) {
        if ((e.data.id+'').indexOf("add-") === 0) {
            return;
        }
        if (!confirm(e.data.name + 'を削除していいですか？(この操作は元に戻せません)')) {
            return;
        }
        var url = '/'+ e.kind + '/' + e.data.id + '/remove';
        $.ajax({
            url: url,
            type: 'post',
            success: function() {
                if (e.kind === 'categories') {
                    this.loadCategories();
                } else if (e.kind === 'halls') {
                    this.loadHalls();
                }
            }.bind(this),
            fail: function() {
                console.log(arguments);
            },
            complete: function() {}
        });
    },
    render: function() {
        var menuGeneratorGenerator = function(kind) {
            return function(data) {
                return (
                    React.createElement(MenuItem, {kind: kind, 
                              data: data, 
                              onClick: this.handleMenuItemClick, 
                              onEditClick: this.handleMenuItemEditClick, 
                              onRemoveClick: this.handleMenuItemRemoveClick}
                    )
                );
            }.bind(this);
        }.bind(this);
        var categoryMenus = this.state.categories.map(menuGeneratorGenerator('categories'));
        var hallMenus = this.state.halls.map(menuGeneratorGenerator('halls'));
        return (
            React.createElement("nav", {className: "navbar navbar-inverse"}, 
                React.createElement(MenuItemEditor, {title: this.state.editorTitle, 
                                kind: this.state.editorKind, 
                                data: this.state.editorData, 
                                visible: this.state.editorVisible, 
                                onCloseClick: this.handleCloseClick, 
                                onUpdate: this.handleMenuItemUpdate}
                ), 
                React.createElement("div", {className: "container"}, 
                    React.createElement("div", {className: "navbar-header"}, 
                        React.createElement("a", {className: "navbar-brand"}, "見積ツール meetoo")
                    ), 
                    React.createElement("ul", {className: "nav navbar-nav navbar-left"}, 
                        React.createElement("li", {className: "dropdown"}, 
                            React.createElement("a", {href: "#", className: "dropdown-toggle", "data-toggle": "dropdown"}, 
                                "カテゴリ", React.createElement("span", {className: "caret"})
                            ), 
                            React.createElement("ul", {className: "dropdown-menu"}, 
                                categoryMenus
                            )
                        )
                    ), 
                    React.createElement("ul", {className: "nav navbar-nav navbar-left"}, 
                        React.createElement("li", {className: "dropdown"}, 
                            React.createElement("a", {href: "#", className: "dropdown-toggle", "data-toggle": "dropdown"}, 
                                "会館", React.createElement("span", {className: "caret"})
                            ), 
                            React.createElement("ul", {className: "dropdown-menu"}, 
                                hallMenus
                            )
                        )
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
