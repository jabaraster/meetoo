(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var Item = React.createClass({
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
            <div className="Item">
                <hr/>
                <TransitionGroup transitionName="transition-rotation">
                    {this.props.editMode ?
                    <button key={"remover_" + this.props.editMode} onClick={this.handleRemoverClick} className="remover btn btn-default btn-lg tool-box-button">
                        <i className="glyphicon glyphicon-minus-sign" />
                    </button>
                    : null }
                </TransitionGroup>
                <fieldset className="fields">
                    <TransitionGroup transitionName="transition-rotation">
                        <legend>
                            {!this.props.editMode ?
                            <span>{this.state.itemName}</span>
                            : null }
                            {this.props.editMode ?
                            <input type="text" ref="name" className="item-name" defaultValue={this.state.itemName} />
                            : null }
                        </legend>
                        <img src={this.state.imageUrl ? this.state.imageUrl : "/img/unset.png"}
                             className="item-image" ref="image"
                             onDragOver={this.handleDragOver}
                             onDrop={this.handleDrop}
                        />
                        <p className="item-description">{this.state.itemDescription}</p>
                        <Indicator buttonRef={this.state.image} active={this.state.indicatorActive} />
                    </TransitionGroup>
                </fieldset>
            </div>
        );
    }
});

var ItemList = React.createClass({
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
                <li>
                    <Item key={"item_" + item.id} data={item} editMode={this.state.editMode} onRemoverClick={this.handleItemRemove} />
                </li>
            );
        }.bind(this));
        return (
            <div className="ItemList col-md-9">
                <div className="tool-box">
                    <button key={"add_" + !this.state.editMode} className="btn btn-default tool-box-button" onClick={this.handleAddClick}>
                        <i className="glyphicon glyphicon-plus" />
                    </button>
                    {!this.state.editMode ?
                    <button key={"go-edit_" + !this.state.editMode} className="btn btn-default tool-box-button" onClick={this.handleGoEditClick}>
                        <i className="glyphicon glyphicon-pencil" />
                    </button>
                    : null }
                    {this.state.editMode ?
                    <button key={"cancel-edit_" + this.state.editMode} className="btn btn-default tool-box-button" onClick={this.handleSaveClick}>
                        <i className="glyphicon glyphicon-floppy-disk" />
                    </button>
                    : null }
                    {this.state.editMode ?
                    <button key={"save_" + this.state.editMode} className="btn btn-default tool-box-button" onClick={this.handleCancelEditClick}>
                        <i className="glyphicon glyphicon-remove" />
                    </button>
                    : null }
                </div>
                <ul className="item-list">
                    {items}
                </ul>
            </div>
        );
    }
});

var Page = React.createClass({
    render: function() {
        return (
            <div className="Page container">
                <div className="row">
                    <div className="col-md-3">
                        メニュー
                    </div>
                    <ItemList />
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
