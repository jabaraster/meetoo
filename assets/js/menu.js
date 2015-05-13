(function($) {
"use strict";

window.MenuItemEditor = React.createClass({displayName: "MenuItemEditor",
    getInitialState: function() {
        return {
            kind: this.props.kind,
            id: this.props.data.id,
            descriptor: this.props.data.descriptor,
            name: this.props.data.name,
            icon: this.props.data.icon,

            messageVisible: false,
            messageText: ''
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
                    this.setState({ messageVisible: true, messageText: response.message });
                } else {
                    if (this.props.onUpdate) this.props.onUpdate({ kind: this.props.kind });
                }
            }.bind(this),
            fail: function() {
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
              React.createElement(Message, {visible: this.state.messageVisible, text: this.state.messageText}), 
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

window.MenuItem = React.createClass({displayName: "MenuItem",
    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.onClick) this.props.onClick({ kind: this.props.kind, data: this.props.data });
    },
    handleEditClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.onEditClick) this.props.onEditClick({ kind: this.props.kind, data: this.props.data });
    },
    handleRemoveClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.onRemoveClick) this.props.onRemoveClick({ kind: this.props.kind, data: this.props.data });
    },
    render: function() {
        var classes = (this.props.data.id+'').indexOf('add-') ?
                        'id:'+this.props.data.id :
                        this.props.data.id;
        return (
            React.createElement("li", {className: "MenuItem"}, 
                React.createElement("a", {href: "", className: classes, onClick: this.handleClick}, 
                    this.props.editable ?
                    React.createElement("i", {className: "glyphicon glyphicon-remove-sign remover", onClick: this.handleRemoveClick}) : null, 
                    this.props.editable ?
                    React.createElement("i", {className: "glyphicon glyphicon-pencil editor", onClick: this.handleEditClick}) : null, 
                    React.createElement("i", {className: "glyphicon glyphicon-ok check-" + (this.props.checked?"on":"off"), onClick: this.handleCheckClick}), 
                    React.createElement("i", {className: "glyphicon glyphicon-" + this.props.data.icon}), 
                    React.createElement("span", {className: "icon-label"}, this.props.data.name)
                )
            )
        );
    }
});

window.Menu = React.createClass({displayName: "Menu",
    getInitialState: function() {
        return {
            categories: [],
            halls: [],

            selectedCategories: {},
            selectedHall: null,

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
                if (this.props.onLoadCategories) this.props.onLoadCategories({ data: data });
                var cp = data.concat();
                if (this.props.editable) {
                    cp.push({ id: "add-category", name:"(追加)", icon: "plus" });
                }
                this.setState({ categories: cp });
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
                if (this.props.onLoadHalls) this.props.onLoadHalls({ data: data });
                var cp = data.concat();
                if (this.props.editable) {
                    cp.push({ id: "add-hall", name:"(追加)", icon: "plus" });
                }
                this.setState({ halls: cp });
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
            return;
        }
        if (e.data.id === 'add-hall') {
            this.setState({
                editorKind: e.kind,
                editorTitle: '会場追加',
                editorVisible: true,
                editorData: {}
            });
            return;
        }

        var f = function() {
            var evt = {
                kind: e.kind,
                selected: e.data,
                selectedCategories: this.state.selectedCategories,
                selectedHall: this.state.selectedHall
            };
            if (this.props.onFilter) this.props.onFilter(evt);
        }.bind(this);

        if (e.kind === 'categories') {
            if (e.data.descriptor in this.state.selectedCategories) {
                delete this.state.selectedCategories[e.data.descriptor];
            } else {
                this.state.selectedCategories[e.data.descriptor] = e.data;
            }
            this.setState({ selectedCategories: this.state.selectedCategories }, f);

        } else if (e.kind === 'halls') {
            if (!this.state.selectedHall) {
                this.setState({ selectedHall: e.data }, f);

            } else if (e.data.id === this.state.selectedHall.id) {
                this.setState({ selectedHall: null }, f);

            } else {
                this.setState({ selectedHall: e.data }, f);
            }
        } else { throw e.kind; }

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
                editorTitle: '会場編集',
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
                var checked;
                if (kind === 'categories') {
                    checked = data.descriptor in this.state.selectedCategories;
                } else if (kind === 'halls') {
                    checked = this.state.selectedHall ? data.id === this.state.selectedHall.id : false ;
                } else { throw kind; }
                return (
                    React.createElement(MenuItem, {kind: kind, 
                              data: data, 
                              checked: checked, 
                              key: "menuItem_" + data.id, 
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
                            React.createElement("a", {href: "", className: "dropdown-toggle", "data-toggle": "dropdown"}, 
                                "カテゴリ", React.createElement("span", {className: "caret"})
                            ), 
                            React.createElement("ul", {className: "dropdown-menu"}, 
                                categoryMenus
                            )
                        )
                    ), 
                    React.createElement("ul", {className: "nav navbar-nav navbar-left"}, 
                        React.createElement("li", {className: "dropdown"}, 
                            React.createElement("a", {href: "", className: "dropdown-toggle", "data-toggle": "dropdown"}, 
                                "会場", React.createElement("span", {className: "caret"})
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

})(jQuery);
