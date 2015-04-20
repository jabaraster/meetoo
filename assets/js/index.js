(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var Item = React.createClass({displayName: "Item",
    getInitialState: function() {
        return {
            image: null,
            indicatorActive: false,
            imageSelecterVisible: true,
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
    render: function() {
        return (
            React.createElement("div", {className: "Item"}, 
                React.createElement("fieldset", null, 
                    React.createElement("legend", null, this.props.data.name), 
                    React.createElement("img", {src: this.state.imageUrl, className: "item-image", ref: "image", onDragOver: this.handleDragOver, onDrop: this.handleDrop}), 
                    React.createElement("p", {className: "item-description"}, this.props.data.description), 
                    React.createElement(Indicator, {buttonRef: this.state.image, active: this.state.indicatorActive})
                )
            )
        );
    }
});

var Page = React.createClass({displayName: "Page",
    render: function() {
        var data = { url: "", description: "説明", name: "祭壇：菊" };
        return (
            React.createElement("div", {className: "Page container"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-md-3"}, 
                        "メニュー"
                    ), 
                    React.createElement("div", {className: "col-md-9"}, 
                        React.createElement(Item, {data: data})
                    )
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
