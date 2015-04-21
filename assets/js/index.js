(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var Item = React.createClass({displayName: "Item",
    getInitialState: function() {
        return {
            image: null,
            indicatorActive: false,
            imageSelecterVisible: true,
            itemName: this.props.data.name,
            itemDescription: this.props.data.description,
            imageUrl: this.props.data.url
        };
    },
    componentDidMount: function() {
        this.setState({ image: React.findDOMNode(this.refs.image) });
    },
    handleFileSelect: function(files) {
        if (files.length === 0) return;
        var fr = new FileReader();
        $(fr).on("load", function(e) {
                this.setState({
                    imageUrl: e.target.result,
                    indicatorActive: false
                });
        }.bind(this));
        this.setState({ indicatorActive: true });
        fr.readAsDataURL(files[0]);
    },
    handleDragOver: function(e) {
        this.cancel(e);
    },
    handleDrop: function(e) {
        try {
            if (!this.props.editMode) return;
            if (!e.dataTransfer) return;
            var files = e.dataTransfer.files;
            if (!files) return;

            this.setState({ files: files });
            this.handleFileSelect(files);

        } finally {
            this.cancel(e);
        }
    },
    cancel: function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
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
                    React.createElement(TransitionGroup, {transitionName: "transition-rotation"}, 
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
                        React.createElement("p", {className: "item-description"}, this.state.itemDescription), 
                        React.createElement(Indicator, {buttonRef: this.state.image, active: this.state.indicatorActive})
                    )
                )
            )
        );
    }
});

var ItemList = React.createClass({displayName: "ItemList",
    getInitialState: function() {
        return {
            items: [],
            editMode: false,
            itemsSave: []
        };
    },
    componentDidMount: function() {
        $.ajax({
            url: "/items/",
            type: "get",
            success: function(response) {
                this.setState({ items: response });
            }.bind(this),

            fail: function() {
                console.log(arguments);
            }
        });
    },
    handleAddClick: function() {
        var newItems = [{}].concat(this.state.items);
        this.setState({
            items: newItems,
            itemsSave: this.state.items,
            editMode: true
        });
    },
    handleGoEditClick: function() {
        this.setState({
            itemsSave: this.state.items,
            editMode: true
        });
    },
    handleCancelEditClick: function() {
        console.log(this.state);
        this.setState({ items: this.state.itemsSave }, function() {
            this.setState({ editMode: false });
        }.bind(this));
    },
    handleSaveClick: function() {
        this.setState({ editMode: false });
    },
    handleItemRemove: function(e) {
        var removeData = e.data;
        var newItems = [];
        this.state.items.forEach(function(item) {
            if (removeData !== item) {
                newItems.push(item);
            }
        });
        this.setState({ items: newItems });
    },
    render: function() {
        var items = this.state.items.map(function(item) {
            return (
                React.createElement("li", null, 
                    React.createElement(Item, {key: "item_" + item.id, data: item, editMode: this.state.editMode, onRemoverClick: this.handleItemRemove})
                )
            );
        }.bind(this));
        return (
            React.createElement("div", {className: "ItemList col-md-9"}, 
                React.createElement("div", {className: "tool-box"}, 
                    React.createElement("button", {key: "add_" + !this.state.editMode, className: "btn btn-default tool-box-button", onClick: this.handleAddClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-plus"})
                    ), 
                    !this.state.editMode ?
                    React.createElement("button", {key: "go-edit_" + !this.state.editMode, className: "btn btn-default tool-box-button", onClick: this.handleGoEditClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-pencil"})
                    )
                    : null, 
                    this.state.editMode ?
                    React.createElement("button", {key: "cancel-edit_" + this.state.editMode, className: "btn btn-default tool-box-button", onClick: this.handleSaveClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-floppy-disk"})
                    )
                    : null, 
                    this.state.editMode ?
                    React.createElement("button", {key: "save_" + this.state.editMode, className: "btn btn-default tool-box-button", onClick: this.handleCancelEditClick}, 
                        React.createElement("i", {className: "glyphicon glyphicon-remove"})
                    )
                    : null
                ), 
                React.createElement("ul", {className: "item-list"}, 
                    items
                )
            )
        );
    }
});

var Page = React.createClass({displayName: "Page",
    render: function() {
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-md-3"}, 
                        "メニュー"
                    ), 
                    React.createElement(ItemList, null)
                )
            )
        )
    }
});

React.render(
    React.createElement(Page, null),
    document.getElementById('page')
);

})(jQuery);
