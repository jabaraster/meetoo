(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var ItemEditor = React.createClass({displayName: "ItemEditor",
    getInitialState: function() {
        return {
            id: this.props.data.id,
            name: this.props.data.name,
            imageUrl: this.props.data.url,
            description: this.props.data.description,

            indicatorFor: null,
            indicatorActive: false
        };
    },
    handleFileSelect: function(files) {
        if (files.length === 0) return;
        var fr = new FileReader();
        $(fr).on("load", function(e) {
                this.setState({
                    imageUrl: e.target.result,
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
    handleCloseClick: function(e) {
        e.preventDefault();
        if (this.props.onCloseClick) this.props.onCloseClick({});
    },
    handleSubmit: function(e) {
        var name = React.findDOMNode(this.refs.name).value;
        var imageDataUrl = $(React.findDOMNode(this.refs.image)).attr("src");
        var desc = React.findDOMNode(this.refs.description).value;
        var url = this.state.id ? "/items/" + this.state.id : "/items/";
        this.setState({ indicatorFor: React.findDOMNode(this.refs.form), indicatorActive: true });
        $.ajax({
            url: url,
            type: "post",
            data: { name: name, imageDataUrl: imageDataUrl, description: desc },
            success: function(response) {
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
    componentDidMount: function() {
        $(".ItemEditor2 .item-editor-dialog").on("show.bs.modal", function(e) {
            console.log(e);
        });
    },
    componentDidUpdate: function(newProp, state) {
        if (this.props.visible) {
            $(".item-editor-dialog").modal({ show: true });
        } else {
            $(".item-editor-dialog").modal({ show: false });
        }
    },
    render: function() {
        var imageSet = !!this.state.imageUrl;
        return (
            React.createElement("div", {className: "ItemEditor"}, 
              React.createElement("div", {className: "item-editor-dialog modal fade"}, 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                      React.createElement("div", {className: "modal-header"}, 
                        React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, React.createElement("span", {"aria-hidden": "true"}, "×")), 
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
                                       className: "form-control", 
                                       defaultValue: this.props.data.name, 
                                       placeholder: "アイテム名"}
                                )
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("textarea", {className: "item-description form-control", 
                                          ref: "description", 
                                          placeholder: "説明"}, this.props.data.description)
                            ), 
                            React.createElement("div", {className: "form-group"}, 
                                React.createElement("img", {src: imageSet ? this.state.imageUrl : "/img/unset.png", 
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
                        React.createElement("button", {type: "button", className: "item-editor-close-button btn btn-default", "data-dismiss": "modal"}, "Close"), 
                        React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.handleSubmit}, "Save changes")
                      )
                    )
                )
              )
            )
        );
    }
});

var Item = React.createClass({displayName: "Item",
    getInitialState: function() {
        return {
            itemName: this.props.data.name,
            itemDescription: this.props.data.description,
            imageUrl: this.props.data.url
        };
    },
    handleRemoverClick: function() {
        this.props.onRemoverClick({ data: this.props.data });
    },
    render: function() {
        return (
            React.createElement("div", {className: "Item"}, 
                React.createElement("hr", null), 
                React.createElement(TransitionGroup, {transitionName: "transition-rotation"}, 
                    this.props.editMode ?
                    React.createElement("button", {key: "remover_" + this.props.editMode, onClick: this.handleRemoverClick, className: "remover btn btn-default btn-lg tool-box-button"}, 
                        React.createElement("i", {className: "glyphicon glyphicon-minus-sign"})
                    )
                    : null
                ), 
                React.createElement("fieldset", {className: "fields"}, 
                    React.createElement("legend", null, 
                        !this.props.editMode ?
                        React.createElement("span", null, this.state.itemName)
                        : null, 
                        this.props.editMode ?
                        React.createElement("input", {type: "text", ref: "name", className: "item-name", defaultValue: this.state.itemName})
                        : null
                    ), 
                    React.createElement("img", {src: this.state.imageUrl ? this.state.imageUrl : "/img/unset.png", 
                         className: "item-image", ref: "image", 
                         onDragOver: this.handleDragOver, 
                         onDrop: this.handleDrop}
                    ), 
                    React.createElement("p", {className: "item-description"}, this.state.itemDescription)
                )
            )
        );
    }
});

var ItemList = React.createClass({displayName: "ItemList",
    handleAddClick: function() {
        if (this.props.onAddClick) this.props.onAddClick();
    },
    render: function() {
        var items = this.props.items.map(function(item) {
            return (
                React.createElement("li", null, 
                    React.createElement(Item, {key: "item_" + item.id, data: item})
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
    getInitialState: function() {
        return {
            items: [],

            editorData: {},
            editorVisible: false
        };
    },
    componentDidMount: function() {
        getAllItems(function(response) {
            this.setState({ items: response });
        }.bind(this));
    },
    handleAddClick: function() {
        this.setState({ editorVisible: true });
    },
    handleEditorCloseClick: function() {
        this.setState({ editorData: {}, editorVisible: false });
    },
    handleInsert: function() {
        getAllItems(function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    handleUpdate: function() {
        getAllItems(function(response) {
            this.setState({ items: response, editorData: {}, editorVisible: false });
        }.bind(this));
    },
    render: function() {
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-md-3"}, 
                        "メニュー"
                    ), 
                    React.createElement(ItemList, {items: this.state.items, onAddClick: this.handleAddClick})
                ), 
                React.createElement(ItemEditor, {data: this.state.editorData, 
                            visible: this.state.editorVisible, 
                            onCloseClick: this.handleEditorCloseClick, 
                            onInsert: this.handleInsert, 
                            onUpdate: this.handleUpdate}
                )
            )
        )
    }
});

var getAllItems = function(successHandler) {
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
};

React.render(
    React.createElement(Page, null),
    document.getElementById('page')
);

})(jQuery);
