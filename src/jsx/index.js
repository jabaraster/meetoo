(function($) {
"use strict";

var TransitionGroup = React.addons.CSSTransitionGroup;

var ItemEditor = React.createClass({
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
    componentDidUpdate: function(oldProp, state) {
        if (this.props.visible) {
            $('.item-editor-dialog').modal('show');
        } else {
            $('.item-editor-dialog').modal('hide');
        }
    },
    render: function() {
        var imageSet = !!this.state.imageUrl;
        return (
            <div className="ItemEditor">
              <div className="item-editor-dialog modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className=".item-editor-dialog-title modal-title">アイテム編集</h4>
                      </div>
                      <div className="modal-body">

                        <form className="item-edit-form"
                              ref="form"
                              onDragOver={this.handleDragOver}
                              onDrop={this.handleDrop}
                        >
                            <div className="form-group">
                                <input type="text"
                                       ref="name"
                                       className="form-control"
                                       defaultValue={this.props.data.name}
                                       placeholder="アイテム名"
                                />
                            </div>
                            <div className="form-group">
                                <textarea className="item-description form-control"
                                          ref="description"
                                          placeholder="説明">{this.props.data.description}</textarea>
                            </div>
                            <div className="form-group">
                                <img src={imageSet ? this.state.imageUrl : "/img/unset.png"}
                                     className="item-image"
                                     ref="image"
                                />
                                {!imageSet ?
                                <span>画像をドラッグ＆ドロップ</span>
                                :null }
                                <Indicator buttonRef={this.state.indicatorFor} active={this.state.indicatorActive} />
                            </div>
                        </form>

                      </div>
                      <div className="modal-footer">
                        <button type="button" className="item-editor-close-button btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>Save changes</button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
        );
    }
});

var Item = React.createClass({
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
                </fieldset>
            </div>
        );
    }
});

var ItemList = React.createClass({
    handleAddClick: function() {
        if (this.props.onAddClick) this.props.onAddClick();
    },
    render: function() {
        var items = this.props.items.map(function(item) {
            return (
                <li key={"item-list_" + item.id}>
                    <Item key={"item_" + item.id} data={item} />
                </li>
            );
        }.bind(this));
        return (
            <div className="ItemList col-md-9">
                <div className="tool-box">
                    <button className="btn btn-default tool-box-button" onClick={this.handleAddClick}>
                        <i className="glyphicon glyphicon-plus" />
                    </button>
                </div>
                <ul className="item-list">
                    {items}
                </ul>
            </div>
        );
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

var Page = React.createClass({
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
            <div className="Page container">
                <div className="row">
                    <div className="col-md-3">
                        メニュー
                    </div>
                    <ItemList items={this.state.items} onAddClick={this.handleAddClick} />
                </div>
                <ItemEditor data={this.state.editorData}
                            visible={this.state.editorVisible}
                            onCloseClick={this.handleEditorCloseClick}
                            onInsert={this.handleInsert}
                            onUpdate={this.handleUpdate}
                />
            </div>
        )
    }
});

React.render(
    <Page />,
    document.getElementById('page')
);

})(jQuery);
