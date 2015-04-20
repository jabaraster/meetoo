(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var Item = React.createClass({
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
            <div className="Item">
                <fieldset>
                    <legend>{this.props.data.name}</legend>
                    <img src={this.state.imageUrl} className="item-image" ref="image" onDragOver={this.handleDragOver} onDrop={this.handleDrop} />
                    <p className="item-description">{this.props.data.description}</p>
                    <Indicator buttonRef={this.state.image} active={this.state.indicatorActive} />
                </fieldset>
            </div>
        );
    }
});

var Page = React.createClass({
    render: function() {
        var data = { url: "", description: "説明", name: "祭壇：菊" };
        return (
            <div className="Page container">
                <div className="row">
                    <div className="col-md-3">
                        メニュー
                    </div>
                    <div className="col-md-9">
                        <Item data={data} />
                    </div>
                </div>
            </div>
        )
    }
});

React.render(
    <Page />,
    document.getElementById('page')
);

})(jQuery);
