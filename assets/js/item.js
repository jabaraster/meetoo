(function($) {
"use strict";

window.ItemEditor = React.createClass({displayName: "ItemEditor",
    statics: {
        toMap: function(hallIdArray) {
            if (!hallIdArray) {
                return {};
            }
            var ret = {};
            hallIdArray.forEach(function(hallId) {
                ret[hallId] = 'dummy';
            });
            return ret;
        }
    },
    getInitialState: function() {
        return {
            id: this.props.data.id,
            name: this.props.data.name,
            unitPrice: this.props.data.unitPrice,
            description: this.props.data.description,
            categoryId: this.props.data.categoryId,

            belongHalls: [],
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
    handleCategoryChange: function(e) {
        this.setState({ categoryId: e.target.value });
    },
    handleHallCheckChange: function(index, e) {
        this.state.belongHalls[index].checked = e.target.checked;
        this.setState({ belongHalls: this.state.belongHalls });
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
    handleFileChange: function(e) {
        var files = e.target.files;
        if (!files) return;
        this.handleFileSelect(files);
    },
    handleSubmit: function(e) {
        var name = React.findDOMNode(this.refs.name).value;
        var unitPrice = React.findDOMNode(this.refs.unitPrice).value;
        var imageDataUrl = $(React.findDOMNode(this.refs.image)).attr("src");
        if (imageDataUrl.indexOf('data:') !== 0) {
            imageDataUrl = 'noop';
        }
        var catId = React.findDOMNode(this.refs.category).value;
        if (catId === 'null') {
            catId = null;
        }
        var desc = React.findDOMNode(this.refs.description).value;

        var hallIds = [];
        this.state.belongHalls.forEach(function(belongHall) {
            if (belongHall.checked) {
                hallIds.push(belongHall.id);
            }
        });

        var url = this.state.id ? "/items/" + this.state.id : "/items/";
        this.setState({ indicatorFor: React.findDOMNode(this.refs.form), indicatorActive: true });
        $.ajax({
            url: url,
            type: "post",
            data: {
                name: name,
                unitPrice: unitPrice,
                imageDataUrl: imageDataUrl,
                categoryId: catId,
                belongHallIds: hallIds.join(','),
                description: desc
            },
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
            }
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
                categoryId: this.props.data.categoryId,
                description: this.props.data.description ? this.props.data.description : '' , // textareaのときはこうしないと空値が反映されない
                url: this.props.data.id ? '/items/' + this.props.data.id + '___' + this.props.data.imageTimestamp + '/image' : '/img/unset.png',
            });
        }
        if (prevProps.belongHallIds !== this.props.belongHallIds ||
                prevProps.halls !== this.props.halls) {
            var belongSet = {};
            this.props.belongHallIds.forEach(function(belongHallId) {
                belongSet[belongHallId] = 'dummy';
            });
            var belongHalls = [];
            this.props.halls.forEach(function(hall) {
                hall.checked = hall.id in belongSet;
                belongHalls.push(hall);
            });
            this.setState({ belongHalls: belongHalls });
        }

        if (this.props.visible) {
            $('.item-editor-dialog').modal('show');
        } else {
            $('.item-editor-dialog').modal('hide');
        }
    },
    render: function() {
        var categoriesData = [{ id:'null', name: '(カテゴリなし)' }].concat(this.props.categories.concat());
        var categories = categoriesData.map(function(category) {
            return (
                React.createElement("option", {key: "category_" + category.id, value: category.id}, category.name)
            );
        });
        var halls = this.state.belongHalls.map(function(hall, index) {
            return (
                React.createElement("label", {key: "hallName_" + hall.id, className: "hall-name"}, 
                    React.createElement("input", {type: "checkbox", 
                           value: hall.id, 
                           checked: this.state.belongHalls[index].checked, 
                           onChange: this.handleHallCheckChange.bind(this, index)}
                    ), 
                    hall.name
                )
            );
        }.bind(this));
        var imageSet = !!this.state.url;
        return (
            React.createElement("div", {className: "ItemEditor"}, 
              React.createElement("div", {className: "item-editor-dialog modal fade"}, 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                      React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {className: "close", onClick: this.handleCloseClick, "aria-label": "Close"}, 
                            React.createElement("span", {"aria-hidden": "true"}, "×")
                        ), 
                        React.createElement("h4", {className: ".item-editor-dialog-title modal-title"}, "アイテム編集")
                      ), 
                      React.createElement("div", {className: "modal-body"}, 

                        React.createElement("div", {className: "message"}, this.state.messageText), 

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
                                       placeholder: "アイテム名", 
                                       onChange: this.handleNameChange}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("input", {type: "number", 
                                       ref: "unitPrice", 
                                       className: "form-control", 
                                       value: this.state.unitPrice, 
                                       placeholder: "単価", 
                                       onChange: this.handleUnitPriceChange}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("select", {className: "form-control", 
                                        ref: "category", 
                                        value: this.state.categoryId, 
                                        onChange: this.handleCategoryChange
                                }, 
                                    categories
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("textarea", {className: "item-description form-control", 
                                          ref: "description", 
                                          value: this.state.description, 
                                          placeholder: "説明", 
                                          onChange: this.handleDescriptionChange}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("img", {src: this.state.url, 
                                     className: "item-image", 
                                     ref: "image"}
                                ), 

                                React.createElement("div", null, 
                                    React.createElement("span", null, "画像をドラッグ＆ドロップ"), 
                                    "または", 
                                    React.createElement("div", {className: " file-overlay btn btn-success"}, 
                                        React.createElement("i", {className: "glyphicon glyphicon-white glyphicon-file"}), 
                                        "ファイルを選択", 
                                        React.createElement("input", {type: "file", className: "dnd-file", onChange: this.handleFileChange})
                                    )
                                ), 
                                React.createElement(Indicator, {buttonRef: this.state.indicatorFor, active: this.state.indicatorActive})
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("h3", null, "所属会場"), 
                                halls
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

window.Item = React.createClass({displayName: "Item",
    handleItemClick: function(e) {
        try {
            console.log(e);
            if (this.props.onItemClick) this.props.onItemClick({ data: this.props.data });
        } finally {
            e.preventDefault();
            e.stopPropagation();
        }
    },
    handleEditClick: function(e) {
        try {
            if (this.props.onEditClick) this.props.onEditClick({ data: this.props.data });
        } finally {
            e.preventDefault();
            e.stopPropagation();
        }
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
            React.createElement("div", {className: "Item", onClick: this.handleItemClick}, 
                React.createElement("div", {className: "tool-box"}, 
                    this.props.editable ?
                    React.createElement("button", {className: "btn", onClick: this.handleEditClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-pencil"})
                    ) : null, 
                    
                    this.props.editable ?
                    React.createElement("button", {className: "btn", onClick: this.handleRemoveClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-remove-sign"})
                    ) : null
                    
                ), 
                React.createElement("fieldset", {className: "fields"}, 
                    React.createElement("legend", null, 
                        React.createElement("span", {className: "item-name"}, this.props.data.name), 
                        React.createElement("span", {className: "item-unit-price"}, "単価：", String(this.props.data.unitPrice).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), "円")
                    ), 
                    React.createElement("img", {src: imageUrl, className: "item-image"}), 
                    React.createElement("p", {className: "item-description"}, this.props.data.description)
                )
            )
        );
    }
});

window.ItemList = React.createClass({displayName: "ItemList",
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
                          editable: this.props.editable, 
                          onEditClick: this.handleItemEditClick, 
                          onRemoveClick: this.handleItemRemoveClick}
                    )
                )
            );
        }.bind(this));
        var classes = {
            "ItemList": true
        };
        classes["col-md-"+(this.props.cols ? this.props.cols : 12)] = true;
        return (
            React.createElement("div", {className: React.addons.classSet(classes)}, 
                React.createElement("div", {className: "tool-box"}, 
                    this.props.editable ?
                    React.createElement("button", {className: "btn btn-default tool-box-button", onClick: this.handleAddClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-plus"})
                    ) : null
                    
                ), 
                React.createElement("h2", {className: this.props.items.length === 0 ? 'add-message' : 'hidden'}, "アイテムを追加して下さい。"), 
                React.createElement("ul", {className: "item-list"}, 
                    items
                )
            )
        );
    }
});

})(jQuery);
