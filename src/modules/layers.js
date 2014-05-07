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

// TODO:
// - Property: grouped (complete support for creating grouped layers).
// - Property: kind (complete support for colorLookup).
// - Property: merge kind and type and add custom LifterLayerKind enumeration.
// - Property: textItem.
// - Property: linkedLayers.
// - Method: move layer!

; (function ()
{
    var layers = {};

    /** Utility object used to temporary hold data during heavy operations. @private */
    var _cache = {};

    /** Ensures the passed blendMode is expressed using the LifterBlendMode enumeration. @private */
    function _ensureLifterBlendMode(blendMode)
    {
        if (blendMode instanceof Enumerator)
            return blendMode;
        else
            return LifterBlendMode.fromBlendMode(blendMode);
    }

    /** Sets the passed layer as active, executes the specified callback and resets active layer to the old one. @private */
    function _wrapSwitchActive(layerId, callback)
    {
        // Store currently active layer
        var oldLayerId = layers.prop('layerId');

        // Set active layer to layerId
        if (layerId && oldLayerId !== layerId)
            layers.stack.makeActive(layerId);

        // Execute code
        callback.call(null);

        // Set active layer back to original
        if (layerId && oldLayerId !== layerId)
            layers.stack.makeActive(oldLayerId);
    };

    /** Gets a ActionDescriptor holding all the properties needed for the Make Layer action. @private */
    function _getMakeLayerDescriptor(name, opacity, blendMode, color)
    {
        // Set layer set properties
        var desc = new ActionDescriptor();

        // Name
        if (typeof name === 'string' && name.length)
            desc.putString(charIDToTypeID('Nm  '), name);

        // Opacity
        opacity = +opacity || 100.0;
        desc.putUnitDouble(charIDToTypeID('Opct'), charIDToTypeID('#Prc'), opacity);

        // Blend mode
        (blendMode && blendMode.valueOf) || (blendMode = BlendMode.NORMAL);
        desc.putEnumerated(charIDToTypeID('Md  '), charIDToTypeID('BlnM'), _ensureLifterBlendMode(blendMode).valueOf());

        // Color
        (color && color.valueOf) || (color = LayerColor.NONE);
        desc.putEnumerated(charIDToTypeID('Clr '), charIDToTypeID('Clr '), color.valueOf());

        return desc;
    };

    /** Puts the correct value in 'ref' to the get the layer specified by LayerId. @private */
    function _getLayerIdRef(layerId, ref)
    {
        if (typeof layerId !== 'number' || layerId === 0)
        {
            // If layerId is not passed, assume current layer
            // If layerId is 0 we're targeting the background layer in a document where background is the only layer
            // Use enumeration to get the background as getting it using LayerId directly will throw an error
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Use layerId directly
            ref.putIdentifier(charIDToTypeID('Lyr '), layerId);
        }
    };

    /** Puts the correct value in 'ref' to the get the layer specified by ItemIndex. @private */
    function _getItemIndexRef(itemIndex, ref)
    {
        if (typeof itemIndex !== 'number')
        {
            // If itemIndex is not passed, assume current layer
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else if (layers.count() === 0)
        {
            // Layer count is zero if the background layer is the only layer
            // present in the current document
            if (itemIndex !== 1)
                throw new Error(['Could not find layer with ItemIndex "', itemIndex, '".'].join(''));

            // Use enumeration to get the background as getting it using
            // ItemIndex directly will throw an error
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Check if document has a background layer and get correct ItemIndex
            if (layers.hasBackground())
                itemIndex--;

            // Use correct layer itemIndex
            ref.putIndex(charIDToTypeID('Lyr '), itemIndex);
        }

        return ref;
    };

    /** Traverse layer stack in the specified direction, returning the according layer identifier. @private */
    function _getStackId(direction)
    {
        // If only the background layer is present in document, just return background layerId
        if (layers.count() === 0)
        {
            return 0;
        }
        else
        {
            var ref = new ActionReference();
            ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('LyrI'));
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), direction);
            return executeActionGet(ref).getInteger(charIDToTypeID('LyrI'));
        }

        return layers;
    };

    /** Traverse layer stack in the specified direction, selecting the according layer. @private */
    function _traverseStack(direction)
    {
        // No need of setting the background layer active, it always is
        if (layers.count() === 0)
            return;

        layers.stack.makeActive(_getStackId(direction));
        return layers;
    }


    /**
     * Supported layer properties. This is public so that additional properties can be added at runtime.
     */
    layers.supportedProperties = {
        'itemIndex': {
            typeId: charIDToTypeID('ItmI'),
            type: DescValueType.INTEGERTYPE,
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set ItemIndex on background layer.');

                // Setting itemIndex moves the layer
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);

                var ref2 = new ActionReference();
                ref2.putIndex(charIDToTypeID('Lyr '), value);

                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                desc.putReference(charIDToTypeID('T   '), ref2);
                desc.putBoolean(charIDToTypeID('Adjs'), false);
                desc.putInteger(charIDToTypeID('Vrsn'), 5);
                executeAction(charIDToTypeID('move'), desc, _dialogModesNo);
            },
        },

        'layerId': { typeId: charIDToTypeID('LyrI'), type: DescValueType.INTEGERTYPE, set: false, },

        'name': {
            typeId: charIDToTypeID('Nm  '),
            type: DescValueType.STRINGTYPE,
            defaultValue: 'Layer',
            set: function (prop, layerId, value)
            {
                // Target layer must be active to change its name
                _wrapSwitchActive(layerId, function ()
                {
                    var ref = new ActionReference();
                    ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
                    var desc = new ActionDescriptor();
                    desc.putReference(charIDToTypeID('null'), ref);
                    var desc2 = new ActionDescriptor();
                    desc2.putString(prop.typeId, value);
                    desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                    executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                });
            },
        },

        'color': {
            typeId: charIDToTypeID('Clr '),
            type: DescValueType.ENUMERATEDTYPE,
            defaultValue: LayerColor.NONE,
            get: function (prop, layerId, desc)
            {
                // Parse color
                return Enumeration.fromValue(LayerColor, desc.getEnumerationValue(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Target layer must be active to change its color
                _wrapSwitchActive(layerId, function ()
                {
                    var ref = new ActionReference();
                    _getLayerIdRef(layerId, ref);
                    var desc = new ActionDescriptor();
                    desc.putReference(charIDToTypeID('null'), ref);
                    var desc2 = new ActionDescriptor();
                    desc2.putEnumerated(charIDToTypeID('Clr '), charIDToTypeID('Clr '), value.valueOf());
                    desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                    executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                });
            },
        },

        'visible': {
            typeId: charIDToTypeID('Vsbl'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: true,
            set: function (prop, layerId, value)
            {
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var list = new ActionList();
                list.putReference(ref);
                var desc = new ActionDescriptor();
                desc.putList(charIDToTypeID('null'), list);

                if (value)
                    executeAction(charIDToTypeID('Shw '), desc, _dialogModesNo);
                else
                    executeAction(charIDToTypeID('Hd  '), desc, _dialogModesNo);
            },
        },

        'opacity': {
            typeId: charIDToTypeID('Opct'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: 100.0,
            get: function (prop, layerId, desc)
            {
                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Layer must be visible to be able to apply opacity
                // or an error is thrown by AM
                var oldVisible = layers.prop(layerId, 'visible');

                if (!oldVisible)
                    layers.prop(layerId, 'visible', true);

                // Apply new opacity
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);

                // Reset visibility
                if (!oldVisible)
                    layers.prop(layerId, 'visible', false);
            },
        },

        'fillOpacity': {
            typeId: stringIDToTypeID('fillOpacity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: 100.0,
            get: function (prop, layerId, desc)
            {
                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Applying fill opacity to layer sets is not supported by Action Manager (nor by DOM).');

                // Layer must be visible to be able to apply fillOpacity
                // or an error is thrown by AM
                var oldVisible = layers.prop(layerId, 'visible');

                if (!oldVisible)
                    layers.prop(layerId, 'visible', true);

                // Apply new fillOpacity
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);

                // Reset visibility
                if (!oldVisible)
                    layers.prop(layerId, 'visible', false);
            },
        },

        'blendMode': {
            typeId: charIDToTypeID('Md  '),
            type: DescValueType.ENUMERATEDTYPE,
            defaultValue: BlendMode.NORMAL,
            get: function (prop, layerId, desc)
            {
                // Parse blend mode
                return Enumeration.fromValue(LifterBlendMode, desc.getEnumerationValue(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Passthrough is unsupported on layers, but does not throw an error,
                // thus no checks are implemented
                // Get value from LifterBlendMode enum
                value = _ensureLifterBlendMode(value).valueOf();

                // Set blend mode
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putEnumerated(prop.typeId, charIDToTypeID('BlnM'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'type': {
            typeId: stringIDToTypeID('layerSection'),
            type: DescValueType.ENUMERATEDTYPE,
            get: function (prop, layerId, desc)
            {
                var type = typeIDToStringID(desc.getEnumerationValue(prop.typeId));

                switch (type)
                {
                    case 'layerSectionStart': return LayerType.SETSTART;
                    case 'layerSectionEnd': return LayerType.SETEND;
                    case 'layerSectionContent': return LayerType.CONTENT;
                    default: throw new Error(['Unsupported layer type encountered: "', type, '".'].join(''));
                }
            },
            set: false,
        },

        'kind': {
            get: function (prop, layerId, desc)
            {
                // Based on:
                // http://www.ps-scripts.com/bb/viewtopic.php?f=9&t=5656
                // Throw error if layer set
                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Unable to get "kind" for layer sets.');

                if (desc.hasKey(stringIDToTypeID('textKey')))
                    return LayerKind.TEXT;

                // Includes LayerKind.VIDEO
                if (desc.hasKey(stringIDToTypeID('smartObject')))
                    return LayerKind.SMARTOBJECT;

                if (desc.hasKey(stringIDToTypeID('layer3D')))
                    return LayerKind.LAYER3D;

                var adjustmentType = stringIDToTypeID('adjustment');

                if (desc.hasKey(adjustmentType))
                {
                    var adjustmentKind = typeIDToStringID(desc.getList(adjustmentType).getClass(0));

                    switch (adjustmentKind)
                    {
                        case 'photoFilter': return LayerKind.PHOTOFILTER;
                        case 'solidColorLayer': return LayerKind.SOLIDFILL;
                        case 'gradientMapClass': return LayerKind.GRADIENTMAP;
                        case 'gradientMapLayer': return LayerKind.GRADIENTFILL;
                        case 'hueSaturation': return LayerKind.HUESATURATION;
                        case 'colorLookup': return; // This does not exist and throws an error
                        case 'colorBalance': return LayerKind.COLORBALANCE;
                        case 'patternLayer': return LayerKind.PATTERNFILL;
                        case 'invert': return LayerKind.INVERSION;
                        case 'posterization': return LayerKind.POSTERIZE;
                        case 'thresholdClassEvent': return LayerKind.THRESHOLD;
                        case 'blackAndWhite': return LayerKind.BLACKANDWHITE;
                        case 'selectiveColor': return LayerKind.SELECTIVECOLOR;
                        case 'vibrance': return LayerKind.VIBRANCE;
                        case 'brightnessEvent': return LayerKind.BRIGHTNESSCONTRAST;
                        case 'channelMixer': return LayerKind.CHANNELMIXER;
                        case 'curves': return LayerKind.CURVES;
                        case 'exposure': return LayerKind.EXPOSURE;

                        default:
                            // If none of the above, return adjustment kind as string
                            return adjustmentKind;
                    }
                }

                // If we get here normal should be the only choice left
                return LayerKind.NORMAL;
            },
            set: false,
        },

        'bounds': {
            typeId: stringIDToTypeID('bounds'),
            type: DescValueType.OBJECTTYPE,
            get: function (prop, layerId, desc)
            {
                var bounds = desc.getObjectValue(prop.typeId);

                // LayerBounds seems to be always saved in pixels,
                // but unit is loaded from document anyways
                return new LayerBounds(
                        bounds.getUnitDoubleValue(charIDToTypeID('Top ')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Left')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Btom')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Rght')),
                        bounds.getUnitDoubleType(charIDToTypeID('Top '))
                    );
            },
            set: false,
        },

        'group': { typeId: charIDToTypeID('Grup'), type: DescValueType.BOOLEANTYPE, set: false, },

        'hasLayerMask': { typeId: stringIDToTypeID('hasUserMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'layerMaskDensity': {
            typeId: stringIDToTypeID('userMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to get layer mask density: layer does not have a layer mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to set layer mask density: layer does not have a layer mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'layerMaskFeather': {
            typeId: stringIDToTypeID('userMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to get layer mask feather: layer does not have a layer mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to set layer mask feather: layer does not have a layer mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'hasVectorMask': { typeId: stringIDToTypeID('hasVectorMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'vectorMaskDensity': {
            typeId: stringIDToTypeID('vectorMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to get vector mask density: layer does not have a vector mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to set vector mask density: layer does not have a vector mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'vectorMaskFeather': {
            typeId: stringIDToTypeID('vectorMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to get vector mask feather: layer does not have a vector mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to set vector mask feather: layer does not have a vector mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'hasFilterMask': { typeId: stringIDToTypeID('hasFilterMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'filterMaskDensity': {
            typeId: stringIDToTypeID('filterMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to get filter mask density: layer does not have a filter mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to set filter mask density: layer does not have a filter mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'filterMaskFeather': {
            typeId: stringIDToTypeID('filterMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to get filter mask feather: layer does not have a layer mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to set filter mask feather: layer does not have a filter mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'allLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectAll'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                {
                    if (value)
                    {
                        // We tried to lock the background layer, throw error
                        throw new Error('Unable to set lock on background layer.');
                    }
                    else
                    {
                        // We tried to unlock the background layer, let's make it a normal layer (this changes active layer)
                        _wrapSwitchActive(layerId, layers.makeLayerFromBackground);
                    }
                }
                else
                {
                    // Target layer must be active to change its lock
                    _wrapSwitchActive(layerId, function ()
                    {
                        var ref = new ActionReference();
                        _getLayerIdRef(layerId, ref);
                        var desc = new ActionDescriptor();
                        desc.putReference(charIDToTypeID('null'), ref);

                        // Set lock object
                        var lock = new ActionDescriptor();
                        lock.putBoolean(stringIDToTypeID('protectAll'), value);

                        var desc2 = new ActionDescriptor();
                        desc2.putObject(prop.typeId, prop.typeId, lock);
                        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                    });
                }
            },
        },

        'pixelsLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectComposite'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set pixels lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Pixels lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectComposite'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'positionLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectPosition'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set position lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Position lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectPosition'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'transparentPixelsLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectTransparency'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set transparency lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Transparency lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectTransparency'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'isBackgroundLayer': {
            typeId: charIDToTypeID('Bckg'),
            type: DescValueType.BOOLEANTYPE,
            get: function (prop, layerId, desc)
            {
                return layerId === 0 || desc.getBoolean(prop.typeId);
            },
            set: false,
        },

        'xmpMetadata': { typeId: stringIDToTypeID('metadata'), type: DescValueType.OBJECTTYPE, set: false, },

        'lastModified': {
            typeId: stringIDToTypeID('metadata'), // lastModified is a child of xmpMetadata
            type: DescValueType.DOUBLETYPE,
            get: function (prop, layerId, desc)
            {
                var lastModified = new Date();
                lastModified.setTime(desc.getObjectValue(prop.typeId).getDouble(stringIDToTypeID('layerTime')) * 1000.0); // Time is stored in seconds
                return lastModified;
            },
            set: false,
        },
    };

    /** 
     * Gets the number of layers contained in the currently active document.
     * Please note: layer count will be zero if *only* the background layer is present in the document.
     * @return Layer count of the currently active document.
     */
    layers.count = function ()
    {
        if (_cache.hasOwnProperty('layerCount'))
            return _cache['layerCount'];

        // Get base count
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('NmbL'));
        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL'));

        // If document has background, add 1 to layer count
        if (count > 0)
        {
            if (_cache.hasOwnProperty('hasBackground'))
            {
                if (_cache['hasBackground'])
                    count++;
            }
            else
            {
                ref = new ActionReference();
                ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Bckg'));
                ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Back'));
                if (executeActionGet(ref).getBoolean(charIDToTypeID('Bckg')))
                    count++;
            }
        }

        return count;
    };

    /**
     * Gets the LayerId of the layer identified by the passed ItemIndex.
     * @return {Number} LayerId of the specified layer.
     */
    layers.getLayerIdByItemIndex = function (itemIndex)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('LyrI'));
        _getItemIndexRef(itemIndex, ref);
        return executeActionGet(ref).getInteger(charIDToTypeID('LyrI'));
    };

    /**
     * Gets whether a background layer currently exists.
     * @return {Boolean} True if a background layer is currently existing; otherwise, false.
     */
    layers.hasBackground = function ()
    {
        if (_cache.hasOwnProperty('hasBackground'))
            return _cache['hasBackground'];

        if (Lifter.layers.count() === 0)
        {
            // Layer count will be zero if *only* the background layer is
            // present in document
            return true;
        }
        else
        {
            var ref = new ActionReference();
            ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Bckg'));
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Back'));
            return executeActionGet(ref).getBoolean(charIDToTypeID('Bckg'));
        }
    };

    /** 
     * Adds a new layer to the currently active document.
     * @param {String} [name] Layer name. Pass null for default value.
     * @param {String} [opacity] Layer opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer blend mode. Pass null for default value.
     * @param {LayerColor} color Layer color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.add = function (name, opacity, blendMode, color)
    {
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('Lyr '));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('Usng'), charIDToTypeID('Lyr '), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Adds a new layer set to the currently active document.
     * @param {String} [name] Layer set name. Pass null for default value.
     * @param {String} [opacity] Layer set opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer set blend mode. Pass null for default value.
     * @param {LayerColor} color Layer set color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.addLayerSet = function (name, opacity, blendMode, color)
    {
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID('layerSection'));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('Usng'), stringIDToTypeID('layerSection'), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the specified layer from the currently active document.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.remove = function (layerId)
    {
        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Transforms the background of the current document in a normal layer.
     * @param {String} [name] Layer set name. Pass null for default value.
     * @param {String} [opacity] Layer set opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer set blend mode. Pass null for default value.
     * @param {LayerColor} color Layer set color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.makeLayerFromBackground = function (name, opacity, blendMode, color)
    {
        // Do nothing if we do not have a background
        if (!Lifter.layers.hasBackground())
            return;

        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Lyr '), charIDToTypeID('Bckg'));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
    };

    /**
     * Converts the specified layer to a smart object and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.convertToSmartObject = function (layerId)
    {
        layers.stack.makeActive(layerId);
        executeAction(stringIDToTypeID('newPlacedLayer'), undefined, _dialogModesNo);
        return layers;
    };

    /**
     * Duplicates the specified layer into the specified document.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Number} [documentId] Identifier of the document to copy the specified layer into. Defaults
     *                              to current document if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.duplicate = function (layerId, documentId)
    {
        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        if (documentId)
        {
            var ref2 = new ActionReference();
            ref.putIdentifier(charIDToTypeID('Dcmn'), documentId);
            desc.putReference(charIDToTypeID('T   '), ref2);
        }

        desc.putInteger(charIDToTypeID('Vrsn'), 5);
        executeAction(charIDToTypeID('Dplc'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Iterates over all layers contained in the current document, executing the specified callback on each element.
     * Please note: this iterates over ALL layers, including '</Layer group>', etc. Adding or removing layers
     * while iterating is not supported.
     * @param {Function} callback       Callback function. It is bound to context and invoked with two arguments (itemIndex, layerId).
     *                                  If callback returns true, iteration is stopped.
     * @param {Object} [context=null]   Callback function context.
     * @param {Boolean} [reverse=false] Whether to iterate from the end of the layer collection.
     * @return Chained reference to layer utilities.
     */
    layers.forEach = function (callback, context, reverse)
    {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a valid function.');

        var n, i;

        // Cache some information to speed up the operation
        _cache['hasBackground'] = layers.hasBackground();
        _cache['layerCount'] = layers.count();

        if (reverse)
        {
            i = _cache['layerCount'] + 1;
            n = 0;

            while (--i > n)
            {
                if (callback.call(context, i, layers.getLayerIdByItemIndex(i)))
                    break;
            }
        }
        else
        {
            n = _cache['layerCount'] + 1;
            i = 0;

            while (++i < n)
            {
                if (callback.call(context, i, layers.getLayerIdByItemIndex(i)))
                    break;
            }
        }

        // Cleanup cache
        delete _cache['hasBackground'];
        delete _cache['layerCount'];

        // Chaining
        return layers;
    };

    /**
     * Gets or sets the property with the given name on the specified layer. If invoked with no arguments
     * gets a wrapped ActionDescriptor containing all the properties of the specified layer.
     * @param {Number} [documentId] Layer identifier, defaults to currently active document if null or not specified.
     * @param {String} [name] Property name.
     * @param {Any} [value]Property value.
     * @return {Any, ActionDescriptor, Object}  Property value when getting a property, a wrapped ActionDescriptor when invoked with no arguments
     *                                          or a chained reference to document utilities when setting a property.
     */
    layers.prop = function ()
    {
        // Parse args
        var layerId, name, value, ref, desc;

        if (typeof arguments[0] === 'number'
            || (!arguments[0] && arguments.length > 1))
        {
            layerId = arguments[0];
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
            _getLayerIdRef(layerId, ref);
            desc = executeActionGet(ref);
            return _getWrappedActionDescriptor(desc, layers.supportedProperties, layerId || desc.getInteger(charIDToTypeID('LyrI')));
        }
        else
        {
            // Find property
            if (!layers.supportedProperties.hasOwnProperty(name))
                throw new Error(['Invalid layer property: "', name, '".'].join(''));

            var prop = layers.supportedProperties[name];

            if (typeof value === 'undefined')
            {
                // Get
                // Get ActionDescriptor for specified layer
                ref = new ActionReference();

                if (prop.typeId)
                    ref.putProperty(charIDToTypeID('Prpr'), prop.typeId);

                _getLayerIdRef(layerId, ref);
                desc = executeActionGet(ref);

                if (prop.get)
                {
                    // Use custom getter for this property
                    return prop.get.call(null, prop, layerId, desc);
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
                    throw new Error(['Property "', name, '" is read-only.'].join(''));

                if (layers.prop(layerId, 'type') === LayerType.SETEND)
                    throw new Error(['Setting properties on a layer of type ', LayerType.SETEND.toString(), ' is not supported.'].join(''));

                // Set value
                prop.set.call(null, prop, layerId, value);

                // Chaining
                return layers;
            }
        }
    };

    /**
     * Finds all the layers that match the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Array} An array containing find results.
     */
    layers.findAll = _find.bind(null, layers, 0);

    /**
     * Finds the first layer that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    layers.findFirst = _find.bind(null, layers, 1);

    /**
     * Finds the last layer that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    layers.findLast = _find.bind(null, layers, 2);


    // Stack
    /**
     * Provides methods to navigate across the layers stack.
     */
    layers.stack = {};

    /**
     * Gets the identifier of the currently active layer.
     * @return {Number} LayerId of the currently active layer.
     */
    layers.stack.getActiveLayerId = function ()
    {
        return layers.prop('layerId');
    };

    /**
     * Gets the identifier of the front layer.
     * @return {Number} LayerId of the front layer.
     */
    layers.stack.getFrontLayerId = _getStackId.bind(null, charIDToTypeID('Frnt'));

    /**
     * Gets the identifier of the bottom/background layer.
     * @return {Number} LayerId of the bottom layer.
     */
    layers.stack.getBottomLayerId = _getStackId.bind(null, charIDToTypeID('Back'));

    /**
     * Gets the identifier of the layer following the currently active one.
     * @return {Number} LayerId of the next layer.
     */
    layers.stack.getNextLayerId = _getStackId.bind(null, charIDToTypeID('Frwr'));

    /**
     * Gets the identifier of the layer preceding the currently active one.
     * @return {Number} LayerId of the previous layer.
     */
    layers.stack.getPreviousLayerId = _getStackId.bind(null, charIDToTypeID('Bckw'));

    /**
     * Sets the currently active layer to the one identified by the passed LayerId.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [makeVisible] Whether to make the layer RGB channels visible.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeActive = function ()
    {
        // Parse args
        var layerId, makeVisible;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            makeVisible = arguments[1] || false;
        }
        else
        {
            makeVisible = arguments[0] || false;
        }

        if (!layerId || layerId < 1)
            throw new Error(['Invalid layer identifier: "', layerId, '".'].join(''));

        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID('Lyr '), layerId);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Sets the currently active layer to the front layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeFrontActive = _traverseStack.bind(null, charIDToTypeID('Frnt'));

    /**
     * Sets the currently active layer to the bottom/background layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeBottomActive = _traverseStack.bind(null, charIDToTypeID('Back'));

    /**
     * Sets the currently active layer to the one following the currently active layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeNextActive = _traverseStack.bind(null, charIDToTypeID('Frwr'));

    /**
     * Sets the currently active layer to the one preceding the currently active layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makePreviousActive = _traverseStack.bind(null, charIDToTypeID('Bckw'));


    // Masks
    /**
     * Provides methods to work with masks on layer and layer sets.
     */
    layers.masks = {};

    /**
     * Adds a layer mask to the specified layer and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.addLayerMask = function (layerId)
    {
        // Abort if layer already has a layer mask
        if (layers.prop(layerId, 'hasLayerMask'))
            throw new Error('Unable to add layer mask: layer already has one.');

        // Make layer if we're targeting background
        if (layers.prop(layerId, 'isBackgroundLayer'))
            layers.makeLayerFromBackground();

        // Make sure target layer is active
        layers.stack.makeActive(layerId);

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));

        var desc = new ActionDescriptor();
        desc.putClass(charIDToTypeID('Nw  '), charIDToTypeID('Chnl'));
        desc.putReference(charIDToTypeID('At  '), ref);
        desc.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('UsrM'), charIDToTypeID('RvlA'));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Adds a vector mask to the specified layer and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.addVectorMask = function (layerId)
    {
        // Abort if layer already has a vector mask
        if (layers.prop(layerId, 'hasVectorMask'))
            throw new Error('Unable to add vector mask: layer already has one.');

        // Make layer if we're targeting background
        if (layers.prop(layerId, 'isBackgroundLayer'))
            layers.makeLayerFromBackground();

        // Make sure target layer is active
        layers.stack.makeActive(layerId);

        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('Path'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        desc.putReference(charIDToTypeID('At  '), ref2);
        desc.putEnumerated(charIDToTypeID('Usng'), stringIDToTypeID('vectorMaskEnabled'), charIDToTypeID('RvlA'));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the layer mask from the specified layer, optionally applying it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [apply] Whether to apply the mask to the layer.
     * @return Chained reference to layer utilities.
     */
    layers.masks.removeLayerMask = function ()
    {
        // Parse args
        var layerId, apply;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            apply = arguments[1] || false;
        }
        else
        {
            apply = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('Aply'), apply);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the vector mask from the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.removeVectorMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Refines the layer mask of the specified layer.
     * @param {Number} layerId Layer identifier, defaults to currently active layer if null.
     * @return Chained reference to layer utilities.
     */
    layers.masks.refineLayerMask = function (layerId, edgeBorderRadius, edgeBorderContrast, edgeSmooth, edgeFeatherRadius, edgeChoke, edgeAutoRadius, edgeDecontaminate)
    {
        // Parse args
        typeof edgeBorderRadius === 'number' || (edgeBorderRadius = 0.0);
        typeof edgeBorderContrast === 'number' || (edgeBorderContrast = 0.0);
        typeof edgeSmooth === 'number' || (edgeSmooth = 0);
        typeof edgeFeatherRadius === 'number' || (edgeFeatherRadius = 0.0);
        typeof edgeChoke === 'number' || (edgeChoke = 0.0);
        typeof edgeAutoRadius === 'boolean' || (edgeAutoRadius = false);
        typeof edgeDecontaminate === 'boolean' || (edgeDecontaminate = false);

        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        desc.putUnitDouble(stringIDToTypeID('refineEdgeBorderRadius'), charIDToTypeID('#Pxl'), Math.abs(edgeBorderRadius));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeBorderContrast'), idPrc, Math.abs(edgeBorderContrast));
        desc.putInteger(stringIDToTypeID('refineEdgeSmooth'), Math.abs(Math.ceil(edgeSmooth)));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeFeatherRadius'), charIDToTypeID('#Pxl'), Math.abs(edgeFeatherRadius));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeChoke'), charIDToTypeID('#Prc'), Math.abs(edgeChoke));
        desc.putBoolean(stringIDToTypeID('refineEdgeAutoRadius'), edgeAutoRadius);
        desc.putBoolean(stringIDToTypeID('refineEdgeDecontaminate'), edgeDecontaminate);
        desc.putEnumerated(stringIDToTypeID('refineEdgeOutput'), stringIDToTypeID('refineEdgeOutput'), stringIDToTypeID('refineEdgeOutputUserMask'));
        executeAction(stringIDToTypeID('refineSelectionEdge'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Makes the layer mask of the specified layer active so that drawing operations
     * can be performed on it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [makeVisible] Whether to make the layer mask visible.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeLayerMaskActive = function ()
    {
        // Parse args
        var layerId, makeVisible;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            makeVisible = arguments[1] || false;
        }
        else
        {
            makeVisible = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible ? true : false);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Toggle whether the layer mask of the specified layer is active so that drawing operations
     * can be performed on it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [active] Whether to make the vector mask active or inactive.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeVectorMaskActive = function ()
    {
        // Parse args
        var layerId, active, ref, desc;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            active = arguments[1] || false;
        }
        else
        {
            active = arguments[0] || false;
        }

        if (active)
        {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
            _getLayerIdRef(layerId, ref);

            desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID('null'), ref);
            executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        }
        else
        {
            ref = new ActionReference();
            ref.putClass(charIDToTypeID('Path'));
            _getLayerIdRef(layerId, ref);

            desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID('null'), ref);
            executeAction(charIDToTypeID('Dslc'), desc, _dialogModesNo);
        }

        return layers;
    };

    /**
     * Makes the RGB channels of the specified layer active so that drawing operations
     * can be performed on them.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [makeVisible] Whether to make the RGB channels visible.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeRGBActive = function ()
    {
        // Parse args
        var layerId, makeVisible;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            makeVisible = arguments[1] || false;
        }
        else
        {
            makeVisible = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('RGB '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Creates a selection from the layer mask of the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.selectLayerMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('T   '), ref2);
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Creates a selection from the vector mask of the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.selectVectorMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        _getLayerIdRef(layerId, ref2);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('T   '), ref2);

        desc.putInteger(charIDToTypeID('Vrsn'), 1);
        desc.putBoolean(stringIDToTypeID('vectorMaskParams'), true);
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
        return layers;
    };


    // Public API
    /**
     * Contains low-level methods to work with layers without accessing Photoshop DOM.
     *
     * Layers are identified by two numbers in Photoshop: LayerId and ItemIndex.
     *
     *  - LayerId: progressive 1-based unique integer identifier that does not change when the document is
     *             modified, open, saved or closed. When a layer is deleted, its LayerId won't be re-assigned
     *             to new layers. Background LayerId is a special case and it's always '0' if only the background
     *             layer is present in the document.
     *  - ItemIndex: a 1-based integer index that depends on layer position in hierarchy. It changes every
     *               time the layer is moved.
     *
     * The functions below use LayerId to get a valid reference to a layer. LayerIds are easier to work
     * with than ItemIndexes because are unique and does not changed based on whether a background
     * layer is present in the document (see below).
     *
     * Some brief notes about ItemIndexes: they behave differently when the background layer
     * is present in the document:
     *
     *  - with background: 'Background' = 1, 'Layer 1' = 2 ('Background' accessed with 0, 'Layer 1' accessed with 1)
     *  - without background: 'Layer 0' = 1, 'Layer 1' = 2 ('Layer 0' accessed with 1, 'Layer 1' accessed with 2)
     *
     * Also, when *only* the background layer is present in the document, getting a
     * reference to it via ItemIndex results in an error: it must be get using
     * Lyr -> Ordn -> Trgt enumeration value. No special actions are required when only one
     * non-background layer is present in the document. This is true for LayerIds too.
     */
    Lifter.layers = layers;
}());