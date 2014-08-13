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
    var history = {};

    /** Puts the correct value in 'ref' to the get the history state specified by HistoryId. @private */
    function _getHistoryIdRef(historyId, ref)
    {
        if (typeof historyId !== 'number')
        {
            // If historyId is not passed, assume current history state
            ref.putEnumerated(c2id('HstS'), c2id('Ordn'), c2id('Trgt'));
        }
        else
        {
            // Use historyId directly
            ref.putIdentifier(c2id('HstS'), historyId);
        }
    };

    /** Traverse history in the specified direction, selecting the according history state. @private */
    function _traverseHistory(direction)
    {
        var ref = new ActionReference();
        ref.putEnumerated(c2id('HstS'), c2id('Ordn'), direction);
        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        executeAction(c2id('slct'), desc, _dialogModesNo);
        return this;
    };


    /**
    * Supported history state properties. This is public so that additional properties can be added at runtime.
    */
    history.supportedProperties = {
        'itemIndex': {
            typeId: c2id('ItmI'),
            type: DescValueType.INTEGERTYPE,
            set: false,
        },
        'historyId': {
            typeId: c2id('Idnt'),
            type: DescValueType.INTEGERTYPE,
            set: false,
        },
        'name': {
            typeId: c2id('Nm  '),
            type: DescValueType.STRINGTYPE,
            set: false,
        },
        'auto': {
            typeId: c2id('Auto'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
        'historyBrushSource': {
            typeId: c2id('HstB'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
        'currentHistoryState': {
            typeId: c2id('CrnH'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
    };

    /** 
     * Gets the number of history states for the currently active document.
     * @return Number of history states for the currently active document.
     */
    history.count = function ()
    {
        var ref = new ActionReference();
        ref.putProperty(c2id('Prpr'), c2id('Cnt '));
        ref.putEnumerated(c2id('HstS'), c2id('Ordn'), c2id('Trgt'));
        return executeActionGet(ref).getInteger(c2id('Cnt '));
    };

    /**
     * Gets the identifier of the history state identified by the passed ItemIndex.
     * @param {Number} itemIndex History state ItemIndex.
     * @return {Number} History state identifier.
     */
    history.getHistoryIdFromItemIndex = function (itemIndex)
    {
        var ref = new ActionReference();
        ref.putProperty(c2id('Prpr'), c2id('Idnt'));
        ref.putIndex(c2id('HstS'), itemIndex);
        return executeActionGet(ref).getInteger(c2id('Idnt'));
    };

    /**
     * Gets the identifier of the currently active history state.
     * @return {Number} HistoryId of the currently active history state.
     */
    history.getActiveHistoryId = function ()
    {
        return history.prop('historyId');
    };

    /**
     * Iterates over the history states stack, executing the specified callback on each element.
     * Please note: Adding or removing history states while iterating is not supported.
     * @param {Function} callback       Callback function. It is bound to context and invoked with two arguments (itemIndex, historyStateId).
     *                                  If callback returns true, iteration is stopped.
     * @param {Object} [context=null]   Callback function context.
     * @param {Boolean} [reverse=false] Whether to iterate from the end of the history states stack.
     * @return Chained reference to history utilities.
     */
    history.forEach = function (callback, context, reverse) // callback[, context[, reverse]]
    {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a valid function.');

        var n, i;

        if (reverse)
        {
            i = history.count() + 1;
            n = 0;

            while (--i > n)
            {
                if (callback.call(context, i, history.getHistoryIdFromItemIndex(i)))
                    break;
            }
        }
        else
        {
            n = history.count() + 1;
            i = 0;

            while (++i < n)
            {
                if (callback.call(context, i, history.getHistoryIdFromItemIndex(i)))
                    break;
            }
        }

        return history;
    };

    /**
     * Gets or sets the property with the given name on the specified history state. If invoked with no arguments
     * gets a wrapped ActionDescriptor containing all the properties of the specified history state.
     * @param {Number} [historyId] History state identifier, defaults to currently active history state if null or not specified.
     * @param {String} [name] Property name.
     * @param {Any} [value]Property value.
     * @return {Any, ActionDescriptor, Object}  Property value when getting a property, a wrapped ActionDescriptor when invoked with no arguments
     *                                          or a chained reference to document utilities when setting a property.
     */
    history.prop = function ()
    {
        // Parse args
        var historyId, name, value, ref, desc;

        if (typeof arguments[0] === 'number'
            || (!arguments[0] && arguments.length > 1))
        {
            historyId = arguments[0];
            name = arguments[1];
            value = arguments[2];
        }
        else
        {
            name = arguments[0];
            value = arguments[1];
        }

        if (typeof name === 'undefined')
        {
            // Get wrapped action descriptor
            ref = new ActionReference();
            _getHistoryIdRef(historyId, ref);
            desc = executeActionGet(ref);
            return _getWrappedActionDescriptor(desc, history.supportedProperties, historyId || desc.getInteger(c2id('Idnt')));
        }
        else
        {
            // Find property
            if (!history.supportedProperties.hasOwnProperty(name))
                throw new Error(['Invalid history state property: "', name, '".'].join(''));

            var prop = history.supportedProperties[name];

            if (typeof value === 'undefined')
            {
                // Get
                // Get ActionDescriptor for specified history state
                ref = new ActionReference();

                if (prop.typeId)
                    ref.putProperty(c2id('Prpr'), prop.typeId);

                _getHistoryIdRef(historyId, ref);
                desc = executeActionGet(ref);

                if (prop.get)
                {
                    // Use custom getter for this property
                    return prop.get.call(null, prop, historyId, desc);
                }
                else
                {
                    // Call getter for specific type
                    return _getDescriptorProperty(desc, prop.typeId, prop.type);
                }
            }
            else
            {
                // Set
                if (!prop.set)
                    throw new Error(['Property "', name, '" is read-only.'].join(''));;

                // Set value
                prop.set.call(null, prop, historyId, value);
                return history;
            }
        }
    };

    /**
     * Finds all the history states that match the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Array} An array containing find results.
     */
    history.findAll = _find.bind(null, history, 0);

    /**
     * Finds the first history state that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    history.findFirst = _find.bind(null, history, 1);

    /**
     * Finds the last history state that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    history.findLast = _find.bind(null, history, 2);

    /**
     * Sets the currently active history state to the one identified by the passed HistoryId.
     * @param {Number} historyId History state identifier.
     * @return Chained reference to history utilities.
     */
    history.makeActive = function (historyId)
    {
        if (typeof historyId !== 'number' || historyId < 1)
            throw new Error(['Invalid history state identifier: "', historyId, '".'].join(''));

        var ref = new ActionReference();
        ref.putIdentifier(c2id('HstS'), historyId);
        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        executeAction(c2id('slct'), desc, _dialogModesNo);
        return this;
    };

    /**
     * Sets the currently active history state to the one identified by the passed offset.
     * @param {Number} offset Offset from the last history state.
     * @return Chained reference to history utilities.
     */
    history.makeActiveByOffset = function (offset)
    {
        if (typeof offset !== 'number' || offset > 0)
            throw new Error(['Invalid history state offset: "', offset, '".'].join(''));

        var ref = new ActionReference();
        ref.putOffset(c2id('HstS'), offset);
        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        executeAction(c2id('slct'), desc, _dialogModesNo);
        return this;
    };

    /**
     * Sets the currently active history state to the previous one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makePreviousActive = _traverseHistory.bind(null, c2id('Prvs'));

    /**
     * Sets the currently active history state to the next one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeNextActive = _traverseHistory.bind(null, c2id('Nxt '));

    /**
     * Sets the currently active history state to the first one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeFirstActive = _traverseHistory.bind(null, c2id('Frst'));

    /**
     * Sets the currently active history state to the last one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeLastActive = _traverseHistory.bind(null, c2id('Lst '));

    /**
     * Duplicates the currently active history state, creating a new document from it.
     * @return Chained reference to history utilities.
     */
    history.duplicate = function ()
    {
        var ref = new ActionReference();
        ref.putClass(c2id('Dcmn'));

        var ref2 = new ActionReference();
        ref2.putProperty(c2id('HstS'), c2id('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        desc.putReference(c2id('Usng'), ref2);
        executeAction(c2id('Mk  '), desc, _dialogModesNo);
        return this;
    };

    /**
     * Deletes the specified history state.
     * @param {Number} [historyId] History state identifier, defaults to currently active history state if not provided.
     * @return Chained reference to history utilities.
     */
    history.remove = function (historyId)
    {
        var ref = new ActionReference();

        if (typeof historyId === 'number')
            ref.putIdentifer(c2id('HstS'), historyId);
        else
            ref.putProperty(c2id('HstS'), c2id('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        executeAction(c2id('Dlt '), desc, _dialogModesNo);
        return history;
    };

    /**
     * Creates a snapshot from the currently active history state.
     * @param {String} [snapshotName] Snapshot name.
     * @return Chained reference to history utilities.
     */
    history.createSnapshot = function (snapshotName)
    {
        var ref = new ActionReference();
        ref.putClass(c2id('SnpS'));

        var ref2 = new ActionReference();
        ref2.putProperty(c2id('HstS'), c2id('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        desc.putReference(c2id('From'), ref2);

        if (typeof snapshotName === 'string' && snapshotName.length)
            desc.putString(c2id('Nm  '), snapshotName);

        executeAction(c2id('Mk  '), desc, _dialogModesNo);
        return this;
    };

    /**
     * Makes the specified snapshot active.
     * @param {Number, String} snapshot Either an history state identifier or a snapshot name.
     * @return Chained reference to history utilities.
     */
    history.makeSnapshotActive = function (snapshot)
    {
        if (typeof snapshot !== 'number')
            snapshot = history.findFirst({ 'name': snapshot });

        return history.makeActive(snapshot);
    };

    /**
     * Deletes the specified snapshot.
     * @param {Number, String} snapshot Either an history state identifier or a snapshot name.
     * @return Chained reference to history utilities.
     */
    history.deleteSnapshot = function (snapshot)
    {
        var type = typeof snapshot,
            ref = new ActionReference();

        if (type === 'string' && snapshot.length)
            ref.putName(c2id('SnpS'), snapshot);
        else if (type === 'number' && snapshot > 0)
            ref.putIdentifier(c2id('SnpS'), snapshot);
        else
            throw new Error(['Invalid snapshot identifier or name: "', snapshot, '".'].join(''));

        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        executeAction(c2id('Dlt '), desc, _dialogModesNo);
        return history;
    };

    // Public API
    /**
    * Contains low-level methods to work with history without accessing Photoshop DOM.
    */
    Lifter.history = history;
}());