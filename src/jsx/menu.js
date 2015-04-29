(function($) {
"use strict";

window.MenuItemEditor = React.createClass({
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
            <div className="MenuItemEditor">
              <Message visible={this.state.messageVisible} text={this.state.messageText} />
              <div className="menu-item-editor-dialog modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button className="close" onClick={this.handleCloseClick} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className=".menu-item-editor-dialog-title modal-title">{this.props.title}</h4>
                      </div>
                      <div className="modal-body">

                        <form className="menu-item-edit-form" ref="form">
                            <div className="form-group">
                                <input type="text"
                                       ref="name"
                                       className="menu-item-name form-control"
                                       value={this.state.name}
                                       onChange={this.handleNameChange}
                                       placeholder="名前"
                                />
                            </div>
                            <div className="form-group">
                                <input type="text"
                                       ref="descriptor"
                                       className="menu-item-descriptor form-control"
                                       value={this.state.descriptor}
                                       onChange={this.handleDescriptorChange}
                                       placeholder="識別子(半角英数のみ)"
                                />
                            </div>
                            <div className="form-group">
                                <i className={testIconClasses} /> ←アイコンが表示されます
                                <input type="text"
                                       ref="icon"
                                       className="menu-item-icon form-control"
                                       value={this.state.icon}
                                       onChange={this.handleIconChange}
                                       placeholder="アイコン名"
                                />
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

window.MenuItem = React.createClass({
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
            <li className="MenuItem">
                <a href="" className={classes} onClick={this.handleClick}>
                    <i className="glyphicon glyphicon-remove-sign remover" onClick={this.handleRemoveClick} />
                    <i className="glyphicon glyphicon-pencil editor" onClick={this.handleEditClick} />
                    <i className={"glyphicon glyphicon-" + this.props.data.icon} />
                    <span className="icon-label">{this.props.data.name}</span>
                </a>
            </li>
        );
    }
});

window.Menu = React.createClass({
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
                data.push({ id: "add-category", name:"(追加)", icon: "plus" });
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
            return;
        }
        if (e.data.id === 'add-hall') {
            this.setState({
                editorKind: e.kind,
                editorTitle: '会館追加',
                editorVisible: true,
                editorData: {}
            });
            return;
        }

        if (this.props.onFilter) this.props.onFilter(e);
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
                    <MenuItem kind={kind}
                              data={data}
                              onClick={this.handleMenuItemClick}
                              onEditClick={this.handleMenuItemEditClick}
                              onRemoveClick={this.handleMenuItemRemoveClick}
                    />
                );
            }.bind(this);
        }.bind(this);
        var categoryMenus = this.state.categories.map(menuGeneratorGenerator('categories'));
        var hallMenus = this.state.halls.map(menuGeneratorGenerator('halls'));
        return (
            <nav className="navbar navbar-inverse">
                <MenuItemEditor title={this.state.editorTitle}
                                kind={this.state.editorKind}
                                data={this.state.editorData}
                                visible={this.state.editorVisible}
                                onCloseClick={this.handleCloseClick}
                                onUpdate={this.handleMenuItemUpdate}
                />
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand">見積ツール meetoo</a>
                    </div>
                    <ul className="nav navbar-nav navbar-left">
                        <li className="dropdown">
                            <a href="" className="dropdown-toggle" data-toggle="dropdown">
                                カテゴリ<span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu">
                                {categoryMenus}
                            </ul>
                        </li>
                    </ul>
                    <ul className="nav navbar-nav navbar-left">
                        <li className="dropdown">
                            <a href="" className="dropdown-toggle" data-toggle="dropdown">
                                会館<span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu">
                                {hallMenus}
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
});

})(jQuery)
