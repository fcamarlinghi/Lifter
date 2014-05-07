/**
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

; (function ()
{
    if (typeof this.Lifter !== 'function')
        return;

    $.strict = true;

    var __lifter = Lifter,

        // Shortcuts
        __documents = __lifter.documents,
        __layers = __lifter.layers,
        __selection = __lifter.selection,
        __history = __lifter.history,

        // Create DOM namespace
        __dom = __lifter.dom = {};


    // Utilities
    /** Throws an error if the passed document is not the active one. */
    function _assertActiveDocument(document)
    {
        if (!document.isActive())
            throw new Error(['Document "', document, '" needs to be active to perform the required operation.'].join(''));
    };

    /** Iterates over a layer collection searching for the specified patterns. */
    function _find(collection, findType, patterns, context)
    {
        if (typeof patterns !== 'function')
        {
            if (typeof patterns !== 'object')
                throw new Error('Search patterns must be either a function or an object.');

            var found = [],
                keys = Object.keys(patterns),
                keysLength = keys.length;

            function __match(element)
            {
                for (var j = 0; j < keysLength; j++)
                {
                    if (patterns[keys[j]] !== element.prop(keys[j]))
                        return false;
                }

                found.push(element);
                return true;
            };

            switch (findType)
            {
                case 2:
                    // Find last
                    collection.reverse().some(function (element)
                    {
                        if (__match.call(null, element))
                            return true;
                    }, null, true);

                    return found.length ? found[0] : null;

                case 1:
                    // Find first
                    collection.some(function (element)
                    {
                        if (__match.call(null, element))
                            return true;
                    });

                    return found.length ? found[0] : null;

                default:
                    // Find all
                    collection.forEach(function (element)
                    {
                        __match.call(null, element);
                    });

                    return found;
            }
        }
        else
        {
            collection.forEach(patterns, context);
        }
    };

    /** Gets object type name. */
    var _funcNameRegex = /function (.{1,})\(/;
    function _getName(obj)
    {
        var results = (_funcNameRegex).exec((obj).constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    };


    // Collection
    /**
     * Base object for all array-like collections.
     */
    function Collection() { };
    Collection.prototype = new Array();
    Collection.prototype.constructor = Collection;

    /**
     * Gets a string representation of the collection.
     */
    Collection.prototype.toString = function ()
    {
        return ['[', _getName(this), ']'].join('');
    };

    // Delete un-needed methods
    Collection.prototype.concat = undefined;
    Collection.prototype.join = undefined;
    Collection.prototype.pop = undefined;
    Collection.prototype.push = undefined;
    Collection.prototype.shift = undefined;
    Collection.prototype.slice = undefined;
    Collection.prototype.sort = undefined;
    Collection.prototype.splice = undefined;
    Collection.prototype.unshift = undefined;

    /**
     * Finds all the items that match the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  An array containing all the matching item, or null if no matching item is found.
     */
    Collection.prototype.findAll = function (patterns, context)
    {
        return _find(this, 0, patterns, context);
    };

    /**
     * Finds the first item that matches the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  The first item that matches the specified patterns, or null if no matching item is found.
     */
    Collection.prototype.findFirst = function (patterns, context)
    {
        return _find(this, 1, patterns, context);
    };

    /**
     * Finds the last item that matches the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  The last item that matches the specified patterns, or null if no matching item is found.
     */
    Collection.prototype.findLast = function (patterns, context)
    {
        return _find(this, 2, patterns, context);
    };



    // DOMObject
    /**
     * Base object for all DOM objects.
     */
    function DOMObject(parent, id)
    {
        /** Gets the unique identifier for this object. */
        this.id = id;

        /** Gets the parent of this object. */
        this.parent = parent;

        /** @private Properties cache. */
        this._cache = {};
    };
    DOMObject.prototype = new Object();
    DOMObject.prototype.constructor = DOMObject;
    DOMObject.prototype._base = null;

    // Operator overloading
    DOMObject.prototype = {
        '+': function (operand, rev) { return undefined; },
        '-': function (operand, rev) { return undefined; },
        '*': function (operand, rev) { return undefined; },
        '/': function (operand, rev) { return undefined; },
        '~': function (operand, rev) { return undefined; },
        '<': function (operand, rev) { return undefined; },
        '<=': function (operand, rev) { return undefined; },
        '===': function (operand, rev) { return (!operand || !(operand instanceof this.constructor)) ? false : operand.valueOf() === this.valueOf(); },
        '==': function (operand, rev) { return (!operand || !operand.valueOf) ? false : operand.valueOf() == this.valueOf(); },
    };

    /**
     * Gets the identifier of the DOM object.
     */
    DOMObject.prototype.valueOf = function () { return this.id; };

    /**
     * Gets a string representation of the DOM object.
     */
    DOMObject.prototype.toString = function ()
    {
        if (this.id > 0 && this._base && this._base.supportedProperties.hasOwnProperty('name'))
            return ['[', _getName(this), ' ', this._base.prop(this.id, 'name'), ']'].join('');
        else
            return ['[', _getName(this), ']'].join('');
    };

    /**
     * Gets or sets the DOM property with the given name.
     */
    DOMObject.prototype.prop = function (name, value)
    {
        // Pass request to low-level function
        if (typeof value === 'undefined')
        {
            if (!this._cache.hasOwnProperty(name))
                this._cache[name] = this._base.prop(this.id, name);

            return this._cache[name];
        }
        else
        {
            this._base.prop(this.id, name, value);
            this._cache[name] = value;
            return this;
        }
    };


    // Layers
    /**
     * A collection of layers.
     */
    function Layers(parent, parentDocument)
    {
        /** Gets parent. */
        this.parent = parent;

        /** Gets parent document. */
        this.parentDocument = parentDocument;
    };
    Layers.prototype = new Collection();
    Layers.prototype.constructor = Layers;

    /** 
     * Deletes all elements.
     */
    Layers.prototype.removeAll = function ()
    {
        _assertActiveDocument(this.parentDocument);

        // Make sure we leave at least one layer in the document,
        // or Photoshop will throw an error
        __layers.add();

        // Delete all layers
        while (this.length > 0)
            __layers.remove(this[0].id);

        // Clean-up all collections
        this.length = 0;
        this.parent.layerSets.length = 0;
        this.parent.artLayers.length = 0;

        return this;
    };

    /** 
     * Deletes the specified layer.
     * @param   layer   The layer to remove.
     */
    Layers.prototype.remove = function (layer)
    {
        _assertActiveDocument(this.parentDocument);

        // Make sure we have a valid index
        var index = (typeof layer === 'number') ? layer : this.indexOf(layer);

        if (index < 0 || index >= this.length)
            throw new Error(['Could not find the specified layer: ', layer, '.'].join(''));

        // Delete layer
        __layers.remove(this[index].id);
        Array.prototype.splice.call(this, index, 1);

        // Remove layer from layerset or artlayer collection too
        if (layer instanceof LayerSet)
            Array.prototype.splice.call(this.parent.layerSets, this.parent.layerSets.indexOf(layer), 1);
        else
            Array.prototype.splice.call(this.parent.artLayers, this.parent.artLayers.indexOf(layer), 1);

        return this;
    };

    /**
     * Gets whether this layer collection is at root level in hierarchy.
     */
    Layers.prototype.isAtRoot = function ()
    {
        return this.parent === this.parentDocument;
    };



    // LayerSets
    /**
     * A collection of layer sets.
     */
    function LayerSets(parent, parentDocument)
    {
        /** Gets parent. */
        this.parent = parent;

        /** Gets parent document. */
        this.parentDocument = parentDocument;
    };

    LayerSets.prototype = new Layers();
    LayerSets.prototype.constructor = LayerSets;

    /** 
     * Adds a new layer set.
     * @param   name            Layer name. Pass null for default value.
     * @param   opacity         Layer opacity. Pass null for default value.
     * @param   blendMode       Layer blend mode. Pass null for default value.
     * @param   color           Layer color. Pass null for default value.
     * @return  A reference to the new layer set.
     */
    LayerSets.prototype.add = function (name, opacity, blendMode, color)
    {
        _assertActiveDocument(this.parent);

        // Add set in document
        __layers.addLayerSet(name, opacity, blendMode, color);

        // Create new DOM representation
        var set = new LayerSet(this.parent);
        set.id = __layers.prop('layerId');
        // End layer id for layer set is found by using the previous itemIndex
        // We effectively assume that no layers are in the set as of now
        set.endId = __layers.prop(__layers.getLayerIdByItemIndex(__layers.prop('itemIndex') - 1), 'layerId');
        Array.prototype.push.call(this.parent.layers, set);
        Array.prototype.push.call(this, set);
        return set;
    };



    // ArtLayers
    /**
     * A collection of art layers.
     */
    function ArtLayers(parent, parentDocument)
    {
        /** Gets parent. */
        this.parent = parent;

        /** Gets parent document. */
        this.parentDocument = parentDocument;
    };
    ArtLayers.prototype = new Layers();
    ArtLayers.prototype.constructor = ArtLayers;

    /** 
     * Adds a new art layer.
     * @param   name            Layer name. Pass null for default value.
     * @param   opacity         Layer opacity. Pass null for default value.
     * @param   fillOpacity     Layer fill opacity. Pass null for default value.
     * @param   blendMode       Layer blend mode. Pass null for default value.
     * @param   color           Layer color. Pass null for default value.
     * @return  A reference to the new art layer.
     */
    ArtLayers.prototype.add = function (name, opacity, fillOpacity, blendMode, color)
    {
        _assertActiveDocument(this.parent);

        // Add art layer in document
        __layers.add(name, opacity, fillOpacity, blendMode, color);

        // Create new DOM representation
        var layer = new Layer(this.parent);
        layer.id = __layers.prop('layerId');
        Array.prototype.push.call(this.parent.layers, layer);
        Array.prototype.push.call(this, layer);
        return layer;
    };



    // Layer
    /**
     * Base type for art layers and layer sets.
     */
    function Layer() { };

    Layer.prototype = new DOMObject();
    Layer.prototype.constructor = Layer;
    Layer.prototype._base = __layers;

    /**
     * Gets whether the layer is at root level in hierarchy.
     */
    Layer.prototype.isAtRoot = function ()
    {
        return this.parent.isAtRoot();
    };

    /**
     * Gets whether this is the currently active layer.
     */
    Layer.prototype.isActive = function ()
    {
        return __layers.stack.getActiveLayerId() === this.id;
    };

    /**
     * Deletes the layer.
     */
    Layer.prototype.remove = function ()
    {
        return this.parent.layers.remove(this);
    };

    /**
     * Makes the layer visible.
     */
    Layer.prototype.show = function ()
    {
        this.prop('visible', true); return this;
    };

    /**
     * Hides the layer.
     */
    Layer.prototype.hide = function ()
    {
        this.prop('visible', false); return this;
    };

    /**
     * Copies the content of the layer.
     * @param   [merged]    If specified, the copy includes all visible layers.
     */
    Layer.prototype.copy = function (merged)
    {
        var activeLayerId = __layers.stack.getActiveLayerId();

        if (this.id !== activeLayerId)
            __layers.stack.makeActive(this.id);

        __selection.selectAll().copy(merged).deselect();

        if (this.id !== activeLayerId)
            __layers.stack.makeActive(activeLayerId);

        return this;
    };



    // LayerSet
    /**
     * Represents a document layer set.
     */
    function LayerSet(parent, id, endId)
    {
        /** Gets a reference to the layer set collection holding this set. */
        this.parent = parent;

        /**  Gets a list of layers (both art layers and layer set) that are children of this set. */
        this.layers = new Layers(this, this.parent.parentDocument);

        /** Gets a list of layer sets that are children of this one. */
        this.layerSets = new LayerSets(this, this.parent.parentDocument);

        /** Gets a list of art layer that are children of this one. */
        this.artLayers = new ArtLayers(this, this.parent.parentDocument);

        /** Gets layer set start LayerId. */
        this.id = id;

        /** Gets layer set end LayerId. */
        this.endId = endId;
    };

    LayerSet.prototype = new Layer();
    LayerSet.prototype.constructor = LayerSet;

    /**
     * Copies the content of the layer set.
     */
    LayerSet.prototype.copy = function ()
    {
        return Layer.prototype.copy.call(this, true);
    };


    // ArtLayer
    /**
     * Represents a document art layer.
     */
    function ArtLayer(parent, id)
    {
        /** Gets a reference to the art layer collection holding this art layer. */
        this.parent = parent;

        /** Gets LayerId (that is, the start LayerId). */
        this.id = id;
    };

    ArtLayer.prototype = new Layer();
    ArtLayer.prototype.constructor = ArtLayer;


    // HistoryStates
    /**
     * A collection of history states.
     */
    function HistoryStates(parentDocument)
    {
        /** Gets a reference to the parent document. */
        this.parentDocument = parentDocument;

        // Sync with Photoshop
        this.sync();
    }

    HistoryStates.prototype = new Collection();
    HistoryStates.prototype.constructor = HistoryStates;

    /**
     * Refreshes history states list synchronizing it with Photoshop.
     */
    HistoryStates.prototype.sync = function ()
    {
        var newHistoryState;
        this.length = 0;

        __history.forEach(function (itemIndex, historyId)
        {
            newHistoryState = new HistoryState(this, historyId);
            Array.prototype.push.call(this, newHistoryState);
        }, this);

        return this;
    };



    // HistoryState
    /**
     * Represents a document history state.
     */
    function HistoryState(parent, historyId)
    {
        /** Gets history state identifier. */
        this.historyId = historyId;

        /** Gets a reference to the history states collection. */
        this.parent = parent;
    };
    HistoryState.prototype = new DOMObject();
    HistoryState.prototype.constructor = HistoryState;
    HistoryState.prototype._base = __history;

    /**
     * Gets a string representation of this history state.
     */
    HistoryState.prototype.toString = function () { return (this.historyId > 0) ? '[HistoryState ' + this.prop('name') + ']' : '[HistoryState]'; };

    /**
     * Gets the unique identifier of the history state.
     */
    HistoryState.prototype.valueOf = function () { return this.historyId; };

    /**
     * Gets or sets the history state property with the given name.
     */
    HistoryState.prototype.prop = function (name, value)
    {
        // Pass request to low-level function
        if (typeof value === 'undefined')
        {
            if (!this._cache.hasOwnProperty(name))
                this._cache[name] = __history.prop(this.historyId, name);

            return this._cache[name];
        }
        else
        {
            __history.prop(this.historyId, name, value);
            this._cache[name] = value;
            return this;
        }
    };



    // Documents
    /**
     * An alternative DOM representation of a Photoshop document list that uses
     * Lifter low level functions for improved speed and functionality.
     */
    var Documents = __dom.Documents = function Documents()
    {
        /** Gets whether the document list has been synced with Photoshop. */
        this.synced = false;
    };

    Documents.prototype = new Collection();
    Documents.prototype.constructor = Documents;

    /**
     * Gets a string representation of this document collection.
     */
    Documents.prototype.toString = function () { return '[Documents]'; };

    /**
     * Refreshes document list synchronizing it with Photoshop.
     */
    Documents.prototype.sync = function ()
    {
        if (this.synced)
            return this;

        var newDoc,
            activeDocumentId = __documents.count() ? __documents.prop('documentId') : -1;

        this.length = 0;

        __documents.forEach(function (itemIndex, documentId)
        {
            newDoc = new Document(this, documentId);
            Array.prototype.push.call(this, newDoc);

            if (documentId === activeDocumentId)
                this.activeDocument = newDoc;
        }, this);

        this.synced = true;
        return this;
    };

    /** 
     * Creates a new document.
     * @param   width               Document width.
     * @param   height              Document height.
     * @param   resolution          Document resolution.
     * @param   name                Document name.
     * @param   mode                Document color mode.
     * @param   initialFill         Document initial fill.
     * @param   pixelAspectRatio    Document aspect ratio.
     * @param   bitsPerChannel      Document channel depth.
     * @param   colorProfileName    Document color profile.
     * @return  Reference to new document.
     */
    Documents.prototype.add = function (width, height, resolution, name, mode, initialFill, pixelAspectRatio, bitsPerChannel, colorProfileName)
    {
        __documents.add(width, height, resolution, name, mode, initialFill, pixelAspectRatio, bitsPerChannel, colorProfileName);
        var newDoc = new Document(this);
        Array.prototype.push.call(this, newDoc);
        return newDoc;
    };

    /** 
     * Opens the specified document.
     * @param   file    Either a File object or a path as string indicating the file to open.
     * @return  Reference to new document.
     */
    Documents.prototype.open = function (file)
    {
        var newDoc = new Document(this);
        Array.prototype.push.call(this, newDoc);
        return newDoc;
    };

    /** 
     * Closes the specified document.
     * @param   document    The document to close.
     * @param   save        Whether to save the document before closing it.
     */
    Documents.prototype.close = function (document, save)
    {
        // Make sure we have a valid index
        var index = (typeof document === 'number') ? document : this.indexOf(document);

        if (index < 0 || index >= this.length)
            throw new Error(['Could not find the specified document: ', document, '.'].join(''));

        // Close document
        __documents.list.makeActive(this[index].id);
        __documents.close(save);
        Array.prototype.splice.call(this, index, 1);

        // Set active document to the current one
        if (__documents.count())
            this.activeDocument = this.findFirst({ 'documentId': __documents.prop('documentId') })

        return this;
    };

    /** 
     * Gets or sets the currently active document.
     * @param   [document]      Either a document or a document index.
     */
    Documents.prototype.activeDocument = function (document)
    {
        if (typeof document === 'undefined')
        {
            // Return active document, if any
            var docIndex = this.indexOf(new Document(this, __documents.list.getActiveDocumentId()));
            return docIndex ? this[docIndex] : null;
        }
        else
        {
            // Make sure we have a valid index
            var index = (typeof document === 'number') ? document : this.indexOf(document);

            if (index < 0 || index >= this.length)
                throw new Error(['Could not find the specified document: ', document, '.'].join(''));

            __documents.list.makeActive(this[index].id);
            this[index].sync();
            return this;
        }
    };

    /**
     * Finds all the documents that match the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  An array containing all the matching documents, or null if no matching document is found.
     */
    Documents.prototype.findAll = function (patterns, context)
    {
        return _find(this, 0, patterns, context);
    };

    /**
     * Finds the first document that matches the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  The first document that matches the specified patterns, or null if no matching document is found.
     */
    Documents.prototype.findFirst = function (patterns, context)
    {
        return _find(this, 1, patterns, context);
    };

    /**
     * Finds the last document that matches the specified patterns.
     * @param   patterns    Either an hash object specifying search criteria or a custom search function.
     * @param   [context]   Context applied to search function.
     * @return  The last document that matches the specified patterns, or null if no matching document is found.
     */
    Documents.prototype.findLast = function (patterns, context)
    {
        return _find(this, 2, patterns, context);
    };



    // Document
    /**
     * An alternative DOM representation of a Photoshop document that uses
     * Lifter low level functions for improved speed and functionality.
     *
     * @param   [parent]    Reference to document collection that manages this document. Not needed if
     *                      in standalone mode.
     * @param   [document]  Either a document identifer, a File object or a document name identifiyng the
     *                      document. Falls back to currently active document if not specified.
     */
    var Document = __dom.Document = function Document()
    {
        // Parse args
        var parent, document;

        if (arguments[0] && arguments[0] instanceof Documents)
        {
            parent = arguments[0];
            document = arguments[1];
        }
        else
        {
            parent = null;
            document = arguments[0];
        }

        // Properties
        /** Gets document identifier. */
        this.id = -1;

        /** Gets a reference to the document collection, if initialized. */
        this.parent = parent;

        /** Gets a collection of document layers. */
        this.layers = null;

        /** Gets a collection of document art layers. */
        this.artSets = null;

        /** Gets a collection of document layer sets. */
        this.layerSets = null;

        /** Gets whether this document has been synced with the underlying Photoshop one. */
        this.synced = false;

        // Initialize document
        if (parent)
        {
            // Standard mode
            if (typeof document === 'number')
                this.id = document;
            else
                throw new Error('Search for the document in documents collection instead of creating a new one.');
        }
        else
        {
            // Standalone mode, get valid documentId
            if (arguments.length > 1)
            {
                // Add new document
                __documents.add.apply(null, Array.prototype.slice.call(arguments));
                this.id = __documents.prop('documentId'); // We're sure we have at least one document here, use documents.prop directly
            }
            else if (typeof document === 'number')
            {
                __documents.list.makeActive(document);
                this.id = document;
            }
            else if (document instanceof File)
            {
                __documents.open(document);
                this.id = __documents.list.getActiveDocumentId();
            }
            else if (typeof document === 'string' && document.length)
            {
                this.id = __documents.findFirst({ 'name': document });
            }
            else
            {
                this.id = __documents.list.getActiveDocumentId();
            }
        }

        if (!this.id || this.id < 0)
            throw new Error('No document is currently open, or the specified document could not be found.');

        // Immediately sync the document if in standalone mode
        if (!this.parent)
            this.sync();
    };

    Document.prototype = new DOMObject();
    Document.prototype.constructor = Document;
    Document.prototype._base = __documents;

    /**
     * Gets whether this document has a background layer.
     */
    Document.prototype.hasBackground = function ()
    {
        _assertActiveDocument(this);
        return __layers.hasBackground();
    };

    /**
     * Gets whether this document is currently active.
     */
    Document.prototype.isActive = function ()
    {
        if (this.parent)
            return this.parent.activeDocument() === this;
        else
            return this.id === __documents.prop('documentId');
    };

    /**
     * Gets history for this document.
     */
    Document.prototype.historyStates = function ()
    {
        return new HistoryStates(this);
    }

    /**
     * Gets or sets the currently active history state.
     */
    Document.prototype.activeHistoryState = function (historyState)
    {
        if (typeof historyState === 'undefined')
        {
            return new HistoryState(this, __history.getActiveHistoryId());
        }
        else
        {
            if (!(historyState instanceof HistoryState))
                throw new Error(['Invalid history state: "', historyState, '".'].join(''));

            __history.makeActive(historyState.historyId);
            return this;
        }
    };

    /**
     * Makes this document active.
     */
    Document.prototype.makeActive = function ()
    {
        if (this.parent)
            this.parent.activeDocument(this);
        else
            __documents.list.makeActive(this.id);
        return this;
    };

    /**
     * Refreshes document structure synchronizing it with the underlying document.
     */
    Document.prototype.sync = function (forced)
    {
        if (!forced && this.synced)
            return this;

        this.layerSets = new LayerSets(this, this);
        this.artLayers = new ArtLayers(this, this);
        this.layers = new Layers(this, this);
        this._cache = {};

        var lastParent = this,
            layer, type;

        // REVIEW: It seems that having a normal layer at the root of the
        // hierarchy instead of having only layer sets halves computation time.
        // This happens on CS6, untested on other versions.
        // Maybe it should be taken into consideration to add a root layer before
        // starting the forEach operation and remove it when it is complete.

        __layers.forEach(function (itemIndex, layerId)
        {
            type = __layers.prop(layerId, 'type');

            // To maintain layer order compatibility with standard DOM, layers
            // and layer sets are parsed backwards, that is from the
            // bottom of the layer stack towards the top.
            // This means that 'layerSectionEnd' starts a new set
            // and 'layerSectionStart' actually closes it.
            // Even if it's a little ackward, working this saves us
            // from the need of reversing the layers array afterwards
            // (that has a pretty heavy performance cost).
            switch (type)
            {
                case LayerType.SETSTART:
                    // End current working set
                    lastParent.id = layerId;

                    // Set working set to parent
                    lastParent = lastParent.parent.parent;
                    break;

                case LayerType.CONTENT:
                    // Create new art layer
                    layer = new ArtLayer(lastParent.artLayers, layerId);

                    // Add to parent layer and art layer lists
                    Array.prototype.push.call(lastParent.layers, layer);
                    Array.prototype.push.call(lastParent.artLayers, layer);
                    break;

                case LayerType.SETEND:
                    // Create new layer set
                    layer = new LayerSet(lastParent.layerSets, -1, layerId);

                    // Add to parent layer and layer set lists
                    Array.prototype.push.call(lastParent.layers, layer);
                    Array.prototype.push.call(lastParent.layerSets, layer);

                    // Make this the new working parent
                    lastParent = layer;
                    break;
            }
        }, this);

        this.synced = true;
        return this;
    };

    /** 
     * Gets all the layers or layers set that match the specified patterns
     * by performing a recursive search on the document.
     */
    Document.prototype.findAll = function (patterns, start)
    {
        if (typeof patterns !== 'object')
            throw new TypeError('patterns must be an object.');

        // Make sure document is in sync
        this.sync();

        var keys = Object.keys(patterns),
            keysLength = keys.length,
            result = [];

        function recursive(start)
        {
            if (start.layers.length)
            {
                var i, n, j, current, valid;

                for (i = 0, n = start.layers.length; i < n; i++)
                {
                    valid = true;
                    current = start.layers[i];

                    for (j = 0; j < keysLength; j++)
                    {
                        if (patterns[keys[j]] !== current.prop(keys[j]))
                        {
                            valid = false;
                            break;
                        }
                    }

                    if (valid)
                        result.push(current);

                    if (current.layerSets)
                        recursive(current);
                }
            }
        };

        if (!start || !start.layerSets)
            start = this;

        recursive(start, result);
        return result;
    };

    /**
     * Duplicates the document.
     * @param   [duplicateName]     Name of the document duplicate.
     * @param   [merge]             Whether to merge document layers.
     * @return  The DOM document object of the duplicated document.
     */
    Document.prototype.duplicate = function ()
    {
        _assertActiveDocument(this);
        __documents.duplicate.apply(null, Array.prototype.slice.call(arguments));
        var newDoc = new Document(this.parent);

        if (this.parent)
            Array.prototype.push.call(this.parent, newDoc);

        return newDoc;
    };

    /**
     * Flattens the document.
     */
    Document.prototype.flatten = function ()
    {
        _assertActiveDocument(this);
        __documents.flatten();
        this.sync(true);
        return this;
    };

    /**
     * Closes the document.
     * @param   [save]  Whether to save the document before closing it, defaults to false.
     */
    Document.prototype.close = function (save)
    {
        _assertActiveDocument(this);

        if (this.parent)
            this.parent.close(this);
        else
            __documents.close(save);
    };

    /** 
     * Saves the document.
     * @param   [saveOptions]   Save format options, defaults to Photoshop format if not specified.
     * @param   [saveIn]        If specified, document will be saved at this location. It can either be a File
     *                          object or a path string.
     * @param   [overwrite]     If 'saveIn' is specified and different from current file location, this parameter
     *                          indicates whether any existing files at the specified location should be overwritten.
     *                          If false or not specified an Error is raised if a file already exists at the specified
     *                          path.
     */
    Document.prototype.save = function (saveOptions, saveIn, overwrite)
    {
        __documents.save(saveOptions, saveIn, overwrite);
        return this;
    };

    /** 
     * Pastes the current clipboard contents into the document.
     * @param   [intoSelection]     Whether to paste clipboard contents into current selection.
     */
    Document.prototype.paste = function (intoSelection)
    {
        if (intoSelection)
            __selection.pasteInto();
        else
            __selection.paste();
        return this;
    };

    /**
     * Gets whether this document is saved to disk.
     * @return  True if the document is saved to disk; otherwise, false.
     */
    Document.prototype.isSaved = function ()
    {
        return this.prop('fullName') != null;
    };

}).call($.global);