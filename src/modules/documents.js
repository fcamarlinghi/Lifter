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
    var documents = {};

    /** List of all available color modes (aka color spaces), indexes match the ones of the DocumentMode enumeration. @private */
    var _documentColorModes = [
        -1, // Empty element as DocumentMode enumeration starts at index 1
        charIDToTypeID('Grsc'), // Grayscale
        charIDToTypeID('RGBC'), // RGB
        charIDToTypeID('CMYC'), // CMYK
        charIDToTypeID('LbCl'), // LAB
        charIDToTypeID('Btmp'), // Bitmap
        charIDToTypeID('Indl'), // Indexed Color
        charIDToTypeID('Mlth'), // Multichannel
        charIDToTypeID('Dtn '), // Duotone
    ];

    /** Sets the passed document as active and executes the specified callback. @private */
    function _wrapSwitchActive(documentId, callback, context)
    {
        // Set active layer to documentId
        documents.list.makeActive(documentId);

        // Execute code
        callback.call(context);
    };

    /** Puts the correct value in 'ref' to the get the document specified by DocumentId. @private */
    function _getDocumentIdRef(documentId, ref)
    {
        if (typeof documentId !== 'number')
        {
            // If DocumentId is not passed, assume current document
            if (documents.count() === 0)
                throw new Error('Could not target current document: no documents are currently open.');

            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Use DocumentId directly
            ref.putIdentifier(charIDToTypeID('Dcmn'), documentId);
        }
    };


    /**
     * Supported document properties. This is public so that additional properties can be added at runtime.
     */
    documents.supportedProperties = {
        'itemIndex': { typeId: charIDToTypeID('ItmI'), type: DescValueType.INTEGERTYPE, set: false, },

        'documentId': { typeId: charIDToTypeID('DocI'), type: DescValueType.INTEGERTYPE, set: false, },

        'width': {
            typeId: charIDToTypeID('Wdth'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(64, 'px'),
            get: function (prop, documentId, desc)
            {
                return new UnitValue(desc.getUnitDoubleValue(prop.typeId), 'px');
            },
            set: false,
        },

        'height': {
            typeId: charIDToTypeID('Hght'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(64, 'px'),
            get: function (prop, documentId, desc)
            {
                return new UnitValue(desc.getUnitDoubleValue(prop.typeId), 'px');
            },
            set: false,
        },

        'resolution': {
            typeId: charIDToTypeID('Rslt'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: 72,
            get: function (prop, documentId, desc)
            {
                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: false,
        },

        'name': { typeId: charIDToTypeID('Ttl '), type: DescValueType.STRINGTYPE, defaultValue: 'Untitled', set: false, },

        'bitsPerChannel': {
            typeId: charIDToTypeID('Dpth'),
            type: DescValueType.INTEGERTYPE,
            defaultValue: BitsPerChannelType.EIGHT,
            get: function (prop, documentId, desc)
            {
                var bitsPerChannel = desc.getInteger(prop.typeId);

                switch (bitsPerChannel)
                {
                    case 1: return BitsPerChannelType.ONE;
                    case 8: return BitsPerChannelType.EIGHT;
                    case 16: return BitsPerChannelType.SIXTEEN;
                    case 32: return BitsPerChannelType.THIRTYTWO;
                    default: throw new Error('Invalid bit depth: ' + bitsPerChannel + '.');
                }
            },
        },

        'mode': {
            typeId: charIDToTypeID('Md  '),
            type: DescValueType.ENUMERATEDTYPE,
            defaultValue: DocumentMode.RGB,
            get: function (prop, documentId, desc)
            {
                var mode = desc.getEnumerationValue(prop.typeId);

                switch (mode)
                {
                    case _documentColorModes[1]: return DocumentMode.GRAYSCALE;
                    case _documentColorModes[2]: return DocumentMode.RGB;
                    case _documentColorModes[3]: return DocumentMode.CMYK;
                    case _documentColorModes[4]: return DocumentMode.LAB;
                    case _documentColorModes[5]: return DocumentMode.BITMAP;
                    case _documentColorModes[6]: return DocumentMode.INDEXEDCOLOR;
                    case _documentColorModes[7]: return DocumentMode.MULTICHANNEL;
                    case _documentColorModes[8]: return DocumentMode.DUOTONE;
                    default: throw new Error('Invalid color mode: ' + typeIDToCharID(mode) + '.');
                }
            },
            set: function (prop, documentId, value)
            {
                _wrapSwitchActive(documentId, function ()
                {
                    var desc = new ActionDescriptor();

                    if (value === DocumentMode.BITMAP)
                    {
                        var desc2 = new ActionDescriptor();
                        desc2.putUnitDouble(charIDToTypeID('Rslt'), charIDToTypeID('#Rsl'), documents.prop('resolution'));
                        desc2.putEnumerated(charIDToTypeID('Mthd'), charIDToTypeID('Mthd'), charIDToTypeID('DfnD'));
                        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('BtmM'), desc2);
                        executeAction(charIDToTypeID('CnvM'), desc, _dialogModesNo);
                    }
                    else
                    {
                        var mode;

                        switch (value)
                        {
                            case DocumentMode.GRAYSCALE: mode = _documentColorModes[1];
                            case DocumentMode.RGB: mode = _documentColorModes[2];
                            case DocumentMode.CMYK: mode = _documentColorModes[3];
                            case DocumentMode.LAB: mode = _documentColorModes[4];
                            case DocumentMode.BITMAP: mode = _documentColorModes[5];
                            case DocumentMode.INDEXEDCOLOR: mode = _documentColorModes[6];
                            case DocumentMode.MULTICHANNEL: mode = _documentColorModes[7];
                            case DocumentMode.DUOTONE: mode = _documentColorModes[8];
                            default: throw new Error('Invalid color mode: ' + value + '.');
                        }

                        desc.putClass(charIDToTypeID('T   '), mode);
                        executeAction(charIDToTypeID('CnvM'), desc, _dialogModesNo);
                    }
                });
            },
        },

        'colorProfileName': {
            typeId: stringIDToTypeID('profile'),
            type: DescValueType.STRINGTYPE,
            defaultValue: 'sRGB IEC61966-2.1',
            set: function (prop, documentId, value)
            {
                _wrapSwitchActive(documentId, function ()
                {
                    var ref = new ActionReference();
                    _getDocumentIdRef(documentId, ref);
                    var desc = new ActionDescriptor();
                    desc.putReference(charIDToTypeID('null'), ref);
                    desc.putString(stringIDToTypeID('profile'), value);
                    executeAction(stringIDToTypeID('assignProfile'), desc, _dialogModesNo);
                });
            },
        },

        'format': {
            typeId: charIDToTypeID('Fmt '),
            type: DescValueType.STRINGTYPE,
            defaultValue: 'Photoshop',
            get: function (prop, documentId, desc)
            {
                if (!desc.hasKey(prop.typeId))
                    throw new Error('Unable to get "format". The document needs to be saved before accessing this property.');

                return new File(desc.getPath(prop.typeId));
            },
            set: false,
        },

        'isDirty': { typeId: charIDToTypeID('IsDr'), type: DescValueType.BOOLEANTYPE, defaultValue: false, set: false, },

        'pixelAspectRatio': { typeId: stringIDToTypeID('pixelScaleFactor'), type: DescValueType.UNITDOUBLE, defaultValue: 1, set: false, },

        'zoom': { typeId: charIDToTypeID('Zm  '), type: DescValueType.UNITDOUBLE, defaultValue: 1, set: false, },

        'xmpMetadata': {
            typeId: stringIDToTypeID('XMPMetadataAsUTF8'),
            type: DescValueType.STRINGTYPE,
            defaultValue: '',
            get: function (prop, documentId, desc)
            {
                // Get the data as XMPMeta object if XMP libraries are loaded
                // or as a simple UTF8 string otherwise
                var data = desc.getString(prop.typeId);
                return (typeof XMPMeta === 'function') ? new XMPMeta(data) : data;
            },
            set: function (prop, documentId, value)
            {
                // Serialize data if it's inside an XMPMeta object
                if (typeof value.serialize === 'function')
                    value = value.serialize();

                _wrapSwitchActive(documentId, function ()
                {
                    app.activeDocument.xmpMetadata.rawData = value;
                });
            },
        },

        'fullName': {
            typeId: charIDToTypeID('FilR'),
            type: DescValueType.ALIASTYPE,
            defaultValue: null,
            get: function (prop, documentId, desc)
            {
                if (!desc.hasKey(prop.typeId))
                    return null;
                else
                    return new File(desc.getPath(prop.typeId));
            },
            set: false,
        },
    };

    /** 
     * Gets the number of documents that are currently open.
     * @return {Number} Number of currently open documents.
     */
    documents.count = function ()
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('NmbD'));
        ref.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        return executeActionGet(ref).getInteger(charIDToTypeID('NmbD'));
    };

    /**
     * Gets the identifier of the document identified by the passed ItemIndex.
     * @param {Number} itemIndex Document ItemIndex.
     * @return {Number} Document identifier.
     */
    documents.getDocumentIdByItemIndex = function (itemIndex)
    {
        if (typeof itemIndex !== 'number' || itemIndex < 1)
            throw new Error(['Invalid itemIndex: "', itemIndex, '".'].join(''));

        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('DocI'));
        ref.putIndex(charIDToTypeID('Dcmn'), itemIndex);

        return executeActionGet(ref).getInteger(charIDToTypeID('DocI'));
    };

    /** 
     * Creates a new document.
     * @param {Number, UnitValue} width Document width.
     * @param {Number, UnitValue} height Document height.
     * @param {Number} [resolution=72] Document resolution.
     * @param {String} [name] Document name.
     * @param {NewDocumentMode} [mode=NewDocumentMode.RGB] Document color mode.
     * @param {DocumentFill, SolidColor} [initialFill=DocumentFill.WHITE] Document initial fill or a valid solid color.
     * @param {Number} [pixelAspectRatio=1.0] Document aspect ratio.
     * @param {BitsPerChannelType} [bitsPerChannel=BitsPerChannelType.EIGHT] Document channel depth.
     * @param {String} [colorProfileName] Document color profile.
     * @return Chained reference to document utilities.
     */
    documents.add = function (width, height, resolution, name, mode, initialFill, pixelAspectRatio, bitsPerChannel, colorProfileName)
    {
        // Parse parameters
        var desc = new ActionDescriptor();

        // Mode
        switch (mode)
        {
            case NewDocumentMode.GRAYSCALE: desc.putClass(charIDToTypeID('Md  '), charIDToTypeID('Grys')); break;
            case NewDocumentMode.CMYK: desc.putClass(charIDToTypeID('Md  '), charIDToTypeID('CMYM')); break;
            case NewDocumentMode.LAB: desc.putClass(charIDToTypeID('Md  '), charIDToTypeID('LbCM')); break;
            case NewDocumentMode.BITMAP: desc.putClass(charIDToTypeID('Md  '), charIDToTypeID('BtmM')); break;
            default: desc.putClass(charIDToTypeID('Md  '), charIDToTypeID('RGBM')); break; // Default to NewDocumentMode.RGB
        }

        // Name
        if (typeof name === 'string' && name.length)
            desc.putString(charIDToTypeID('Nm  '), name);

        // Width
        if ((typeof width !== 'number' || width < 0) && !(width instanceof UnitValue))
            throw new Error('Invalid width: ' + width);
        desc.putUnitDouble(charIDToTypeID('Wdth'), charIDToTypeID('#Pxl'), (width instanceof UnitValue) ? width.as('px') : width);

        // Height
        if ((typeof height !== 'number' || height < 0) && !(height instanceof UnitValue))
            throw new Error('Invalid height: ' + height);
        desc.putUnitDouble(charIDToTypeID('Hght'), charIDToTypeID('#Pxl'), (height instanceof UnitValue) ? height.as('px') : height);

        // Resolution
        desc.putUnitDouble(charIDToTypeID('Rslt'), charIDToTypeID('#Rsl'), (typeof resolution === 'number' && resolution > 0) ? resolution : 72);

        // Pixel aspect ratio
        desc.putDouble(stringIDToTypeID('pixelScaleFactor'), (typeof pixelAspectRatio === 'number' && pixelAspectRatio > 0) ? pixelAspectRatio : 1);

        // Initial fill
        initialFill || (initialFill = DocumentFill.WHITE);

        if (initialFill instanceof SolidColor)
        {
            // SolidColor
            desc.putEnumerated(charIDToTypeID('Fl  '), charIDToTypeID('Fl  '), charIDToTypeID('Clr '));
            var desc3 = new ActionDescriptor();
            desc3.putUnitDouble(charIDToTypeID('H   '), charIDToTypeID('#Ang'), initialFill.hsb.hue);
            desc3.putDouble(charIDToTypeID('Strt'), initialFill.hsb.saturation);
            desc3.putDouble(charIDToTypeID('Brgh'), initialFill.hsb.brightness);
            desc.putObject(charIDToTypeID('FlCl'), charIDToTypeID('HSBC'), desc3);
        }
        else
        {
            // DocumentFill
            switch (initialFill)
            {
                case DocumentFill.TRANSPARENT: desc.putEnumerated(charIDToTypeID('Fl  '), charIDToTypeID('Fl  '), charIDToTypeID('Trns')); break;
                case DocumentFill.BACKGROUNDCOLOR: desc.putEnumerated(charIDToTypeID('Fl  '), charIDToTypeID('Fl  '), charIDToTypeID('BckC')); break;
                default: desc.putEnumerated(charIDToTypeID('Fl  '), charIDToTypeID('Fl  '), charIDToTypeID('Wht ')); break; // Default to DocumentFill.WHITE
            }
        }

        // Color depth
        switch (bitsPerChannel)
        {
            case BitsPerChannelType.ONE: desc.putInteger(charIDToTypeID('Dpth'), 1); break;
            case BitsPerChannelType.SIXTEEN: desc.putInteger(charIDToTypeID('Dpth'), 16); break;
            case BitsPerChannelType.THIRTYTWO: desc.putInteger(charIDToTypeID('Dpth'), 32); break;
            default: desc.putInteger(charIDToTypeID('Dpth'), 8); break; // Default to BitsPerChannelType.EIGHT
        }

        // Color profile
        if (typeof colorProfileName === 'string' && colorProfileName.length)
            desc.putString(stringIDToTypeID('profile'), colorProfileName);

        // Create new document
        var desc2 = new ActionDescriptor();
        desc2.putObject(charIDToTypeID('Nw  '), charIDToTypeID('Dcmn'), desc);
        executeAction(charIDToTypeID('Mk  '), desc2, _dialogModesNo);
        return documents;
    };

    /** 
     * Opens the specified document.
     * @param {File,String} file Either a File object or a path as string indicating the file to open.
     * @return Chained reference to document utilities.
     */
    documents.open = function (file)
    {
        var desc = new ActionDescriptor();
        desc.putPath(charIDToTypeID('null'), _ensureFile(file));
        executeAction(charIDToTypeID('Opn '), desc, _dialogModesNo);
        return documents;
    };

    /** 
     * Saves the currently active document.
     * @param {String,File} [saveIn]        If specified, document will be saved at this location. It can either be a File
     *                                      object or a path string.
     * @param {Any} [options]               Save format options, defaults to Photoshop format if not specified.
     * @param {Boolean} [asCopy]            Saves the document as a copy, leaving the original open.
     * @param {Extension} [extensionType]   Appends the specified extension to the file name.
     * @param {Boolean} [overwrite]         If 'saveIn' is specified and different from current file location, this parameter
     *                                      indicates whether any existing files at the specified location should be overwritten.
     *                                      If false an Error is raised if a file already exists at the specified
     *                                      path.
     * @return Chained reference to document utilities.
     */
    documents.save = function (saveIn, options, asCopy, extensionType, overwrite)
    {
        if (documents.count() > 0)
        {
            if (arguments.length === 0)
            {
                app.activeDocument.save();
            }
            else
            {
                saveIn = _ensureFile(saveIn);

                if (overwrite === false, saveIn.exists && documents.prop('fileReference') !== saveIn)
                    throw new Error(['Another file already exists at the specified location: "', saveIn, '".'].join(''));

                app.activeDocument.saveAs(_ensureFile(saveIn), options, asCopy, extensionType);
            }
        }

        return documents;
    };

    /**
     * Closes the currently active document.
     * @param {SaveOptions} [save] Specifies whether changes should be saved before closing, defaults to false.
     * @return Chained reference to document utilities.
     */
    documents.close = function (save)
    {
        if (documents.count() > 0)
        {
            save || (save = SaveOptions.DONOTSAVECHANGES);
            app.activeDocument.close(save);
        }
        return documents;
    };

    /**
     * Iterates over the currently open documents, executing the specified callback on each element.
     * Please note: Adding or removing documents while iterating is not supported.
     * @param {Function} callback       Callback function. It is bound to context and invoked with two arguments (itemIndex, documentId).
     *                                  If callback returns true, iteration is stopped.
     * @param {Object} [context=null]   Callback function context.
     * @param {Boolean} [reverse=false] Whether to iterate from the end of the documents collection.
     * @return Chained reference to document utilities.
     */
    documents.forEach = function (callback, context, reverse) // callback[, context[, reverse]]
    {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a valid function.');

        var n, i;

        if (reverse)
        {
            i = documents.count() + 1;
            n = 0;

            while (--i > n)
            {
                if (callback.call(context, i, documents.getDocumentIdByItemIndex(i)))
                    break;
            }
        }
        else
        {
            n = documents.count() + 1;
            i = 0;

            while (++i < n)
            {
                if (callback.call(context, i, documents.getDocumentIdByItemIndex(i)))
                    break;
            }
        }

        return documents;
    };

    /**
     * Gets or sets the property with the given name on the specified document. If invoked with no arguments
     * gets a wrapped ActionDescriptor containing all the properties of the specified document.
     * @param {Number} [documentId] Document identifier, defaults to currently active document if null or not specified.
     * @param {String} [name] Property name.
     * @param {Any} [value]Property value.
     * @return {Any, ActionDescriptor, Object}  Property value when getting a property, a wrapped ActionDescriptor when invoked with no arguments
     *                                          or a chained reference to document utilities when setting a property.
     */
    documents.prop = function () // [documentId[, name[, value]]
    {
        // Parse args
        var documentId, name, value, ref, desc;

        if (typeof arguments[0] === 'number'
            || (!arguments[0] && arguments.length > 1))
        {
            // Use specified documentId
            documentId = arguments[0];
            name = arguments[1];
            value = arguments[2];
        }
        else
        {
            // Use current document
            name = arguments[0];
            value = arguments[1];
        }

        if (typeof name === 'undefined')
        {
            // Get wrapped action descriptor
            ref = new ActionReference();
            _getDocumentIdRef(documentId, ref);
            desc = executeActionGet(ref);
            return _getWrappedActionDescriptor(desc, documents.supportedProperties, documentId || desc.getInteger(charIDToTypeID('DocI')));
        }
        else
        {
            // Find required property
            if (!documents.supportedProperties.hasOwnProperty(name))
                throw new Error(['Invalid document property: "', name, '".'].join(''));

            var prop = documents.supportedProperties[name];

            if (typeof value === 'undefined')
            {
                // Get
                // Get ActionDescriptor for specified document
                ref = new ActionReference();

                if (prop.typeId)
                    ref.putProperty(charIDToTypeID('Prpr'), prop.typeId);

                _getDocumentIdRef(documentId, ref);
                desc = executeActionGet(ref);

                if (prop.get)
                {
                    // Use custom getter for this property
                    return prop.get.call(null, prop, documentId, desc);
                }
                else
                {
                    // Call generic getter
                    return _getDescriptorProperty(desc, prop.typeId, prop.type);
                }
            }
            else
            {
                // Set
                if (!prop.set)
                    throw new Error(['Property "', name, '" is read-only.'].join(''));

                // Set value
                prop.set.call(null, prop, documentId, value);

                // Chaining
                return documents;
            }
        }
    };

    /**
     * Resizes the currently active document. Supports scale styles (Document.resizeImage does not).
     * @param {Number} width  New width. If height is not specified an uniform scaling is applied.
     * @param {Number} [height] New height, defaults to original document height.
     * @param {Number} [resolution] New resolution, defaults to original document resolution.
     * @param {ResampleMethod} [resampleMethod=ResampleMethod.BICUBICAUTOMATIC] Scaling resample method.
     * @param {Boolean} [scaleStyles=true] Whether to scale styles (only available when using uniform scaling).
     * @return Chained reference to document utilities.
     */
    documents.resizeImage = function (width, height, resolution, resampleMethod, scaleStyles)
    {
        // Get original document values
        var originalWidth = documents.prop('width');
        var originalHeight = documents.prop('height');
        var originalResolution = documents.prop('resolution');

        // Get resize values
        if (typeof width === 'number')
            width = new UnitValue(width, 'px');
        else if (!(width instanceof UnitValue))
            width = originalWidth;

        if (typeof height === 'number')
        {
            height = new UnitValue(height, 'px');
        }
        else if (!(height instanceof UnitValue))
        {
            if (width.type === '%')
            {
                // If width is specified in percentage use uniform scaling
                height = new UnitValue(width.value, '%');
                height.baseUnit = new UnitValue(originalHeight.as('px'), 'px');
            }
            else
            {
                height = originalHeight;
            }
        }

        resolution = typeof resolution === 'number' ? resolution : originalResolution;
        typeof scaleStyles === 'boolean' || (scaleStyles = true);

        // Early exit if image is not modified
        if (width === originalWidth
            && height === originalHeight
            && resolution === originalResolution)
            return documents;

        var desc = new ActionDescriptor();

        if (width === height)
        {
            // Constrain proportions
            desc.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Pxl"), width.as('px'));
            desc.putBoolean(charIDToTypeID("CnsP"), true);

            // Scale styles
            desc.putBoolean(stringIDToTypeID("scaleStyles"), scaleStyles);
        }
        else
        {
            // Non-uniform scaling
            desc.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Pxl"), width.as('px'));
            desc.putUnitDouble(charIDToTypeID("Hght"), charIDToTypeID("#Pxl"), height.as('px'));
        }

        // Resolution
        if (resolution !== originalResolution)
            desc.putUnitDouble(charIDToTypeID("Rslt"), charIDToTypeID("#Rsl"), resolution);

        // Resample method
        switch (resampleMethod)
        {
            case ResampleMethod.NEARESTNEIGHBOR: resampleMethod = stringIDToTypeID("nearestNeighbor"); break;
            case ResampleMethod.BILINEAR: resampleMethod = stringIDToTypeID("bilinear"); break;
            case ResampleMethod.BICUBIC: resampleMethod = stringIDToTypeID("bicubic"); break;
            case ResampleMethod.BICUBICSHARPER: resampleMethod = stringIDToTypeID("bicubicSharper"); break;
            case ResampleMethod.BICUBICSMOOTHER: resampleMethod = stringIDToTypeID("bicubicSmoother"); break;
            default: resampleMethod = stringIDToTypeID("bicubicAutomatic"); break;
        }
        desc.putEnumerated(charIDToTypeID("Intr"), charIDToTypeID("Intp"), resampleMethod);

        // Resize
        executeAction(charIDToTypeID("ImgS"), desc, _dialogModesNo);
        return documents;
    };

    /**
     * Duplicates the currently active document.
     * @param {String} [duplicateName] Name of the document duplicate.
     * @param {Boolean} [merge] Whether to merge document layers.
     * @return Chained reference to document utilities.
     */
    documents.duplicate = function (duplicateName, merge)
    {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        if (typeof duplicateName === 'string' && duplicateName.length)
            desc.putString(charIDToTypeID('Nm  '), duplicateName);

        if (merge)
            desc.putBoolean(charIDToTypeID('Mrgd'), true);

        executeAction(charIDToTypeID('Dplc'), desc, _dialogModesNo);
        return documents;
    };

    /**
     * Flattens the currently active document.
     * @return Chained reference to document utilities.
     */
    documents.flatten = function ()
    {
        executeAction(charIDToTypeID('FltI'), undefined, _dialogModesNo);
        return documents;
    };

    /**
     * Finds all the documents that match the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Array} An array containing find results.
     */
    documents.findAll = _find.bind(null, documents, 0);

    /**
     * Finds the first document that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    documents.findFirst = _find.bind(null, documents, 1);

    /**
     * Finds the last document that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    documents.findLast = _find.bind(null, documents, 2);

    /**
     * Sets the currently active document to the specified one.
     * @param {Number} documentId Document identifier.
     * @return Chained reference to document utilities.
     */
    documents.makeActive = function (documentId)
    {
        if (typeof documentId !== 'number')
            throw new Error(['Invalid document identifier: ', documentId, '.'].join(''));

        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID('Dcmn'), documentId);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);

        // Chaining
        return documents;
    };

    /**
     * Gets the unique identifier of the currently active document.
     * @return {Number} Unique identifier of the currently active document.
     */
    documents.getActiveDocumentId = function ()
    {
        if (documents.count() < 1)
            return -1;
        else
            return documents.prop('documentId');
    };

    /**
     * Gets the DOM representation of the currently active document.
     * @return {Document} The DOM representation of the currently active document, or null if no documents are open.
     */
    documents.toDOM = function ()
    {
        if (documents.count() < 1)
            return null;
        else
            return app.activeDocument;
    };

    // Public API
    /**
     * Contains low-level methods to work with documents without accessing
     * Photoshop DOM.
     *
     * Documents are identified by two numbers in Photoshop: DocumentId and ItemIndex.
     *
     *  - DocumentId: progressive 1-based integer identifier that is guaranteed to be unique for the current
     *                Photoshop work session. This is used in the functions.
     *  - ItemIndex: a 1-based integer index that is assigned when documents are open and closed. It is not
     *               linked in any way with windows location in UI: document with ItemIndex = 0 is not
     *               guaranteed to be the leftmost one in UI.
     */
    Lifter.documents = documents;
}());