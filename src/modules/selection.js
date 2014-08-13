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
    var selection = {};

    /**
     * Selects the whole canvas.
     * @return Chained reference to selection utilities.
     */
    selection.selectAll = function ()
    {
        var ref = new ActionReference();
        ref.putProperty(c2id('Chnl'), c2id('fsel'));
        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        desc.putEnumerated(c2id('T   '), c2id('Ordn'), c2id('Al  '));
        executeAction(c2id('setd'), desc, _dialogModesNo);
        return selection;
    };

    /**
     * Copies the current selection to clipboard.
     * @param {Boolean} [merged] If specified, the copy includes all visible layers.
     * @return Chained reference to selection utilities.
     */
    selection.copy = function (merged)
    {
        if (merged)
            executeAction(c2id('CpyM'), undefined, _dialogModesNo);
        else
            executeAction(c2id('copy'), undefined, _dialogModesNo);
        return selection;
    };

    /**
     * Pastes the current clipboard contents.
     * @return Chained reference to selection utilities.
     */
    selection.paste = function ()
    {
        var desc = new ActionDescriptor();
        desc.putEnumerated(c2id('AntA'), c2id('Annt'), c2id('Anno'));
        executeAction(c2id('past'), desc, _dialogModesNo);
        return selection;
    };

    /**
     * Pastes the current clipboard contents into the current selection.
     * @return Chained reference to selection utilities.
     */
    selection.pasteInto = function ()
    {
        var desc = new ActionDescriptor();
        desc.putEnumerated(c2id('AntA'), c2id('Annt'), c2id('Anno'));
        executeAction(c2id('PstI'), desc, _dialogModesNo);
        return selection;
    };

    /**
     * Pastes the current clipboard contents outside of the current selection.
     * @return Chained reference to selection utilities.
     */
    selection.pasteOutside = function ()
    {
        var desc = new ActionDescriptor();
        desc.putEnumerated(c2id('AntA'), c2id('Annt'), c2id('Anno'));
        executeAction(c2id('PstO'), desc, _dialogModesNo);
        return selection;
    };

    /** 
     * Creates a new document using clipboard content.
     * @param {String} [name] Document name.
     * @return Chained reference to selection utilities.
     */
    selection.pasteToNewDocument = function (name)
    {
        // Create document
        var desc = new ActionDescriptor();
        desc.putString(s2id('preset'), "Clipboard");

        if (typeof name === 'string' && name.length)
            desc3.putString(c2id('Nm  '), name);

        var desc2 = new ActionDescriptor();
        desc2.putObject(c2id('Nw  '), c2id('Dcmn'), desc);
        executeAction(c2id('Mk  '), desc2, _dialogModesNo);

        // Paste clipboard data
        selection.paste();

        // Flatten resulting document
        if (Lifter.documents)
            Lifter.documents.flatten();

        return selection;
    };

    /**
     * Clears the current selection. If nothing is selected, the currently active layer will be deleted instead.
     * @return Chained reference to selection utilities.
     */
    selection.clear = function ()
    {
        executeAction(c2id('Dlt '), undefined, _dialogModesNo);
        return selection;
    };

    /**
     * Deselects all.
     * @return Chained reference to selection utilities.
     */
    selection.deselect = function ()
    {
        var ref = new ActionReference();
        ref.putProperty(c2id('Chnl'), c2id('fsel'));
        var desc = new ActionDescriptor();
        desc.putReference(c2id('null'), ref);
        desc.putEnumerated(c2id('T   '), c2id('Ordn'), c2id('None'));
        executeAction(c2id('setd'), desc, _dialogModesNo);
        return selection;
    };

    // Public API
    /**
    * Contains low-level methods to work with selections without accessing Photoshop DOM.
    */
    Lifter.selection = selection;
}());